import { markets, type Market } from "../i18n/config";
import { ceilToWhole } from "../i18n/format";

export type Price = { amountMinor: number; currency: string; packLabel: string };
/** One export market's reviewed rates. Stored in Convex `marketPricing`. */
export type MarketPricing = {
  currency: string;
  stepMinor: number;
  categoryRates: Record<string, number>;
  productRates: Record<string, number>;
};

/** The same price with a whole-unit amount. Safe to apply twice. */
export function wholePrice<T extends Price>(price: T | null | undefined): T | null {
  if (!price || !Number.isSafeInteger(price.amountMinor)) return price ?? null;
  return { ...price, amountMinor: ceilToWhole(price.amountMinor, price.currency) };
}

export function ceilToStep(minor: number, step: number) {
  return Math.ceil(minor / step) * step;
}

/**
 * Server-side price for a product in a market. India uses the stored INR price.
 * Export prices scale that INR price (Indian retail × 1.40) by the reviewed local
 * retail rate for the crop or its category, so the result is local retail × 1.40.
 * See docs/20-international-pricing.md.
 */
export function priceInMarket(
  product: { slug: string; category: string; price?: Price | null },
  market: Market,
  pricing: MarketPricing | null | undefined,
): Price | null {
  const base = product.price;
  if (!base || base.currency !== "INR") return null;
  // No decimal prices in any currency (owner decision, 21 November 2026).
  if (market === "in") {
    const whole = ceilToWhole(base.amountMinor, "INR");
    return Number.isSafeInteger(whole) ? { ...base, amountMinor: whole } : null;
  }
  if (!pricing || pricing.currency !== markets[market].currency) return null;
  const rate = pricing.productRates[product.slug] ?? pricing.categoryRates[product.category];
  if (!rate || !Number.isFinite(rate) || !Number.isSafeInteger(pricing.stepMinor)) return null;
  const amountMinor = ceilToWhole(
    ceilToStep(base.amountMinor * rate, pricing.stepMinor),
    pricing.currency,
  );
  if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) return null;
  return { amountMinor, currency: pricing.currency, packLabel: base.packLabel };
}
