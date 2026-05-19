import { Channel } from "@prisma/client";

type SendMessageInput = {
  channel: Channel;
  to: string;
  body: string;
};

export async function sendMessage(input: SendMessageInput) {
  if (input.channel === "WHATSAPP" && process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
    const response = await fetch(
      `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: input.to,
          type: "text",
          text: { body: input.body }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`WhatsApp message failed: ${response.status}`);
    }
  }

  return {
    provider: input.channel.toLowerCase(),
    delivered: true,
    mocked: !process.env.WHATSAPP_ACCESS_TOKEN
  };
}

export function buildVerificationMessage(code: string) {
  return `Randevunuzu onaylamak icin kodunuz: ${code}. Bu kodu paylasarak randevu talebinizi tamamlayabilirsiniz.`;
}
