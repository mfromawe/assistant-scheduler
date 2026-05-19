import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export async function createDepositCheckout(appointmentId: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { service: true, customer: true }
  });

  if (!appointment || appointment.depositAmount <= 0) {
    throw new Error("Appointment does not require a deposit");
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return prisma.payment.upsert({
      where: { appointmentId },
      update: {
        amount: appointment.depositAmount,
        currency: appointment.service.currency,
        provider: "mock",
        status: "PENDING",
        checkoutUrl: `/appointments/${appointmentId}/mock-payment`
      },
      create: {
        appointmentId,
        amount: appointment.depositAmount,
        currency: appointment.service.currency,
        provider: "mock",
        status: "PENDING",
        checkoutUrl: `/appointments/${appointmentId}/mock-payment`
      }
    });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: appointment.customer.email ?? undefined,
    line_items: [
      {
        price_data: {
          currency: appointment.service.currency.toLowerCase(),
          unit_amount: appointment.depositAmount,
          product_data: {
            name: `${appointment.service.name} on odeme`
          }
        },
        quantity: 1
      }
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=cancelled`,
    metadata: { appointmentId }
  });

  return prisma.payment.upsert({
    where: { appointmentId },
    update: {
      provider: "stripe",
      providerRef: session.id,
      checkoutUrl: session.url,
      status: "PENDING"
    },
    create: {
      appointmentId,
      amount: appointment.depositAmount,
      currency: appointment.service.currency,
      provider: "stripe",
      providerRef: session.id,
      checkoutUrl: session.url,
      status: "PENDING"
    }
  });
}
