import { enUS, tr } from "date-fns/locale";

export const supportedLocales = ["tr", "en"] as const;

export type AppLocale = (typeof supportedLocales)[number];

type TranslationKey =
  | "app.description"
  | "nav.overview"
  | "nav.appointments"
  | "nav.inbox"
  | "nav.outreach"
  | "nav.customers"
  | "nav.admin"
  | "nav.platform"
  | "nav.newAppointment"
  | "calendar.today"
  | "calendar.previousWeek"
  | "calendar.nextWeek"
  | "calendar.week"
  | "calendar.search"
  | "calendar.channels"
  | "calendar.services"
  | "calendar.totalAppointments"
  | "calendar.confirmed"
  | "calendar.customers"
  | "calendar.messages"
  | "calendar.footer"
  | "platform.eyebrow"
  | "platform.title"
  | "platform.tenants"
  | "platform.totalAppointments"
  | "platform.totalCustomers"
  | "platform.company"
  | "platform.status"
  | "platform.plan"
  | "platform.isolation"
  | "platform.users"
  | "platform.customerCount"
  | "platform.appointmentCount"
  | "platform.messageCount";

const dictionaries: Record<AppLocale, Record<TranslationKey, string>> = {
  tr: {
    "app.description": "Randevu, takvim ve musteri iletisim sistemi",
    "nav.overview": "Genel Bakis",
    "nav.appointments": "Randevular",
    "nav.inbox": "Mesajlar",
    "nav.outreach": "Outreach",
    "nav.customers": "Musteriler",
    "nav.admin": "Yonetim",
    "nav.platform": "Platform",
    "nav.newAppointment": "Randevu",
    "calendar.today": "Bugun",
    "calendar.previousWeek": "Onceki hafta",
    "calendar.nextWeek": "Sonraki hafta",
    "calendar.week": "Hafta",
    "calendar.search": "Musteri veya randevu ara",
    "calendar.channels": "Kanallar",
    "calendar.services": "Hizmetler",
    "calendar.totalAppointments": "Toplam randevu",
    "calendar.confirmed": "Onayli",
    "calendar.customers": "Musteri",
    "calendar.messages": "Mesaj",
    "calendar.footer": "Randevu onaylari WhatsApp/Instagram akisi uzerinden dogrulama kodu ve gerekirse on odeme ile tamamlanir.",
    "platform.eyebrow": "Platform yonetimi",
    "platform.title": "Firmalar",
    "platform.tenants": "Firma",
    "platform.totalAppointments": "Toplam randevu",
    "platform.totalCustomers": "Toplam musteri",
    "platform.company": "Firma",
    "platform.status": "Durum",
    "platform.plan": "Plan",
    "platform.isolation": "Izolasyon",
    "platform.users": "Kullanicilar",
    "platform.customerCount": "Musteri",
    "platform.appointmentCount": "Randevu",
    "platform.messageCount": "Mesaj"
  },
  en: {
    "app.description": "Scheduling, calendar, and customer communication system",
    "nav.overview": "Overview",
    "nav.appointments": "Appointments",
    "nav.inbox": "Inbox",
    "nav.outreach": "Outreach",
    "nav.customers": "Customers",
    "nav.admin": "Admin",
    "nav.platform": "Platform",
    "nav.newAppointment": "Appointment",
    "calendar.today": "Today",
    "calendar.previousWeek": "Previous week",
    "calendar.nextWeek": "Next week",
    "calendar.week": "Week",
    "calendar.search": "Search customers or appointments",
    "calendar.channels": "Channels",
    "calendar.services": "Services",
    "calendar.totalAppointments": "Total appointments",
    "calendar.confirmed": "Confirmed",
    "calendar.customers": "Customers",
    "calendar.messages": "Messages",
    "calendar.footer": "Appointment confirmations are completed through WhatsApp/Instagram verification codes and deposits when required.",
    "platform.eyebrow": "Platform management",
    "platform.title": "Companies",
    "platform.tenants": "Companies",
    "platform.totalAppointments": "Total appointments",
    "platform.totalCustomers": "Total customers",
    "platform.company": "Company",
    "platform.status": "Status",
    "platform.plan": "Plan",
    "platform.isolation": "Isolation",
    "platform.users": "Users",
    "platform.customerCount": "Customers",
    "platform.appointmentCount": "Appointments",
    "platform.messageCount": "Messages"
  }
};

export function normalizeLocale(locale?: string | null): AppLocale {
  return supportedLocales.includes(locale as AppLocale) ? (locale as AppLocale) : "tr";
}

export function getDictionary(locale?: string | null) {
  const appLocale = normalizeLocale(locale);

  return {
    locale: appLocale,
    dateFnsLocale: appLocale === "en" ? enUS : tr,
    t: (key: TranslationKey) => dictionaries[appLocale][key]
  };
}
