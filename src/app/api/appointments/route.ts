import { NextResponse } from "next/server";
import { z } from "zod";
import { createAppointmentDraft } from "@/lib/appointments";

const schema = z.object({
  tenantSlug: z.string().min(2),
  customerName: z.string().min(2),
  customerPhone: z.string().min(6),
  serviceId: z.string().min(1),
  startsAt: z.string().datetime(),
  channel: z.enum(["WEB", "WHATSAPP", "INSTAGRAM", "PHONE"]).default("WEB"),
  notes: z.string().optional()
});

export async function POST(request: Request) {
  const payload = schema.parse(await request.json());
  const appointment = await createAppointmentDraft(payload);
  const safeAppointment = Object.fromEntries(
    Object.entries(appointment).filter(([key]) => key !== "verificationCode")
  );

  return NextResponse.json({ appointment: safeAppointment });
}
