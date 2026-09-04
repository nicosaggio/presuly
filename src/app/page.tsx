import { Suspense } from "react";
import Link from "next/link";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { getSession } from "@/lib/auth/session";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { LinkButton } from "@/components/link-button";
import { AttributionCapture } from "@/components/attribution-capture";

export default async function Home() {
  const [dict, locale, session] = await Promise.all([
    getDictionary(),
    getLocale(),
    getSession(),
  ]);

  return (
    <div className="flex flex-col flex-1">
      <Suspense fallback={null}>
        <AttributionCapture />
      </Suspense>
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <span className="font-semibold">{dict.common.appName}</span>
        <div className="flex items-center gap-4">
          <LocaleSwitcher current={locale} />
          <LinkButton
            href={session ? "/dashboard" : "/login"}
            variant="ghost"
            size="sm"
          >
            {session ? dict.dashboard.title : dict.landing.ctaSecondary}
          </LinkButton>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="max-w-2xl text-3xl sm:text-5xl font-semibold tracking-tight text-balance">
          {dict.landing.tagline}
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground text-balance">
          {dict.landing.subtitle}
        </p>
        <div className="mt-10">
          <LinkButton href="/login" size="lg">
            {dict.landing.cta}
          </LinkButton>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{dict.landing.freeNote}</p>
      </main>

      <footer className="flex flex-wrap items-center justify-center gap-4 px-6 py-6 text-xs text-muted-foreground border-t">
        <a href="mailto:hola@presuly.com.ar" className="hover:text-foreground">
          {dict.common.contact}
        </a>
        <Link href="/templates" className="hover:text-foreground">
          {dict.common.templates}
        </Link>
        <Link href="/terms" className="hover:text-foreground">
          {dict.common.terms}
        </Link>
        <Link href="/privacy" className="hover:text-foreground">
          {dict.common.privacy}
        </Link>
        <Link href="/refunds" className="hover:text-foreground">
          {dict.common.refunds}
        </Link>
      </footer>
    </div>
  );
}
