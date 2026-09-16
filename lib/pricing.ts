import type { CartLine } from "./cart";
import { boxContents, getCartBox } from "./boxes";
import { formatCurrency, type CurrencyCode } from "./i18n/format";
import { markets, type Market } from "./i18n/config";

export function formatMoney(
  minor: number | null | undefined,
  currency: CurrencyCode = "INR",
  tag = "en-IN",
) {
  return formatCurrency(minor, currency, tag);
}

type PricedProduct = {
  slug: string;
  name: string;
  price?: { amountMinor: number; currency: string; packLabel: string } | null;
};
const validMoney = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;

// Called only after the request's slug/quantity validation. Prices come from the
// server: Convex for India, and the reviewed market price table for exports.
export function reviewBasket(
  lines: CartLine[],
  products: PricedProduct[],
  commerce?: { currency: string; deliveryFeeMinor: number } | null,
  market: Market = "in",
) {
  const currency: string = markets[market].currency;
  const domestic = market === "in";
  const usable = (price: PricedProduct["price"]) =>
    price?.currency === currency &&
    validMoney(price.amountMinor) &&
    price.amountMinor > 0 &&
    !!price.packLabel.trim();
  const items = lines.map((line) => {
    const box = getCartBox(line.slug);
    const boxPrices = boxContents.map(
      (item) => products.find((p) => p.slug === item.slug)?.price,
    );
    const completeBox = box && boxPrices.every(usable);
    const product = box
      ? {
          slug: line.slug,
          name: box.name,
          price: completeBox
            ? {
                amountMinor:
                  boxPrices.reduce(
                    (sum, price, index) =>
                      sum + price!.amountMinor * boxContents[index].quantity,
                    0,
                  ) * box.multiplier,
                currency,
                packLabel: `${box.people} · ${box.schedule} · per delivery`,
              }
            : null,
        }
      : products.find((p) => p.slug === line.slug);
    const price = product?.price;
    const unitPrice = usable(price) ? price!.amountMinor : null;
    const candidate = unitPrice === null ? null : unitPrice * line.quantity;
    const lineTotal = validMoney(candidate) ? candidate : null;
    return {
      ...line,
      name: product?.name ?? line.slug,
      availableToEnquire: !!product,
      packLabel: price?.packLabel ?? null,
      unitPrice,
      lineTotal,
    };
  });
  const sum = items.reduce((sum, item) => sum + (item.lineTotal ?? 0), 0);
  const subtotal =
    items.every((item) => item.lineTotal !== null) && validMoney(sum)
      ? sum
      : null;
  // Export delivery depends on destination & order size, so the farm quotes it.
  const deliveryQuoted = !domestic && lines.length > 0;
  const delivery = !domestic
    ? null
    : lines.length === 0 || lines.every((line) => !!getCartBox(line.slug))
      ? 0
      : commerce?.currency === "INR" && validMoney(commerce.deliveryFeeMinor)
        ? commerce.deliveryFeeMinor
        : null;
  const total = deliveryQuoted
    ? subtotal
    : subtotal !== null && delivery !== null && validMoney(subtotal + delivery)
      ? subtotal + delivery
      : null;
  return {
    items,
    market,
    currency,
    subtotal,
    delivery,
    deliveryQuoted,
    total,
    paymentEnabled: false as const,
    verificationEnabled: false as const,
  };
}
export type BasketReview = ReturnType<typeof reviewBasket>;
