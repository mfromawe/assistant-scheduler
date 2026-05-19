import { Channel } from "@prisma/client";
import { assertAppointmentSlotAvailable, parseAppointmentStart } from "@/lib/appointment-validation";
import { prisma } from "@/lib/prisma";
import { buildVerificationMessage, sendMessage } from "@/lib/messaging";

export type AppointmentDraftInput = {
  tenantSlug: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  startsAt: string;
  channel: Channel;
  notes?: string;
};

export async function createAppointmentDraft(input: AppointmentDraftInput) {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: input.tenantSlug },
    include: { services: true }
  });

  if (!tenant) {
    throw new Error("Tenant not found");
  }

  const service = tenant.services.find((item) => item.id === input.serviceId);

  if (!service) {
    throw new Error("Service not found");
  }

  const customer = await prisma.customer.upsert({
    where: {
      tenantId_phone: {
        tenantId: tenant.id,
        phone: input.customerPhone
      }
    },
    update: {
      name: input.customerName,
      phone: input.customerPhone
    },
    create: {
      id: `${tenant.id}:${input.customerPhone}`,
      tenantId: tenant.id,
      name: input.customerName,
      phone: input.customerPhone,
      whatsappId: input.channel === "WHATSAPP" ? input.customerPhone : null
    }
  });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const startsAt = parseAppointmentStart(input.startsAt);
  const endsAt = await assertAppointmentSlotAvailable({
    tenantId: tenant.id,
    startsAt,
    durationMinutes: service.durationMinutes
  });
  const depositRequired = service.depositAmount > 0;

  const appointment = await prisma.appointment.create({
    data: {
      tenantId: tenant.id,
      customerId: customer.id,
      serviceId: service.id,
      channel: input.channel,
      startsAt,
      endsAt,
      status: "PENDING_VERIFICATION",
      paymentStatus: depositRequired ? "PENDING" : "NOT_REQUIRED",
      verificationCode: code,
      notes: input.notes,
      depositAmount: service.depositAmount
    },
    include: {
      customer: true,
      service: true
    }
  });

  await sendMessage({
    channel: input.channel,
    to: input.customerPhone,
    body: buildVerificationMessage(code)
  });

  return appointment;
}

export async function confirmAppointment(appointmentId: string, code: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId }
  });

  if (!appointment || appointment.verificationCode !== code) {
    throw new Error("Invalid verification code");
  }

  const requiresPayment = appointment.depositAmount > 0;

  return prisma.appointment.update({
    where: { id: appointment.id },
    data: {
      status: requiresPayment ? "PAYMENT_PENDING" : "CONFIRMED",
      paymentStatus: requiresPayment ? "PENDING" : "NOT_REQUIRED",
      verificationCode: null
    }
  });
}
