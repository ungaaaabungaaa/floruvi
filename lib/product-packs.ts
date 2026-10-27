/** Fixed selected totals. These are sizes, never cart multipliers or pantry grams. */
const rules: Record<
  string,
  { unit: "ml" | "eggs"; sizes: readonly number[]; basis: readonly number[] }
> = {
  "raw-honey": { unit: "ml", sizes: [100, 250, 500], basis: [199, 399, 749] },
  "wildflower-honey": {
    unit: "ml",
    sizes: [100, 250, 500],
    basis: [179, 379, 699],
  },
  "single-flower-honey": {
    unit: "ml",
    sizes: [100, 250, 500],
    basis: [229, 449, 849],
  },
  "farm-eggs": { unit: "eggs", sizes: [12, 24, 36, 48], basis: [1, 2, 3, 4] },
};
export const isPackProduct = (slug: string) => Object.hasOwn(rules, slug);
const ruleFor = (slug: string) =>
  isPackProduct(slug) ? rules[slug] : undefined;
export function validPackSize(slug: string, size: unknown): size is number {
  return (
    typeof size === "number" &&
    Number.isSafeInteger(size) &&
    !!ruleFor(slug)?.sizes.includes(size)
  );
}
export function nextPackSize(slug: string, size: number, direction: 1 | -1) {
  const sizes = ruleFor(slug)?.sizes;
  if (!sizes || !sizes.includes(size)) return null;
  return sizes[
    Math.max(0, Math.min(sizes.length - 1, sizes.indexOf(size) + direction))
  ];
}
export function packSizeLabel(slug: string, size: number) {
  return validPackSize(slug, size)
    ? slug === "farm-eggs"
      ? `${size / 12} dozen`
      : `${size} ${rules[slug].unit}`
    : "";
}
export function packPackaging(slug: string) {
  return ruleFor(slug)?.unit === "ml" ? "Glass jar" : "Protective carton";
}
export function packLabel(slug: string, size: number) {
  const label = packSizeLabel(slug, size);
  return label
    ? `${label}${slug === "farm-eggs" ? ` · ${size} eggs` : ""} · ${packPackaging(slug)}`
    : "";
}
type BasePrice = { amountMinor: number; currency: string; packLabel: string };
/** Only the server-owned base price is used. Review prices exclude GST/delivery. */
export function packOptions(
  slug: string,
  price: BasePrice | null | undefined,
  market = "in",
) {
  const rule = ruleFor(slug);
  if (
    !rule ||
    market !== "in" ||
    price?.currency !== "INR" ||
    !Number.isSafeInteger(price.amountMinor) ||
    price.amountMinor <= 0 ||
    price.packLabel !== `${rule.sizes[0]} ${rule.unit}`
  )
    return null;
  const amounts = rule.basis.map((basis) => price.amountMinor * basis);
  if (amounts.some((amount) => !Number.isSafeInteger(amount))) return null;
  return rule.sizes.map((size, index) => ({
    size,
    label: packSizeLabel(slug, size),
    amountMinor: Math.round(amounts[index] / rule.basis[0]),
  }));
}
