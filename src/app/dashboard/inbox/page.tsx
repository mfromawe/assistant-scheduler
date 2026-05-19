import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const tenant = await getTenantContext();
  const conversations = await prisma.conversation.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "desc" },
    include: { customer: true, messages: { orderBy: { createdAt: "desc" }, take: 1 } }
  });

  return (
    <>
      <div className="topbar">
        <div>
          <p className="eyebrow">WhatsApp ve Instagram</p>
          <h1>Mesaj Kutusu</h1>
        </div>
      </div>
      <section className="grid">
        {conversations.map((conversation) => (
          <article className="card" key={conversation.id}>
            <span className="badge green">{conversation.channel}</span>
            <h3>{conversation.customer?.name ?? "Bilinmeyen musteri"}</h3>
            <p>{conversation.messages[0]?.body ?? "Mesaj yok"}</p>
          </article>
        ))}
      </section>
    </>
  );
}
