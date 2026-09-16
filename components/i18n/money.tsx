"use client";
import type { CurrencyCode } from "@/lib/i18n/format";
import { useI18n } from "./provider";

export function Money({
  minor,
  currency,
}: {
  minor: number | null | undefined;
  currency?: string;
}) {
  const { money } = useI18n();
  // Browsers can ship different CLDR data than the server, e.g. spacing or symbols.
  return (
    <span suppressHydrationWarning>
      {money(minor, currency as CurrencyCode | undefined)}
    </span>
  );
}
