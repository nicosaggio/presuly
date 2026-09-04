import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getUserById } from "@/lib/db/queries";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { effectivePlan } from "@/lib/plans";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { LogoutButton } from "@/components/logout-button";
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
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <Link href="/dashboard" className="font-semibold">
          {dict.common.appName}
        </Link>
        <div className="flex items-center gap-4">
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
          <LocaleSwitcher current={locale} />
          <LogoutButton label={dict.common.logout} />
        </div>
      </header>
      <main className="flex-1 px-6 py-8 w-full max-w-3xl mx-auto">{children}</main>
    </div>
  );
}
