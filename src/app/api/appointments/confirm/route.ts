import { NextResponse } from "next/server";
import { z } from "zod";
import { confirmAppointment } from "@/lib/appointments";

const schema = z.object({
  appointmentId: z.string().min(1),
  code: z.string().length(6)
});

export async function POST(request: Request) {
  const payload = schema.parse(await request.json());
  const appointment = await confirmAppointment(payload.appointmentId, payload.code);

  return NextResponse.json({ appointment });
}
