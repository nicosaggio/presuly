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
    <div className="flex flex-col flex-1">
      <header className="flex flex-wrap items-center justify-between gap-y-2 px-4 py-3 border-b sm:px-6 sm:py-4">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/dashboard" aria-label={dict.common.appName}>
            <Logo size="sm" />
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {dict.dashboard.title}
          </Link>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/dashboard/billing">
            <Badge variant={plan === "free" ? "outline" : "default"}>{planLabel}</Badge>
          </Link>
          {session.email === process.env.ADMIN_EMAIL && (
            <Link
              href="/dashboard/metrics"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              k
            </Link>
          )}
          <Link
            href="/dashboard/profile"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {dict.profile.navLabel}
          </Link>
          <LocaleSwitcher current={locale} />
          <LogoutButton label={dict.common.logout} />
        </div>
      </header>
      <main className="flex-1 px-6 py-8 w-full max-w-3xl mx-auto">{children}</main>
    </div>
  );
}
