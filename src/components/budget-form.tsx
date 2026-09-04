"use client";

import { useId, useState, useTransition } from "react";
import { nanoid } from "nanoid";
import type { Dictionary } from "@/lib/i18n";
import type { Budget, BudgetItem } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const CURRENCIES = ["ARS", "USD", "MXN", "EUR", "COP", "CLP"];

function emptyItem(): BudgetItem {
  return { id: nanoid(8), description: "", price: 0, optional: false, selected: true };
}

type TemplateValues = {
  title?: string;
  intro?: string;
  scope?: string;
  conditions?: string;
  currency?: string;
  items?: BudgetItem[];
};

export function BudgetForm({
  dict,
  budget,
  initialValues,
  action,
}: {
  dict: Dictionary;
  budget?: Budget;
  /** Precarga de contenido (ej: desde una plantilla) cuando se crea un presupuesto nuevo. */
  initialValues?: TemplateValues;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const formId = useId();
  const [items, setItems] = useState<BudgetItem[]>(
    budget?.items?.length
      ? budget.items
      : initialValues?.items?.length
        ? initialValues.items
        : [emptyItem()]
  );
  const [currency, setCurrency] = useState(
    budget?.currency ?? initialValues?.currency ?? "ARS"
  );
  const [isPending, startTransition] = useTransition();

  function updateItem(id: string, patch: Partial<BudgetItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }

  function removeItem(id: string) {
    setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.id !== id) : prev));
  }

  const total = items
    .filter((it) => !it.optional || it.selected)
    .reduce((sum, it) => sum + (Number.isFinite(it.price) ? it.price : 0), 0);

  function handleSubmit(formData: FormData) {
    formData.set("items", JSON.stringify(items));
    formData.set("currency", currency);
    startTransition(async () => {
      await action(formData);
      toast.success(dict.editor.saved);
    });
  }

  return (
    <form id={formId} action={handleSubmit} className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="title">{dict.editor.fieldTitle}</Label>
          <Input
            id="title"
            name="title"
            defaultValue={budget?.title ?? initialValues?.title}
            placeholder={dict.editor.fieldTitlePlaceholder}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="clientName">{dict.editor.fieldClientName}</Label>
          <Input id="clientName" name="clientName" defaultValue={budget?.clientName} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="clientEmail">{dict.editor.fieldClientEmail}</Label>
          <Input
            id="clientEmail"
            name="clientEmail"
            type="email"
            defaultValue={budget?.clientEmail ?? ""}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="intro">{dict.editor.fieldIntro}</Label>
        <Textarea
          id="intro"
          name="intro"
          defaultValue={budget?.intro ?? initialValues?.intro ?? ""}
          placeholder={dict.editor.fieldIntroPlaceholder}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="scope">{dict.editor.fieldScope}</Label>
        <Textarea
          id="scope"
          name="scope"
          defaultValue={budget?.scope ?? initialValues?.scope ?? ""}
          rows={4}
        />
      </div>

      <div className="space-y-3">
        <Label>{dict.editor.fieldItems}</Label>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center"
            >
              <Input
                className="flex-1"
                placeholder={dict.editor.itemDescription}
                value={item.description}
                onChange={(e) => updateItem(item.id, { description: e.target.value })}
              />
              <Input
                className="sm:w-32"
                type="number"
                min={0}
                step="0.01"
                placeholder={dict.editor.itemPrice}
                value={item.price}
                onChange={(e) =>
                  updateItem(item.id, { price: Number(e.target.value) || 0 })
                }
              />
              <label className="flex items-center gap-2 text-sm whitespace-nowrap">
                <Checkbox
                  checked={item.optional}
                  onCheckedChange={(checked) =>
                    updateItem(item.id, { optional: checked === true })
                  }
                />
                {dict.editor.itemOptional}
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeItem(item.id)}
              >
                {dict.common.remove}
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          {dict.editor.addItem}
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="conditions">{dict.editor.fieldConditions}</Label>
        <Textarea
          id="conditions"
          name="conditions"
          defaultValue={budget?.conditions ?? initialValues?.conditions ?? ""}
          placeholder={dict.editor.fieldConditionsPlaceholder}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentLink">{dict.editor.fieldPaymentLink}</Label>
        <Input
          id="paymentLink"
          name="paymentLink"
          type="url"
          defaultValue={budget?.paymentLink ?? ""}
          placeholder={
            currency === "ARS"
              ? "https://mpago.la/tu-link"
              : "https://buy.stripe.com/... o https://paypal.me/..."
          }
        />
        <p className="text-xs text-muted-foreground">
          {currency === "ARS"
            ? dict.editor.fieldPaymentLinkHintArs
            : dict.editor.fieldPaymentLinkHintOther}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="currency">{dict.editor.fieldCurrency}</Label>
          <Select
            value={currency}
            onValueChange={(value) => {
              if (value) setCurrency(value);
            }}
          >
            <SelectTrigger id="currency" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="validityDays">{dict.editor.fieldValidityDays}</Label>
          <Input
            id="validityDays"
            name="validityDays"
            type="number"
            min={1}
            max={180}
            defaultValue={budget?.validityDays ?? 15}
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <span className="text-sm text-muted-foreground">
          {dict.editor.total}: <strong className="text-foreground">{total.toFixed(2)}</strong>
        </span>
        <Button type="submit" disabled={isPending}>
          {dict.editor.saveDraft}
        </Button>
      </div>
    </form>
  );
}
