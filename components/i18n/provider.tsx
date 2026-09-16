"use client";
import { createContext, useContext, useMemo } from "react";
import type { Messages } from "@/lib/i18n/messages";
import type { RequestLocale } from "@/lib/i18n/server";
import { localizePath } from "@/lib/i18n/config";
import {
  fill,
  formatCurrency,
  plural,
  type CurrencyCode,
  type PluralForms,
} from "@/lib/i18n/format";

type Context = { locale: RequestLocale; common: Messages["common"] };
const I18nContext = createContext<Context | null>(null);

export function I18nProvider({
  locale,
  common,
  children,
}: Context & { children: React.ReactNode }) {
  const value = useMemo(() => ({ locale, common }), [locale, common]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("I18nProvider is missing.");
  const { locale, common } = context;
  return {
    locale,
    t: common,
    href: (path: string) => localizePath(locale.locale, path),
    money: (minor: number | null | undefined, currency?: CurrencyCode) =>
      formatCurrency(
        minor,
        currency ?? (locale.currency as CurrencyCode),
        locale.tag,
        common.money.unavailable,
      ),
    fill,
    plural: (
      count: number,
      forms: PluralForms,
      values?: Record<string, string | number>,
    ) => plural(locale.tag, count, forms, values),
  };
}
