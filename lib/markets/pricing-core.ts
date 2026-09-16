import { markets, type Market } from "../i18n/config";

export type Price = { amountMinor: number; currency: string; packLabel: string };
/** One export market's reviewed rates. Stored in Convex `marketPricing`. */
export type MarketPricing = {
  currency: string;
  stepMinor: number;
  categoryRates: Record<string, number>;
  productRates: Record<string, number>;
};

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
  if (market === "in") return base;
  if (!pricing || pricing.currency !== markets[market].currency) return null;
  const rate = pricing.productRates[product.slug] ?? pricing.categoryRates[product.category];
  if (!rate || !Number.isFinite(rate) || !Number.isSafeInteger(pricing.stepMinor)) return null;
  const amountMinor = ceilToStep(base.amountMinor * rate, pricing.stepMinor);
  if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) return null;
  return { amountMinor, currency: pricing.currency, packLabel: base.packLabel };
}
