import { cache } from "react";
import { notFound } from "next/navigation";
import { locale as localeParam } from "next/root-params";
import { countryName } from "./format";
import { isLocale, parseLocale, type Locale } from "./config";
import { loadMessages } from "./messages";

/** Locale details for the current request, from the root [locale] segment. */
export const getLocale = cache(async () => {
  const value = await localeParam();
  if (!isLocale(value)) notFound();
  return localeDetails(value);
});

export function localeDetails(locale: Locale) {
  const info = parseLocale(locale);
  return {
    ...info,
    countryName: countryName(info.country, info.language),
    countryNameEnglish: countryName(info.country, "en"),
  };
}
export type RequestLocale = ReturnType<typeof localeDetails>;

export const getMessages = cache(async () => {
  const { language } = await getLocale();
  return loadMessages(language);
});

export const getI18n = cache(async () => {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()]);
  return { locale, messages };
});
