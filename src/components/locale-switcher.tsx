"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocale } from "@/lib/actions/auth";
import type { Locale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export function LocaleSwitcher({ current }: { current: Locale }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchTo(locale: Locale) {
    if (locale === current) return;
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
