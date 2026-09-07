import { Suspense } from "react";
import Link from "next/link";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { getSession } from "@/lib/auth/session";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { LinkButton } from "@/components/link-button";
import { AttributionCapture } from "@/components/attribution-capture";
import { Logo } from "@/components/logo";

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
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 border-b sm:px-6 sm:py-4">
        <Logo size="sm" />
        <div className="flex items-center gap-3 sm:gap-4">
          <LinkButton
            href={session ? "/dashboard" : "/login"}
            variant="ghost"
            size="sm"
          >
            {session ? dict.dashboard.title : dict.landing.ctaSecondary}
          </LinkButton>
          <LocaleSwitcher current={locale} />
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

      <section id="como-funciona" className="border-t px-6 py-16">
        <div className="mx-auto max-w-4xl space-y-10">
          <div className="mx-auto max-w-xl space-y-2 text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold">{dict.landing.howItWorksTitle}</h2>
            <p className="text-muted-foreground text-balance">{dict.landing.howItWorksSubtitle}</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {dict.landing.howItWorksSteps.map((step, i) => (
              <div key={step.title} className="space-y-2 text-left">
                <div className="flex size-8 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
                  {i + 1}
                </div>
                <h3 className="font-medium">{step.title}</h3>
                <p className="text-sm text-muted-foreground text-pretty">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t px-6 py-14">
        <div className="mx-auto max-w-lg text-center space-y-4">
          <h2 className="text-xl font-semibold">{dict.landing.pricingTeaserTitle}</h2>
          <p className="text-muted-foreground text-balance">{dict.landing.pricingTeaserBody}</p>
          <div className="pt-2">
            <LinkButton href="/pricing" size="lg">
              {dict.landing.pricingTeaserCta}
            </LinkButton>
          </div>
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-center gap-4 px-6 py-6 text-xs text-muted-foreground border-t">
        <a href="mailto:hola@presuly.com.ar" className="hover:text-foreground">
          {dict.common.contact}
        </a>
        <Link href="/pricing" className="hover:text-foreground">
          {dict.common.pricing}
        </Link>
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
