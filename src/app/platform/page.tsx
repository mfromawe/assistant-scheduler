import { AppShell } from "@/components/AppShell";
import { getDictionary } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PlatformPage() {
  const { t } = getDictionary(process.env.DEFAULT_LOCALE);
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          appointments: true,
          conversations: true,
          customers: true,
          users: true
        }
      }
    }
  });

  const totals = tenants.reduce(
    (acc, tenant) => ({
      appointments: acc.appointments + tenant._count.appointments,
      conversations: acc.conversations + tenant._count.conversations,
      customers: acc.customers + tenant._count.customers
    }),
    { appointments: 0, conversations: 0, customers: 0 }
  );

  return (
    <AppShell locale={process.env.DEFAULT_LOCALE}>
      <section className="main">
        <div className="topbar">
          <div>
            <p className="eyebrow">{t("platform.eyebrow")}</p>
            <h1>{t("platform.title")}</h1>
          </div>
        </div>

        <section className="grid cols-3">
          <article className="card metric">{t("platform.tenants")}<strong>{tenants.length}</strong></article>
          <article className="card metric">{t("platform.totalAppointments")}<strong>{totals.appointments}</strong></article>
          <article className="card metric">{t("platform.totalCustomers")}<strong>{totals.customers}</strong></article>
        </section>

        <section className="card platform-table">
          <table className="table">
            <thead>
              <tr>
                <th>{t("platform.company")}</th>
                <th>{t("platform.status")}</th>
                <th>{t("platform.plan")}</th>
                <th>{t("platform.isolation")}</th>
                <th>{t("platform.users")}</th>
                <th>{t("platform.customerCount")}</th>
                <th>{t("platform.appointmentCount")}</th>
                <th>{t("platform.messageCount")}</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant.id}>
                  <td>
                    {tenant.name}
                    <br />
                    <span className="muted-text">/{tenant.slug}</span>
                  </td>
                  <td><span className="badge green">{tenant.status}</span></td>
                  <td>{tenant.plan}</td>
                  <td>{tenant.isolationMode}</td>
                  <td>{tenant._count.users}</td>
                  <td>{tenant._count.customers}</td>
                  <td>{tenant._count.appointments}</td>
                  <td>{tenant._count.conversations}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </section>
    </AppShell>
  );
}
