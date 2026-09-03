import type { Locale } from "./i18n";

export function formatCurrency(amount: number, currency: string, locale: Locale = "es") {
  return new Intl.NumberFormat(locale === "es" ? "es-AR" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date, locale: Locale = "es") {
  return new Intl.DateTimeFormat(locale === "es" ? "es-AR" : "en-US", {
    dateStyle: "long",
  }).format(date);
}

export function formatDateTime(date: Date, locale: Locale = "es") {
  return new Intl.DateTimeFormat(locale === "es" ? "es-AR" : "en-US", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}
