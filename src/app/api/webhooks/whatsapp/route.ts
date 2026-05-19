import { NextRequest, NextResponse } from "next/server";
import { analyzeIncomingMessage } from "@/lib/conversation-ai";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/tenant";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const value = payload?.entry?.[0]?.changes?.[0]?.value;
  const message = value?.messages?.[0];
  const contact = value?.contacts?.[0];

  if (!message) {
    return NextResponse.json({ received: true });
  }

  const tenant = await getTenantContext();

  if (!tenant) {
    return NextResponse.json({ received: true, warning: "No tenant configured" });
  }

  const phone = message.from;
  const customer = await prisma.customer.upsert({
    where: { tenantId_phone: { tenantId: tenant.id, phone } },
    update: {
      name: contact?.profile?.name ?? phone,
      phone,
      whatsappId: phone
    },
    create: {
      id: `${tenant.id}:${phone}`,
      tenantId: tenant.id,
      name: contact?.profile?.name ?? phone,
      phone,
      whatsappId: phone
    }
  });

  const conversation = await prisma.conversation.create({
    data: {
      tenantId: tenant.id,
      customerId: customer.id,
      channel: "WHATSAPP",
      externalId: message.id,
      messages: {
        create: {
          direction: "inbound",
          body: message.text?.body ?? "[non-text message]"
        }
      }
    }
  });
  const ai = await analyzeIncomingMessage({
    channel: "WHATSAPP",
    locale: tenant.locale,
    timezone: tenant.timezone,
    body: message.text?.body ?? ""
  });

  return NextResponse.json({ received: true, conversationId: conversation.id, ai });
}
