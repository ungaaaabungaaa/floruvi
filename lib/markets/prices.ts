// Reviewed seed input for Convex `marketPricing`. The storefront reads Convex only;
// this module lets tests and scripts price against the committed study.
import table from "./price-table.json";
import type { Market } from "@/lib/i18n/config";
import { priceInMarket, type MarketPricing, type Price } from "./pricing-core";

export { ceilToStep } from "./pricing-core";

const priceTable = table as unknown as {
  revision: string;
  markup: number;
  markets: Partial<Record<Market, MarketPricing & { researchedOn: string; observationsUsed: number }>>;
};
export const marketPricingRevision = priceTable.revision;
export const marketPricingSeed = priceTable;

export function marketPrice(
  product: { slug: string; category: string; price?: Price | null },
  market: Market,
) {
  return priceInMarket(product, market, priceTable.markets[market]);
}
