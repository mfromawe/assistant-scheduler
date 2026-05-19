import { NextResponse } from "next/server";
import { analyzeIncomingMessage } from "@/lib/conversation-ai";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/tenant";

export async function POST(request: Request) {
  const payload = await request.json();
  const tenant = await getTenantContext();

  if (!tenant) {
    return NextResponse.json({ received: true, warning: "No tenant configured" });
  }

  const entry = payload?.entry?.[0];
  const messaging = entry?.messaging?.[0];
  const senderId = messaging?.sender?.id ?? "unknown";
  const body = messaging?.message?.text ?? "[instagram event]";

  const customer = await prisma.customer.upsert({
    where: { tenantId_phone: { tenantId: tenant.id, phone: `ig:${senderId}` } },
    update: { instagramId: senderId },
    create: {
      id: `${tenant.id}:ig:${senderId}`,
      tenantId: tenant.id,
      name: `Instagram ${senderId}`,
      phone: `ig:${senderId}`,
      instagramId: senderId
    }
  });

  const conversation = await prisma.conversation.create({
    data: {
      tenantId: tenant.id,
      customerId: customer.id,
      channel: "INSTAGRAM",
      externalId: senderId,
      messages: {
        create: {
          direction: "inbound",
          body
        }
      }
    }
  });
  const ai = await analyzeIncomingMessage({
    channel: "INSTAGRAM",
    locale: tenant.locale,
    timezone: tenant.timezone,
    body
  });

  return NextResponse.json({ received: true, conversationId: conversation.id, ai });
}
