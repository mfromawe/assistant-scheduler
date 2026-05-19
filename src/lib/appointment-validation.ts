import { addMinutes, isValid } from "date-fns";
import { prisma } from "@/lib/prisma";

const activeStatuses = ["PENDING_VERIFICATION", "PAYMENT_PENDING", "CONFIRMED"] as const;

export function parseAppointmentStart(value: string) {
  const startsAt = new Date(value);

  if (!isValid(startsAt)) {
    throw new Error("Invalid appointment date");
  }

  if (startsAt.getTime() < Date.now()) {
    throw new Error("Appointment date must be in the future");
  }

  return startsAt;
}

export async function assertAppointmentSlotAvailable(input: {
  tenantId: string;
  startsAt: Date;
  durationMinutes: number;
  staffMemberId?: string | null;
}) {
  const endsAt = addMinutes(input.startsAt, input.durationMinutes);
  const conflict = await prisma.appointment.findFirst({
    where: {
      tenantId: input.tenantId,
      status: { in: [...activeStatuses] },
      startsAt: { lt: endsAt },
      endsAt: { gt: input.startsAt },
      OR: [{ staffMemberId: input.staffMemberId ?? null }, { staffMemberId: null }]
    },
    select: { id: true }
  });

  if (conflict) {
    throw new Error("Appointment slot is not available");
  }

  return endsAt;
}
