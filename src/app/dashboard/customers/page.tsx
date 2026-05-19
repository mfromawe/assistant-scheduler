import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const tenant = await getTenantContext();
  const customers = await prisma.customer.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "desc" },
    include: { appointments: true }
  });

  return (
    <>
      <div className="topbar">
        <div>
          <p className="eyebrow">CRM</p>
          <h1>Musteriler</h1>
        </div>
      </div>
      <section className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Ad</th>
              <th>Telefon</th>
              <th>Instagram</th>
              <th>WhatsApp</th>
              <th>Randevu</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.name}</td>
                <td>{customer.phone}</td>
                <td>{customer.instagramId ?? "-"}</td>
                <td>{customer.whatsappId ?? "-"}</td>
                <td>{customer.appointments.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
