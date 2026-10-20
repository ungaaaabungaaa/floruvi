/** India pantry weights. Existing carts retain their original pack-count lines. */
export const PANTRY_SLUGS = [
  "green-banana-flour",
  "onion-powder",
  "onion-flakes",
  "garlic-powder",
  "ginger-powder",
  "turmeric-powder",
  "moringa-leaf-powder",
  "tomato-powder",
  "beetroot-powder",
  "carrot-powder",
  "spinach-powder",
];
export const MAX_WEIGHT_GRAMS = 999000;
export const isPantry = (slug: string) => PANTRY_SLUGS.includes(slug);
export function validWeight(grams: unknown): grams is number {
  return (
    typeof grams === "number" &&
    Number.isSafeInteger(grams) &&
    (grams === 250 ||
      (grams >= 500 && grams <= 3000 && grams % 500 === 0) ||
      (grams > 3000 && grams <= MAX_WEIGHT_GRAMS && grams % 1000 === 0))
  );
}
export function nextWeight(grams: number, direction: 1 | -1) {
  if (direction === 1)
    return Math.min(
      MAX_WEIGHT_GRAMS,
      grams === 250 ? 500 : grams < 3000 ? grams + 500 : grams + 1000,
    );
  return grams <= 500 ? 250 : grams <= 3000 ? grams - 500 : grams - 1000;
}
export const formatWeight = (grams: number) =>
  grams < 1000 ? `${grams} g` : `${grams / 1000} kg`;
export const packagingFor = (grams: number) =>
  grams <= 500 ? "Glass jar" : "Bulk";
export const weightLabel = (grams: number) =>
  `${formatWeight(grams)} · ${packagingFor(grams)}`;
export type WeightPricing = {
  baseGrams: number;
  baseMinor: number;
  singlePackExemption?: boolean;
};
type Price = { amountMinor: number; currency: string; packLabel: string };
export function weightPrice(pricing: WeightPricing, grams: number) {
  if (
    !validWeight(grams) ||
    !Number.isSafeInteger(pricing.baseMinor) ||
    pricing.baseMinor <= 0 ||
    !Number.isSafeInteger(pricing.baseGrams) ||
    pricing.baseGrams <= 0
  )
    return null;
  const numerator = pricing.baseMinor * grams;
  if (!Number.isSafeInteger(numerator)) return null;
  // HSN 1106: one retail pack above 25 kg is outside "pre-packaged and labelled".
  // The owner ships a selected bulk weight as one pack, not multiple retail jars.
  if (
    pricing.singlePackExemption &&
    grams > 25000 &&
    !Number.isSafeInteger(numerator * 100)
  )
    return null;
  return pricing.singlePackExemption && grams > 25000
    ? Math.round((numerator * 100) / (pricing.baseGrams * 105))
    : Math.round(numerator / pricing.baseGrams);
}
/** Retail totals include applicable taxes. No tax is added again at checkout. */
export function pantryPrices(
  slug: string,
  price: Price | null | undefined,
  market: string,
) {
  const grams = price?.packLabel.match(/^(\d+) g$/)?.[1];
  const weightPricing =
    market === "in" && isPantry(slug) && price?.currency === "INR" && grams
      ? {
          baseGrams: Number(grams),
          baseMinor: price.amountMinor,
          ...(slug === "green-banana-flour"
            ? { singlePackExemption: true }
            : {}),
        }
      : null;
  const amount = weightPricing ? weightPrice(weightPricing, 250) : null;
  return {
    price:
      amount !== null && price
        ? { ...price, amountMinor: amount, packLabel: "250 g" }
        : (price ?? null),
    legacyPrice: weightPricing ? (price ?? null) : null,
    weightPricing,
  };
}
