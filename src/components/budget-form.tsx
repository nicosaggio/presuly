"use client";

import { useId, useRef, useState, useTransition } from "react";
import { nanoid } from "nanoid";
import type { Dictionary, Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import type { Budget, BudgetItem, BudgetAttachment } from "@/lib/db/schema";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Paperclip, X } from "lucide-react";
import { toast } from "sonner";

const CURRENCIES = ["ARS", "USD", "MXN", "EUR", "COP", "CLP"];

const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
]);

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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
  locale,
  budget,
  initialValues,
  action,
}: {
  dict: Dictionary;
  locale: Locale;
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
  const [kind, setKind] = useState(budget?.kind ?? "service");
  const [deliveryMode, setDeliveryMode] = useState(budget?.deliveryMode ?? "online");
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
  const [existingAttachments, setExistingAttachments] = useState<BudgetAttachment[]>(
    budget?.attachments ?? []
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const numberFormat = new Intl.NumberFormat(locale === "en" ? "en-US" : "es-AR");

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
    formData.set("kind", kind);
    formData.set("deliveryMode", deliveryMode);
    formData.set("keptAttachments", JSON.stringify(existingAttachments.map((a) => a.id)));
    for (const file of newFiles) {
      formData.append("newAttachments", file);
    }
    startTransition(async () => {
      await action(formData);
      toast.success(dict.editor.saved);
    });
  }

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList) return;
    const files = Array.from(fileList);
    const room = MAX_ATTACHMENTS - existingAttachments.length - newFiles.length;
    if (files.length > room) {
      toast.error(dict.editor.attachmentTooMany);
    }
    const accepted: File[] = [];
    for (const file of files.slice(0, Math.max(room, 0))) {
      if (file.size > MAX_ATTACHMENT_SIZE) {
        toast.error(t(dict.editor.attachmentTooLarge, { name: file.name }));
        continue;
      }
      if (!ALLOWED_ATTACHMENT_TYPES.has(file.type)) {
        toast.error(t(dict.editor.attachmentInvalidType, { name: file.name }));
        continue;
      }
      accepted.push(file);
    }
    if (accepted.length > 0) setNewFiles((prev) => [...prev, ...accepted]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeExistingAttachment(id: string) {
    setExistingAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  function removeNewFile(index: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function priceDisplayValue(item: BudgetItem) {
    if (item.id in priceDrafts) return priceDrafts[item.id];
    if (item.price === 0) return "";
    return numberFormat.format(item.price);
  }

  function handlePriceFocus(item: BudgetItem, e: React.FocusEvent<HTMLInputElement>) {
    setPriceDrafts((prev) => ({
      ...prev,
      [item.id]: item.price === 0 ? "" : String(item.price),
    }));
    e.currentTarget.select();
  }

  function handlePriceChange(item: BudgetItem, e: React.ChangeEvent<HTMLInputElement>) {
    const cleaned = e.target.value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");
    setPriceDrafts((prev) => ({ ...prev, [item.id]: cleaned }));
    updateItem(item.id, { price: cleaned === "" ? 0 : Number(cleaned) || 0 });
  }

  function handlePriceBlur(item: BudgetItem) {
    setPriceDrafts((prev) => {
      const next = { ...prev };
      delete next[item.id];
      return next;
    });
  }

  function handleFormKeyDown(e: React.KeyboardEvent<HTMLFormElement>) {
    if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") {
      e.preventDefault();
    }
  }

  return (
    <form id={formId} action={handleSubmit} onKeyDown={handleFormKeyDown} className="space-y-8">
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

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="kind">{dict.editor.fieldKind}</Label>
          <Select value={kind} onValueChange={(v) => v && setKind(v as typeof kind)}>
            <SelectTrigger id="kind" className="w-full">
              <SelectValue>
                {(v: string) => (v === "product" ? dict.editor.kindProduct : dict.editor.kindService)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="service">{dict.editor.kindService}</SelectItem>
              <SelectItem value="product">{dict.editor.kindProduct}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="deliveryMode">{dict.editor.fieldDeliveryMode}</Label>
          <Select
            value={deliveryMode}
            onValueChange={(v) => v && setDeliveryMode(v as typeof deliveryMode)}
          >
            <SelectTrigger id="deliveryMode" className="w-full">
              <SelectValue>
                {(v: string) =>
                  v === "in_person"
                    ? dict.editor.deliveryInPerson
                    : v === "hybrid"
                      ? dict.editor.deliveryHybrid
                      : dict.editor.deliveryOnline
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="online">{dict.editor.deliveryOnline}</SelectItem>
              <SelectItem value="in_person">{dict.editor.deliveryInPerson}</SelectItem>
              <SelectItem value="hybrid">{dict.editor.deliveryHybrid}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="intro">{dict.editor.fieldIntro}</Label>
        <p className="text-xs text-muted-foreground">{dict.editor.fieldIntroHint}</p>
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
        <p className="text-xs text-muted-foreground">{dict.editor.fieldScopeHint}</p>
        <Textarea
          id="scope"
          name="scope"
          defaultValue={budget?.scope ?? initialValues?.scope ?? ""}
          placeholder={dict.editor.fieldScopePlaceholder}
          rows={4}
        />
      </div>

      <div className="space-y-2 max-w-xs">
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

      <div className="space-y-3">
        <Label>{dict.editor.fieldItems}</Label>
        <p className="text-xs text-muted-foreground -mt-2">{dict.editor.fieldItemsHint}</p>
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
                type="text"
                inputMode="decimal"
                placeholder={dict.editor.itemPrice}
                value={priceDisplayValue(item)}
                onFocus={(e) => handlePriceFocus(item, e)}
                onChange={(e) => handlePriceChange(item, e)}
                onBlur={() => handlePriceBlur(item)}
              />
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

      <div className="space-y-3">
        <Label>{dict.editor.fieldAttachments}</Label>
        <p className="text-xs text-muted-foreground -mt-2">{dict.editor.fieldAttachmentsHint}</p>
        {(existingAttachments.length > 0 || newFiles.length > 0) && (
          <div className="space-y-2">
            {existingAttachments.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-2 rounded-lg border p-2 text-sm"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{a.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatFileSize(a.size)}
                  </span>
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExistingAttachment(a.id)}
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            ))}
            {newFiles.map((file, i) => (
              <div
                key={`${file.name}-${i}`}
                className="flex items-center justify-between gap-2 rounded-lg border p-2 text-sm"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{file.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </span>
                </span>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeNewFile(i)}>
                  <X className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.xls,.xlsx,.csv"
          className="hidden"
          onChange={(e) => handleFilesSelected(e.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={existingAttachments.length + newFiles.length >= MAX_ATTACHMENTS}
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="size-3.5" />
          {dict.editor.addAttachment}
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="conditions">{dict.editor.fieldConditions}</Label>
        <p className="text-xs text-muted-foreground">{dict.editor.fieldConditionsHint}</p>
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

      <div className="space-y-2 max-w-xs">
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

      <div className="flex items-center justify-between border-t pt-4">
        <span className="text-sm text-muted-foreground">
          {dict.editor.total}:{" "}
          <strong className="text-foreground">
            {formatCurrency(total, currency, locale)}
          </strong>
        </span>
        <Button type="submit" disabled={isPending}>
          {dict.editor.saveDraft}
        </Button>
      </div>
    </form>
  );
}
