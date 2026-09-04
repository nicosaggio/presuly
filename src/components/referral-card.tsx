"use client";

import { toast } from "sonner";
import type { Dictionary, Locale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function ReferralCard({
  dict,
  locale,
  referralUrl,
}: {
  dict: Dictionary;
  locale: Locale;
  referralUrl: string;
}) {
  function copyLink() {
    navigator.clipboard.writeText(referralUrl).then(() => {
      toast.success(dict.common.linkCopied);
    });
  }

  const whatsappText =
    locale === "en"
      ? `I've been using Presuly to send proposals to clients — free month of Pro if you sign up with my link: ${referralUrl}`
      : `Estoy usando Presuly para mandar presupuestos a mis clientes — te regalo un mes de Pro si te sumás con mi link: ${referralUrl}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict.billing.referralTitle}</CardTitle>
        <CardDescription>{dict.billing.referralDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded bg-muted px-2 py-1.5 text-xs">
            {referralUrl}
          </code>
          <Button size="sm" variant="outline" onClick={copyLink}>
            {dict.common.copyLink}
          </Button>
        </div>
        <Button
          render={<a href={whatsappUrl} target="_blank" rel="noreferrer" />}
          nativeButton={false}
          size="sm"
          variant="outline"
          className="w-full"
        >
          {dict.common.shareWhatsapp}
        </Button>
      </CardContent>
    </Card>
  );
}
