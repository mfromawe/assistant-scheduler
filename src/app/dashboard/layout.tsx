import { AppShell } from "@/components/AppShell";
import { getTenantContext } from "@/lib/tenant";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getTenantContext();

  return <AppShell locale={tenant.locale}>{children}</AppShell>;
}
