import type { Appointment, CalendarConnection } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type CalendarEventPayload = {
  title: string;
  description?: string;
  startsAt: Date;
  endsAt: Date;
  timezone: string;
};

export type CalendarProviderAdapter = {
  createEvent(connection: CalendarConnection, payload: CalendarEventPayload): Promise<{ externalEventId: string; externalCalendarId?: string }>;
  updateEvent(connection: CalendarConnection, externalEventId: string, payload: CalendarEventPayload): Promise<void>;
  deleteEvent(connection: CalendarConnection, externalEventId: string): Promise<void>;
};

const notConfiguredAdapter: CalendarProviderAdapter = {
  async createEvent(connection) {
    return {
      externalEventId: `mock-${connection.provider.toLowerCase()}-${crypto.randomUUID()}`,
      externalCalendarId: connection.calendarId ?? undefined
    };
  },
  async updateEvent() {},
  async deleteEvent() {}
};

export function getCalendarAdapter() {
  return notConfiguredAdapter;
}

export async function syncAppointmentToConnectedCalendars(appointment: Appointment) {
  const connections = await prisma.calendarConnection.findMany({
    where: {
      tenantId: appointment.tenantId,
      syncEnabled: true,
      status: "CONNECTED",
      OR: [{ staffMemberId: appointment.staffMemberId }, { staffMemberId: null }]
    },
    include: { tenant: true }
  });

  await Promise.all(
    connections.map(async (connection) => {
      const adapter = getCalendarAdapter();
      const result = await adapter.createEvent(connection, {
        title: "Appointment",
        startsAt: appointment.startsAt,
        endsAt: appointment.endsAt,
        timezone: connection.tenant.timezone
      });

      await prisma.calendarEventMapping.upsert({
        where: {
          calendarConnectionId_externalEventId: {
            calendarConnectionId: connection.id,
            externalEventId: result.externalEventId
          }
        },
        update: { lastSyncedAt: new Date() },
        create: {
          tenantId: appointment.tenantId,
          appointmentId: appointment.id,
          calendarConnectionId: connection.id,
          provider: connection.provider,
          externalEventId: result.externalEventId,
          externalCalendarId: result.externalCalendarId,
          lastSyncedAt: new Date()
        }
      });
    })
  );
}
