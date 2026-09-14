import type { CartLine } from "./cart";

export function formatMoney(minor: number | null | undefined) {
  return minor == null
    ? "Price on request"
    : new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: minor % 100 ? 2 : 0,
        maximumFractionDigits: 2,
      }).format(minor / 100);
}

type PricedProduct = {
  slug: string;
  name: string;
  price?: { amountMinor: number; currency: string; packLabel: string } | null;
};
const validMoney = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;

// Called only after the request's slug/quantity validation. Prices come from Convex.
export function reviewBasket(
  lines: CartLine[],
  products: PricedProduct[],
  commerce?: { currency: string; deliveryFeeMinor: number } | null,
) {
  const items = lines.map((line) => {
    const product = products.find((p) => p.slug === line.slug);
    const price = product?.price;
    const unitPrice =
      price?.currency === "INR" &&
      validMoney(price.amountMinor) &&
      price.amountMinor > 0 &&
      price.packLabel.trim()
        ? price.amountMinor
        : null;
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
  const delivery =
    lines.length === 0
      ? 0
      : commerce?.currency === "INR" && validMoney(commerce.deliveryFeeMinor)
        ? commerce.deliveryFeeMinor
        : null;
  const total =
    subtotal !== null && delivery !== null && validMoney(subtotal + delivery)
      ? subtotal + delivery
      : null;
  return {
    items,
    currency: "INR",
    subtotal,
    delivery,
    total,
    paymentEnabled: false as const,
    verificationEnabled: false as const,
  };
}
export type BasketReview = ReturnType<typeof reviewBasket>;
