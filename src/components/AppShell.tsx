import Link from "next/link";
import { Building2, CalendarDays, Home, Inbox, Plus, Send, Settings, Users } from "lucide-react";
import { getDictionary, type AppLocale } from "@/lib/i18n";

const navItems = [
  { href: "/dashboard", labelKey: "nav.overview", icon: Home },
  { href: "/dashboard/appointments", labelKey: "nav.appointments", icon: CalendarDays },
  { href: "/dashboard/inbox", labelKey: "nav.inbox", icon: Inbox },
  { href: "/dashboard/outreach", labelKey: "nav.outreach", icon: Send },
  { href: "/dashboard/customers", labelKey: "nav.customers", icon: Users },
  { href: "/dashboard/admin", labelKey: "nav.admin", icon: Settings },
  { href: "/platform", labelKey: "nav.platform", icon: Building2 }
] as const;

export function AppShell({ children, locale }: { children: React.ReactNode; locale?: AppLocale | string }) {
  const { t } = getDictionary(locale);

  return (
    <div className="app-frame">
      <header className="app-header">
        <Link className="brand calendar-brand" href="/dashboard">
          <span className="brand-mark">31</span>
          <span>Assistant Scheduler</span>
        </Link>
        <nav className="header-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Icon size={17} /> {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>
        <Link className="button" href="/book/demo-clinic">
          <Plus size={17} /> {t("nav.newAppointment")}
        </Link>
      </header>
      <main>{children}</main>
    </div>
  );
}
