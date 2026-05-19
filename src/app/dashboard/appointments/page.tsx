import { format } from "date-fns";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function AppointmentsPage() {
  const tenant = await getTenantContext();
  const appointments = await prisma.appointment.findMany({
    where: { tenantId: tenant.id },
    orderBy: { startsAt: "asc" },
    include: { customer: true, service: true, payment: true }
  });

  return (
    <>
      <div className="topbar">
        <div>
          <p className="eyebrow">Takvim</p>
          <h1>Randevular</h1>
        </div>
        <Link className="button" href="/book/demo-clinic">Randevu Olustur</Link>
      </div>
      <section className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Musteri</th>
              <th>Hizmet</th>
              <th>Zaman</th>
              <th>Kanal</th>
              <th>Onay</th>
              <th>Odeme</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>{appointment.customer.name}<br />{appointment.customer.phone}</td>
                <td>{appointment.service.name}</td>
                <td>{format(appointment.startsAt, "dd.MM.yyyy HH:mm")}</td>
                <td>{appointment.channel}</td>
                <td><span className="badge blue">{appointment.status}</span></td>
                <td><span className="badge orange">{appointment.paymentStatus}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
