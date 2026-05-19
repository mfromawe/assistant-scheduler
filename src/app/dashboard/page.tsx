import { addDays, differenceInMinutes, format, getHours, startOfWeek } from "date-fns";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock, MessageCircle, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n";
import { getTenantContext } from "@/lib/tenant";

export const dynamic = "force-dynamic";

const hours = Array.from({ length: 12 }, (_, index) => index + 8);
const channelClass = {
  WEB: "event-web",
  WHATSAPP: "event-whatsapp",
  INSTAGRAM: "event-instagram",
  PHONE: "event-phone"
};

function getEventStyle(startsAt: Date, endsAt: Date) {
  const top = Math.max(0, (startsAt.getMinutes() / 60) * 72);
  const height = Math.max(34, (differenceInMinutes(endsAt, startsAt) / 60) * 72 - 6);

  return { top, height };
}

export default async function DashboardPage() {
  const tenant = await getTenantContext();
  const { dateFnsLocale, t } = getDictionary(tenant.locale);
  const [appointments, customers, conversations, services] = await Promise.all([
    prisma.appointment.findMany({
      where: { tenantId: tenant.id },
      orderBy: { startsAt: "asc" },
      include: { customer: true, service: true },
      take: 40
    }),
    prisma.customer.count({ where: { tenantId: tenant.id } }),
    prisma.conversation.count({ where: { tenantId: tenant.id } }),
    prisma.service.findMany({ where: { tenantId: tenant.id, isActive: true }, orderBy: { name: "asc" } })
  ]);

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const confirmed = appointments.filter((item) => item.status === "CONFIRMED").length;

  return (
    <div className="calendar-app">
      <aside className="calendar-rail">
        <Link className="create-button" href="/book/demo-clinic">+ Olustur</Link>

        <section className="mini-calendar">
          <div className="mini-calendar-title">{format(new Date(), "MMMM yyyy", { locale: dateFnsLocale })}</div>
          <div className="mini-calendar-grid">
            {["P", "S", "C", "P", "C", "C", "P"].map((day, index) => (
              <span key={`${day}-${index}`} className="mini-day-name">{day}</span>
            ))}
            {weekDays.map((day) => (
              <span className="mini-date" key={day.toISOString()}>{format(day, "d")}</span>
            ))}
          </div>
        </section>

        <section className="calendar-panel">
          <h3>{t("calendar.channels")}</h3>
          <label><span className="dot whatsapp" /> WhatsApp</label>
          <label><span className="dot instagram" /> Instagram</label>
          <label><span className="dot web" /> Web</label>
          <label><span className="dot phone" /> Telefon</label>
        </section>

        <section className="calendar-panel">
          <h3>{t("calendar.services")}</h3>
          {services.map((service) => (
            <label key={service.id}><span className="checkmark" /> {service.name}</label>
          ))}
        </section>
      </aside>

      <section className="calendar-workspace">
        <div className="calendar-toolbar">
          <div className="toolbar-left">
            <Link className="button secondary" href="/book/demo-clinic">{t("calendar.today")}</Link>
            <button className="icon-button" aria-label={t("calendar.previousWeek")}><ChevronLeft size={18} /></button>
            <button className="icon-button" aria-label={t("calendar.nextWeek")}><ChevronRight size={18} /></button>
            <h1>{format(weekStart, "MMMM yyyy", { locale: dateFnsLocale })}</h1>
          </div>
          <div className="toolbar-right">
            <div className="search-box"><Search size={16} /> {t("calendar.search")}</div>
            <button className="view-pill">{t("calendar.week")}</button>
          </div>
        </div>

        <div className="calendar-summary">
          <div><strong>{appointments.length}</strong><span>{t("calendar.totalAppointments")}</span></div>
          <div><strong>{confirmed}</strong><span>{t("calendar.confirmed")}</span></div>
          <div><strong>{customers}</strong><span>{t("calendar.customers")}</span></div>
          <div><strong>{conversations}</strong><span>{t("calendar.messages")}</span></div>
        </div>

        <div className="week-calendar">
          <div className="time-gutter header-cell" />
          {weekDays.map((day) => (
            <div className="day-header" key={day.toISOString()}>
              <span>{format(day, "EEE", { locale: dateFnsLocale })}</span>
              <strong>{format(day, "d")}</strong>
            </div>
          ))}

          <div className="calendar-body">
            <div className="time-rail">
              {hours.map((hour) => (
                <div className="time-gutter" key={`time-${hour}`}>{`${hour}:00`}</div>
              ))}
            </div>

            <div className="days-grid">
              {weekDays.map((day) => (
                <div className="day-column" key={day.toISOString()}>
                  {hours.map((hour) => (
                    <div className="hour-slot" key={`${day.toISOString()}-${hour}`} />
                  ))}
                  {appointments
                    .filter((appointment) => format(appointment.startsAt, "yyyy-MM-dd") === format(day, "yyyy-MM-dd"))
                    .filter((appointment) => getHours(appointment.startsAt) >= 8 && getHours(appointment.startsAt) < 20)
                    .map((appointment) => (
                      <article
                        className={`calendar-event ${channelClass[appointment.channel]}`}
                        key={appointment.id}
                        style={getEventStyle(appointment.startsAt, appointment.endsAt)}
                      >
                        <strong>{format(appointment.startsAt, "HH:mm")} {appointment.customer.name}</strong>
                        <span>{appointment.service.name}</span>
                        <small><MessageCircle size={12} /> {appointment.channel}</small>
                      </article>
                    ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="timeline-footer">
          <Clock size={16} />
          {t("calendar.footer")}
        </div>
      </section>
    </div>
  );
}
