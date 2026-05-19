import { prisma } from "@/lib/prisma";

export type TenantContext = {
  id: string;
  slug: string;
  name: string;
  locale: string;
  timezone: string;
};

export async function getTenantContext(slug = process.env.DEFAULT_TENANT_SLUG ?? "demo-clinic"): Promise<TenantContext> {
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: { id: true, slug: true, name: true, locale: true, timezone: true }
  });

  if (!tenant) {
    throw new Error(`Tenant not found: ${slug}`);
  }

  return tenant;
}
