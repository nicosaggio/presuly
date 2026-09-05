"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocale } from "@/lib/actions/auth";
import type { Locale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export function LocaleSwitcher({
  current,
  hrefFor,
}: {
  current: Locale;
  /**
   * Cuando se pasa, el switcher pasa a "modo ruta": navega a la URL
   * equivalente en el otro idioma (`hrefFor.es` / `hrefFor.en`) en vez de
   * setear la cookie `presuly_locale` y refrescar la misma URL. Es el modo
   * que usan las páginas públicas migradas a rutas por idioma (`/`,
   * `/pricing`, `/templates`, etc. — ver docs/DECISIONS.md, entrada
   * 2026-09-05), donde el idioma lo determina la URL, no la cookie.
   *
   * Son strings ya resueltas (no una función) porque este es un Client
   * Component: un callback de un Server Component no cruza el límite serializable.
   *
   * Sin este prop el switcher mantiene el comportamiento original (cookie +
   * `router.refresh()`), que es el que siguen usando las páginas fuera de esa
   * migración (dashboard, login, /p/[token]).
   */
  hrefFor?: Record<Locale, string>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchTo(locale: Locale) {
    if (locale === current) return;
    if (hrefFor) {
      router.push(hrefFor[locale]);
      return;
    }
    startTransition(async () => {
      await setLocale(locale);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1 text-sm">
      <Button
        variant={current === "es" ? "secondary" : "ghost"}
        size="sm"
        disabled={isPending}
        onClick={() => switchTo("es")}
      >
        ES
      </Button>
      <Button
        variant={current === "en" ? "secondary" : "ghost"}
        size="sm"
        disabled={isPending}
        onClick={() => switchTo("en")}
      >
        EN
      </Button>
    </div>
  );
}
