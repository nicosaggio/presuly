import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getUserById } from "@/lib/db/queries";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { effectivePlan } from "@/lib/plans";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { LogoutButton } from "@/components/logout-button";
import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/badge";

// El área logueada es privada — ya bloqueada en robots.ts, esto es defensa
// en profundidad (aplica a todas las rutas /dashboard/*).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const session = await getSession();
  if (!session) redirect("/login");

  const [dict, locale, user] = await Promise.all([
    getDictionary(),
    getLocale(),
    getUserById(session.userId),
  ]);
  const plan = user ? effectivePlan(user) : "free";
  const planLabel =
    plan === "free"
      ? dict.dashboard.planBadgeFree
      : plan === "pro"
        ? dict.dashboard.planBadgePro
        : dict.dashboard.planBadgeStudio;

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="border-b">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <Link href="/dashboard" aria-label={dict.common.appName} className="shrink-0">
            <Logo size="sm" />
          </Link>
          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            <Link href="/dashboard/billing" className="shrink-0">
              <Badge variant={plan === "free" ? "outline" : "default"}>{planLabel}</Badge>
            </Link>
            <LocaleSwitcher current={locale} />
            <LogoutButton label={dict.common.logout} iconOnly />
          </div>
        </div>
        <nav className="flex items-center gap-4 overflow-x-auto px-4 pb-3 text-sm whitespace-nowrap sm:gap-6 sm:px-6">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
            {dict.dashboard.title}
          </Link>
          <Link href="/templates" className="text-muted-foreground hover:text-foreground">
            {dict.common.templates}
          </Link>
          <Link href="/#como-funciona" className="text-muted-foreground hover:text-foreground">
            {dict.common.howItWorks}
          </Link>
          <Link href="/dashboard/profile" className="text-muted-foreground hover:text-foreground">
            {dict.profile.navLabel}
          </Link>
          {session.email === process.env.ADMIN_EMAIL && (
            <Link href="/dashboard/metrics" className="text-muted-foreground hover:text-foreground">
              k
            </Link>
          )}
        </nav>
      </header>
      <main className="w-full min-w-0 max-w-6xl flex-1 mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
