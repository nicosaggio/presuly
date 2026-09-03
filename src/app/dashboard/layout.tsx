import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { LogoutButton } from "@/components/logout-button";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const session = await getSession();
  if (!session) redirect("/login");

  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <div className="flex flex-col flex-1">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <Link href="/dashboard" className="font-semibold">
          {dict.common.appName}
        </Link>
        <div className="flex items-center gap-4">
          <LocaleSwitcher current={locale} />
          <LogoutButton label={dict.common.logout} />
        </div>
      </header>
      <main className="flex-1 px-6 py-8 w-full max-w-3xl mx-auto">{children}</main>
    </div>
  );
}
