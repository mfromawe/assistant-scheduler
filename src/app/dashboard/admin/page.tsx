import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const tenantContext = await getTenantContext();
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantContext.id },
    include: { services: true, locations: true, staff: true, users: true, channelIntegrations: true }
  });

  return (
    <>
      <div className="topbar">
        <div>
          <p className="eyebrow">Yonetici paneli</p>
          <h1>Firma Ayarlari</h1>
        </div>
      </div>
      <section className="grid cols-2">
        <div className="card">
          <h2>Firma</h2>
          <p>{tenant?.name ?? "Firma yok"}</p>
          <p>Sektor: {tenant?.sector ?? "-"}</p>
          <p>Dil: {tenant?.locale ?? "-"} / Saat dilimi: {tenant?.timezone ?? "-"}</p>
        </div>
        <div className="card">
          <h2>Entegrasyonlar</h2>
          {tenant?.channelIntegrations.map((integration) => (
            <p key={integration.id}>
              <span className={`badge ${integration.status === "CONNECTED" ? "green" : "orange"}`}>{integration.provider}</span>{" "}
              {integration.displayName}
            </p>
          ))}
          <p><span className="badge orange">Stripe</span> on odeme hazir</p>
        </div>
        <div className="card">
          <h2>Hizmetler</h2>
          {tenant?.services.map((service) => (
            <p key={service.id}>{service.name} - {service.durationMinutes} dk - {service.depositAmount / 100} {service.currency}</p>
          ))}
        </div>
        <div className="card">
          <h2>Personel ve subeler</h2>
          <p>Personel: {tenant?.staff.map((staff) => staff.name).join(", ")}</p>
          <p>Subeler: {tenant?.locations.map((location) => location.name).join(", ")}</p>
        </div>
      </section>
    </>
  );
}
