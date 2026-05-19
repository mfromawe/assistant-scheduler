import type { Channel } from "@prisma/client";

export type MessageIntent =
  | { type: "BOOK_APPOINTMENT"; requestedDateText?: string; serviceText?: string }
  | { type: "RESCHEDULE_APPOINTMENT"; requestedDateText?: string }
  | { type: "CANCEL_APPOINTMENT" }
  | { type: "GENERAL_MESSAGE" };

export type ConversationAiInput = {
  channel: Channel;
  locale: string;
  timezone: string;
  body: string;
};

export type ConversationAiResult = {
  intent: MessageIntent;
  confidence: number;
  replyDraft?: string;
  requiresHumanReview: boolean;
};

const appointmentKeywords = ["randevu", "appointment", "booking", "rezervasyon"];
const cancelKeywords = ["iptal", "cancel"];
const rescheduleKeywords = ["degistir", "ertele", "reschedule", "change"];

export async function analyzeIncomingMessage(input: ConversationAiInput): Promise<ConversationAiResult> {
  const body = input.body.toLowerCase();

  if (cancelKeywords.some((keyword) => body.includes(keyword))) {
    return {
      intent: { type: "CANCEL_APPOINTMENT" },
      confidence: 0.7,
      replyDraft: input.locale === "en" ? "I can help with cancellation. Can you confirm your appointment details?" : "Iptal icin yardimci olabilirim. Randevu bilgilerinizi onaylar misiniz?",
      requiresHumanReview: true
    };
  }

  if (rescheduleKeywords.some((keyword) => body.includes(keyword))) {
    return {
      intent: { type: "RESCHEDULE_APPOINTMENT" },
      confidence: 0.65,
      replyDraft: input.locale === "en" ? "Which new date and time would you prefer?" : "Hangi yeni tarih ve saati tercih edersiniz?",
      requiresHumanReview: true
    };
  }

  if (appointmentKeywords.some((keyword) => body.includes(keyword))) {
    return {
      intent: { type: "BOOK_APPOINTMENT" },
      confidence: 0.7,
      replyDraft: input.locale === "en" ? "I can help you book an appointment. Which service and time would you prefer?" : "Randevu olusturmak icin yardimci olabilirim. Hangi hizmet ve saat uygundur?",
      requiresHumanReview: false
    };
  }

  return {
    intent: { type: "GENERAL_MESSAGE" },
    confidence: 0.4,
    requiresHumanReview: true
  };
}
