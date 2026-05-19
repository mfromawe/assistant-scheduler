import { format } from "date-fns";
import { Activity, Link2, MessageCircle, Send } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/tenant";

export const dynamic = "force-dynamic";

const statusClass: Record<string, string> = {
  CONNECTED: "green",
  ACTIVE: "green",
  QUALIFIED: "green",
  CONTACTED: "blue",
  REPLIED: "blue",
  DRAFT: "orange",
  scheduled: "orange",
  sent: "green",
  failed: "red"
};

export default async function OutreachPage() {
  const tenant = await getTenantContext();
  const [leads, campaigns, activities, integrations, leadCount, contactedCount] = await Promise.all([
    prisma.outreachLead.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: "desc" },
      take: 25
    }),
    prisma.outreachCampaign.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { leads: true, activities: true } } },
      take: 10
    }),
    prisma.outreachActivity.findMany({
      where: { tenantId: tenant.id },
      orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
      include: { lead: true, campaign: true },
      take: 10
    }),
    prisma.channelIntegration.findMany({
      where: { tenantId: tenant.id },
      orderBy: { provider: "asc" }
    }),
    prisma.outreachLead.count({ where: { tenantId: tenant.id } }),
    prisma.outreachLead.count({ where: { tenantId: tenant.id, status: { in: ["CONTACTED", "REPLIED", "BOOKED"] } } })
  ]);

  return (
    <>
      <div className="topbar">
        <div>
          <p className="eyebrow">Cold / hot reach</p>
          <h1>Outreach Merkezi</h1>
        </div>
      </div>

      <section className="grid cols-3">
        <div className="card metric">
          Google Places lead havuzu
          <strong>{leadCount}</strong>
        </div>
        <div className="card metric">
          Iletisime gecilen
          <strong>{contactedCount}</strong>
        </div>
        <div className="card metric">
          Aktif entegrasyon
          <strong>{integrations.filter((item) => item.status === "CONNECTED").length}</strong>
        </div>
      </section>

      <section className="grid cols-2 outreach-grid">
        <div className="card">
          <h2><Link2 size={18} /> Entegrasyon Haritasi</h2>
          <div className="integration-list">
            {integrations.map((integration) => (
              <div className="integration-row" key={integration.id}>
                <div>
                  <strong>{integration.displayName}</strong>
                  <p>{integration.provider}{integration.webhookUrl ? ` - ${integration.webhookUrl}` : ""}</p>
                </div>
                <span className={`badge ${statusClass[integration.status] ?? "orange"}`}>{integration.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2><Send size={18} /> Kampanyalar</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Kampanya</th>
                <th>Kanal</th>
                <th>Lead</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.id}>
                  <td>{campaign.name}<br /><span className="muted-text">{campaign.objective ?? "-"}</span></td>
                  <td>{campaign.defaultChannel}</td>
                  <td>{campaign._count.leads}</td>
                  <td><span className={`badge ${statusClass[campaign.status] ?? "orange"}`}>{campaign.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card outreach-section">
        <h2><MessageCircle size={18} /> Lead Havuzu</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Firma</th>
              <th>Konum</th>
              <th>Kategori</th>
              <th>Puan</th>
              <th>Iletisim</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>{lead.name}<br /><span className="muted-text">{lead.address ?? lead.googleMapsUrl ?? "-"}</span></td>
                <td>{lead.city ?? "-"}</td>
                <td>{lead.category ?? "-"}</td>
                <td>{lead.rating ?? "-"}{lead.reviewCount ? ` / ${lead.reviewCount}` : ""}</td>
                <td>{lead.phone ?? lead.email ?? lead.website ?? "-"}</td>
                <td><span className={`badge ${statusClass[lead.status] ?? "orange"}`}>{lead.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card outreach-section">
        <h2><Activity size={18} /> Planli Iletisim</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Lead</th>
              <th>Kampanya</th>
              <th>Kanal</th>
              <th>Zaman</th>
              <th>Mesaj</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => (
              <tr key={activity.id}>
                <td>{activity.lead?.name ?? "-"}</td>
                <td>{activity.campaign?.name ?? "-"}</td>
                <td>{activity.channel}</td>
                <td>{activity.scheduledAt ? format(activity.scheduledAt, "dd.MM.yyyy HH:mm") : "-"}</td>
                <td>{activity.body}</td>
                <td><span className={`badge ${statusClass[activity.status] ?? "orange"}`}>{activity.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
