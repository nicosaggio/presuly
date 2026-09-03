"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import type { Budget, BudgetItem, Acceptance } from "@/lib/db/schema";
import type { Dictionary, Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import type { AcceptBudgetState } from "@/lib/actions/budgets";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AcceptBudgetState = { ok: false };

export function PublicBudgetView({
  budget,
  acceptance,
  dict,
  locale,
  acceptAction,
  isExpired,
}: {
  budget: Budget;
  acceptance: Acceptance | null;
  dict: Dictionary;
  locale: Locale;
  acceptAction: (
    state: AcceptBudgetState,
    formData: FormData
  ) => Promise<AcceptBudgetState>;
  /** Calculado en el servidor (no en el cliente) para no depender del reloj del navegador. */
  isExpired: boolean;
}) {
  const [items, setItems] = useState<BudgetItem[]>(budget.items);
  const [state, formAction, isPending] = useActionState(acceptAction, initialState);

  const isAccepted = budget.status === "accepted" || state.ok;
  const canAccept = !isExpired && !isAccepted;

  const total = useMemo(
    () =>
      items
        .filter((it) => !it.optional || it.selected)
        .reduce((sum, it) => sum + it.price, 0),
    [items]
  );

  function toggleItem(id: string, selected: boolean) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, selected } : it)));
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-balance">{budget.title}</h1>
        <p className="text-muted-foreground">
          {dict.publicView.preparedFor} {budget.clientName}
        </p>
      </header>

      {budget.intro && <p className="text-pretty">{budget.intro}</p>}

      {budget.scope && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase text-muted-foreground">
            {dict.publicView.scopeTitle}
          </h2>
          <p className="whitespace-pre-line text-pretty">{budget.scope}</p>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase text-muted-foreground">
          {dict.publicView.itemsTitle}
        </h2>
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 border-b py-2 last:border-b-0"
            >
              <label className="flex items-center gap-3 flex-1">
                {item.optional && !isAccepted && (
                  <Checkbox
                    checked={item.selected}
                    onCheckedChange={(checked) => toggleItem(item.id, checked === true)}
                  />
                )}
                <span>
                  {item.description}
                  {item.optional && (
                    <span className="text-muted-foreground"> ({dict.common.optional})</span>
                  )}
                </span>
              </label>
              <span className="tabular-nums">
                {formatCurrency(item.price, budget.currency, locale)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t pt-3 font-semibold text-lg">
          <span>{dict.publicView.total}</span>
          <span className="tabular-nums">{formatCurrency(total, budget.currency, locale)}</span>
        </div>
      </section>

      {budget.conditions && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase text-muted-foreground">
            {dict.publicView.conditionsTitle}
          </h2>
          <p className="whitespace-pre-line text-pretty text-sm text-muted-foreground">
            {budget.conditions}
          </p>
        </section>
      )}

      {budget.validUntil && !isAccepted && (
        <p className="text-sm text-muted-foreground">
          {t(dict.publicView.validUntil, { date: formatDate(budget.validUntil, locale) })}
        </p>
      )}

      {isAccepted && (
        <Card className="border-emerald-600/30 bg-emerald-600/5">
          <CardContent className="space-y-2 py-5 text-center">
            <p className="font-semibold text-lg">{dict.publicView.acceptedTitle}</p>
            <p className="text-sm text-muted-foreground">
              {budget.acceptedAt
                ? t(dict.publicView.alreadyAccepted, {
                    date: formatDateTime(budget.acceptedAt, locale),
                  })
                : dict.publicView.acceptedBody}
            </p>
            {acceptance && (
              <p className="text-xs text-muted-foreground">
                {dict.publicView.signerName}: {acceptance.signerName}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {budget.paymentLink && (
                <Button
                  render={<a href={budget.paymentLink} target="_blank" rel="noreferrer" />}
                  nativeButton={false}
                  size="sm"
                >
                  {dict.publicView.pay}
                </Button>
              )}
              <Button
                render={<a href={`/api/p/${budget.token}/pdf`} target="_blank" rel="noreferrer" />}
                nativeButton={false}
                variant="outline"
                size="sm"
              >
                {dict.publicView.downloadPdf}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isExpired && !isAccepted && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {dict.publicView.expired}
        </p>
      )}

      {canAccept && (
        <Card>
          <CardContent className="space-y-4 py-5">
            <h2 className="font-semibold">{dict.publicView.acceptFormTitle}</h2>
            <form action={formAction} className="space-y-4">
              <input type="hidden" name="selections" value={JSON.stringify(items)} />
              <div className="space-y-2">
                <Label htmlFor="signerName">{dict.publicView.signerName}</Label>
                <Input id="signerName" name="signerName" required />
              </div>
              <label className="flex items-start gap-2 text-sm">
                <Checkbox required name="agree" />
                {dict.publicView.agreeCheckbox}
              </label>
              {state.error && (
                <p className="text-sm text-destructive">{dict.auth.unknownError}</p>
              )}
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? dict.publicView.submitting : dict.publicView.submitAccept}
              </Button>
              <p className="text-xs text-muted-foreground">{dict.publicView.signatureNote}</p>
            </form>
          </CardContent>
        </Card>
      )}

      <footer className="pt-6 text-center">
        <Link
          href="/?utm_source=budget_footer"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {dict.publicView.poweredBy}
        </Link>
      </footer>
    </div>
  );
}
