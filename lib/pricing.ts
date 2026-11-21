import {
  weightPrice,
  weightLabel,
  isPantry,
  type WeightPricing,
} from "./pantry-weights";
import type { CartLine } from "./cart";
import { isPackProduct, packOptions, packLabel } from "./product-packs";
import { boxContents, getCartBox } from "./boxes";
import { ceilToWhole, formatCurrency, type CurrencyCode } from "./i18n/format";
import {
  deliveryFee,
  resolveDiscounts,
  roundDownDiscount,
  type DiscountSettings,
} from "./discounts";
import { markets, type Market } from "./i18n/config";
import { MIN_PAYMENT_MINOR } from "./razorpay";

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
  legacyPrice?: PricedProduct["price"];
  weightPricing?: WeightPricing | null;
  /** Missing means in stock. */
  inStock?: boolean;
};
const validMoney = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;

// Called only after the request's slug/quantity validation. Prices come from the
// server: Convex for India, and the reviewed market price table for exports.
// `payments` is true when the owner has switched online payment on.
export function reviewBasket(
  lines: CartLine[],
  products: PricedProduct[],
  commerce?:
    | ({ currency: string; deliveryFeeMinor: number } & Partial<DiscountSettings>)
    | null,
  market: Market = "in",
  payments = false,
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
    const stored = products.find((p) => p.slug === line.slug);
    const weighted = line.weightGrams !== undefined;
    const selectedPack = line.packSize !== undefined;
    const pack =
      selectedPack && !weighted && line.quantity === 1
        ? packOptions(line.slug, stored?.price, market)?.find(
            (option) => option.size === line.packSize,
          )
        : null;
    const weightedMinor =
      weighted &&
      market === "in" &&
      line.quantity === 1 &&
      isPantry(line.slug) &&
      stored?.weightPricing
        ? weightPrice(stored.weightPricing, line.weightGrams!)
        : null;
    const price = selectedPack
      ? pack
        ? {
            amountMinor: pack.amountMinor,
            currency,
            packLabel: packLabel(line.slug, line.packSize!),
          }
        : null
      : isPackProduct(line.slug)
        ? null
        : weighted
          ? weightedMinor !== null
            ? {
                amountMinor: weightedMinor,
                currency,
                packLabel: weightLabel(line.weightGrams!),
              }
            : null
          : (stored?.legacyPrice ?? product?.price);
    // Whole units only, even if a stored price still has decimals.
    const unitPrice = usable(price)
      ? ceilToWhole(price!.amountMinor, currency)
      : null;
    const candidate = unitPrice === null ? null : unitPrice * line.quantity;
    const lineTotal = validMoney(candidate) ? candidate : null;
    // A box is out of stock when any crop in it is out of stock.
    const outOfStock = box
      ? boxContents.some(
          (item) =>
            products.find((p) => p.slug === item.slug)?.inStock === false,
        )
      : product?.inStock === false;
    return {
      ...line,
      name: product?.name ?? line.slug,
      availableToEnquire:
        !!product &&
        !outOfStock &&
        (!weighted || weightedMinor !== null) &&
        (!selectedPack || !!pack) &&
        (!isPackProduct(line.slug) || !!pack),
      outOfStock,
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
  // The standard India fee, before the automatic discounts.
  const standardDelivery = !domestic
    ? null
    : lines.length === 0 || lines.every((line) => !!getCartBox(line.slug))
      ? 0
      : commerce?.currency === "INR" && validMoney(commerce.deliveryFeeMinor)
        ? commerce.deliveryFeeMinor
        : null;
  // Automatic India discounts: cheaper or free delivery from set order values,
  // then the total rounds down to a clean number (lib/discounts.ts).
  const discounts = resolveDiscounts(commerce);
  const delivery =
    standardDelivery === null || subtotal === null
      ? standardDelivery
      : deliveryFee(subtotal, standardDelivery, discounts);
  const beforeDiscount =
    subtotal !== null && delivery !== null && validMoney(subtotal + delivery)
      ? subtotal + delivery
      : null;
  const discount =
    domestic && beforeDiscount !== null
      ? roundDownDiscount(beforeDiscount, discounts)
      : 0;
  const total = deliveryQuoted
    ? subtotal
    : beforeDiscount !== null
      ? beforeDiscount - discount
      : null;
  // What the customer still has to add for the next delivery saving.
  const nextDeliveryLevel =
    domestic && subtotal !== null && delivery !== null && delivery > 0
      ? [
          { from: discounts.reducedDeliveryFromMinor, fee: Math.min(delivery, discounts.reducedDeliveryFeeMinor) },
          { from: discounts.freeDeliveryFromMinor, fee: 0 },
        ]
          .filter((level) => level.from > subtotal && level.fee < delivery)
          .sort((a, b) => a.from - b.from)[0]
      : undefined;
  // Online payment: India only, for a fully priced basket with nothing out of stock.
  // Boxes are availability enquiries until box sales are set up (AGENTS.md), so a
  // basket with a box is never payable online.
  const paymentEnabled =
    payments &&
    domestic &&
    lines.every((line) => !getCartBox(line.slug)) &&
    lines.every((line) => line.packSize === undefined) &&
    total !== null &&
    total >= MIN_PAYMENT_MINOR &&
    items.every((item) => item.availableToEnquire && item.lineTotal !== null);
  return {
    items,
    market,
    currency,
    subtotal,
    delivery,
    /** The fee before a delivery saving. Equal to `delivery` when there is none. */
    standardDelivery,
    /** Paise taken off so the total is a clean number. 0 when there is none. */
    discount,
    /** The next delivery saving: add `addMinor` more to pay `feeMinor` for delivery. */
    nextDelivery:
      nextDeliveryLevel && subtotal !== null
        ? { addMinor: nextDeliveryLevel.from - subtotal, feeMinor: nextDeliveryLevel.fee }
        : null,
    deliveryQuoted,
    total,
    paymentEnabled,
    verificationEnabled: false as const,
  };
}
export type BasketReview = ReturnType<typeof reviewBasket>;
