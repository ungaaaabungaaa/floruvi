// Automatic India discounts. Owner decision, 21 November 2026. The owner changes
// the values in /admin → Settings. All amounts are integer paise.

export type DiscountSettings = {
  /** The order total rounds down to a multiple of this. 0 switches it off. */
  roundDownStepMinor: number;
  /** From this subtotal the delivery fee drops to `reducedDeliveryFeeMinor`. 0 = off. */
  reducedDeliveryFromMinor: number;
  reducedDeliveryFeeMinor: number;
  /** From this subtotal delivery is free. 0 = off. */
  freeDeliveryFromMinor: number;
};

/** Starting values: round down to ₹50, ₹49 delivery from ₹1,000, free from ₹2,000. */
export const defaultDiscounts: DiscountSettings = {
  roundDownStepMinor: 5000,
  reducedDeliveryFromMinor: 100000,
  reducedDeliveryFeeMinor: 4900,
  freeDeliveryFromMinor: 200000,
};
export const ROUND_DOWN_STEPS_MINOR = [0, 1000, 5000, 10000] as const;
/** Upper limit for a threshold or fee the owner can save: ₹1,00,000. */
export const MAX_DISCOUNT_FIELD_MINOR = 10000000;

const wholeRupees = (value: unknown): value is number =>
  typeof value === "number" &&
  Number.isSafeInteger(value) &&
  value >= 0 &&
  value <= MAX_DISCOUNT_FIELD_MINOR &&
  value % 100 === 0;

/** Stored values, or the starting value for each field that is missing or invalid. */
export function resolveDiscounts(
  stored: Partial<Record<keyof DiscountSettings, unknown>> | null | undefined,
): DiscountSettings {
  const pick = (key: keyof DiscountSettings) =>
    wholeRupees(stored?.[key]) ? (stored[key] as number) : defaultDiscounts[key];
  const step = pick("roundDownStepMinor");
  return {
    roundDownStepMinor: (ROUND_DOWN_STEPS_MINOR as readonly number[]).includes(step)
      ? step
      : defaultDiscounts.roundDownStepMinor,
    reducedDeliveryFromMinor: pick("reducedDeliveryFromMinor"),
    reducedDeliveryFeeMinor: pick("reducedDeliveryFeeMinor"),
    freeDeliveryFromMinor: pick("freeDeliveryFromMinor"),
  };
}

/** True when every field is a value the owner may save. */
export function validDiscounts(value: unknown): value is DiscountSettings {
  if (!value || typeof value !== "object") return false;
  const input = value as Record<string, unknown>;
  return (
    wholeRupees(input.reducedDeliveryFromMinor) &&
    wholeRupees(input.reducedDeliveryFeeMinor) &&
    wholeRupees(input.freeDeliveryFromMinor) &&
    (ROUND_DOWN_STEPS_MINOR as readonly unknown[]).includes(input.roundDownStepMinor)
  );
}

/** Delivery fee for a subtotal. A level never raises the standard fee. */
export function deliveryFee(
  subtotalMinor: number,
  standardFeeMinor: number,
  d: DiscountSettings,
) {
  if (d.freeDeliveryFromMinor > 0 && subtotalMinor >= d.freeDeliveryFromMinor) return 0;
  if (d.reducedDeliveryFromMinor > 0 && subtotalMinor >= d.reducedDeliveryFromMinor)
    return Math.min(standardFeeMinor, d.reducedDeliveryFeeMinor);
  return standardFeeMinor;
}

/** The amount taken off so the total is a multiple of the step. Never the whole total. */
export function roundDownDiscount(totalMinor: number, d: DiscountSettings) {
  const step = d.roundDownStepMinor;
  if (step <= 0 || totalMinor <= step) return 0;
  return totalMinor % step;
}
