import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BookingForm } from "@/components/BookingForm";

export const dynamic = "force-dynamic";

export default async function BookingPage({
  params
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    include: { services: { where: { isActive: true } } }
  });

  if (!tenant) {
    return <main className="booking-page"><h1>Firma bulunamadi</h1></main>;
  }

  return (
    <main className="booking-page">
      <div className="topbar">
        <div>
          <p className="eyebrow">{tenant.sector}</p>
          <h1>{tenant.name} Randevu</h1>
        </div>
        <Link className="button secondary" href="/dashboard">Panele Don</Link>
      </div>
      <section className="grid cols-2">
        <div className="card">
          <h2>Randevu talebi</h2>
          <BookingForm tenantSlug={tenant.slug} services={tenant.services} />
        </div>
        <div className="card">
          <h2>Akis</h2>
          <p>1. Musteri hizmet ve saat secer.</p>
          <p>2. Sistem WhatsApp veya secilen kanal uzerinden dogrulama kodu yollar.</p>
          <p>3. Kod onayi gelince on odeme gerekiyorsa checkout olusturulur.</p>
          <p>4. Odeme/onay tamamlaninca randevu takvime islenir.</p>
        </div>
      </section>
    </main>
  );
}
