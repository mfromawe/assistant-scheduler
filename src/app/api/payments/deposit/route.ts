import { NextResponse } from "next/server";
import { z } from "zod";
import { createDepositCheckout } from "@/lib/payments";

const schema = z.object({
  appointmentId: z.string().min(1)
});

export async function POST(request: Request) {
  const payload = schema.parse(await request.json());
  const payment = await createDepositCheckout(payload.appointmentId);

  return NextResponse.json({ payment });
}
