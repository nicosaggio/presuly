"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { Budget } from "@/lib/db/schema";
import type { Dictionary, Locale } from "@/lib/i18n";
import { formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BudgetStatusBadge } from "@/components/budget-status-badge";

export function BudgetPublishPanel({
  budget,
  dict,
  locale,
  publicUrl,
  onPublish,
}: {
  budget: Budget;
  dict: Dictionary;
  locale: Locale;
  publicUrl: string;
  onPublish: () => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  function copyLink() {
    navigator.clipboard.writeText(publicUrl).then(() => {
      toast.success(dict.common.linkCopied);
    });
  }

  const whatsappText =
    locale === "en"
      ? `Here's your proposal "${budget.title}": ${publicUrl}`
      : `Te paso tu presupuesto "${budget.title}": ${publicUrl}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;

  return (
    <Card>
      <CardContent className="space-y-3 py-4">
        <div className="flex items-center justify-between">
          <BudgetStatusBadge status={budget.status} dict={dict} />
          {budget.status === "draft" ? (
            <Button
              size="sm"
              disabled={isPending}
              onClick={() => startTransition(onPublish)}
            >
              {dict.editor.publish}
            </Button>
          ) : null}
        </div>

        {budget.status !== "draft" && (
          <div className="space-y-2">
            <p className="text-sm font-medium">{dict.editor.publicLinkTitle}</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded bg-muted px-2 py-1.5 text-xs">
                {publicUrl}
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
            <ul className="text-sm text-muted-foreground space-y-0.5">
              {budget.viewedAt && (
                <li>
                  {locale === "en" ? "First viewed" : "Visto por primera vez"}:{" "}
                  {formatDateTime(budget.viewedAt, locale)} ({budget.viewCount})
                </li>
              )}
              {budget.acceptedAt && (
                <li>
                  {locale === "en" ? "Accepted" : "Aceptado"}:{" "}
                  {formatDateTime(budget.acceptedAt, locale)}
                </li>
              )}
              {budget.validUntil && (
                <li>
                  {locale === "en" ? "Valid until" : "Válido hasta"}:{" "}
                  {formatDateTime(budget.validUntil, locale)}
                </li>
              )}
            </ul>
            {budget.status === "accepted" && (
              <Button
                render={
                  <a href={`/api/p/${budget.token}/pdf`} target="_blank" rel="noreferrer" />
                }
                nativeButton={false}
                size="sm"
                variant="secondary"
              >
                {dict.publicView.downloadPdf}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
