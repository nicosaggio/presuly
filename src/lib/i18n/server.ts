import "server-only";
import { cookies } from "next/headers";
import { dictionaries, isLocale, LOCALE_COOKIE, type Dictionary, type Locale } from "./index";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const raw = store.get(LOCALE_COOKIE)?.value;
  return isLocale(raw) ? raw : "es";
}

export async function getDictionary(): Promise<Dictionary> {
  const locale = await getLocale();
  return dictionaries[locale];
}
