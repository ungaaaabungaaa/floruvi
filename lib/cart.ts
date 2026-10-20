import { isPantry, validWeight } from "./pantry-weights";
export type CartLine = { slug: string; quantity: number; weightGrams?: number };
export const MAX_CART_LINES = 20;
export const MAX_QUANTITY = 99;

export function normalizeCart(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return [];
  const lines = new Map<string, CartLine>();
  for (const item of value.slice(0, 200)) {
    if (
      !item ||
      typeof item !== "object" ||
      typeof item.slug !== "string" ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug) ||
      item.slug.length > 100 ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 1
    )
      continue;
    if (!lines.has(item.slug) && lines.size >= MAX_CART_LINES) continue;
    if (item.weightGrams !== undefined) {
      if (
        !isPantry(item.slug) ||
        !validWeight(item.weightGrams) ||
        item.quantity !== 1
      )
        continue;
      lines.set(item.slug, {
        slug: item.slug,
        quantity: 1,
        weightGrams: item.weightGrams,
      });
    } else if (!lines.get(item.slug)?.weightGrams) {
      lines.set(item.slug, {
        slug: item.slug,
        quantity: Math.min(
          MAX_QUANTITY,
          (lines.get(item.slug)?.quantity ?? 0) + item.quantity,
        ),
      });
    }
  }
  return [...lines.values()];
}

export function updateCart(
  lines: CartLine[],
  slug: string,
  quantity: number,
): CartLine[] {
  const rest = lines.filter((line) => line.slug !== slug);
  if (quantity <= 0) return rest;
  const existing = lines.findIndex((line) => line.slug === slug);
  if (existing >= 0)
    return normalizeCart(
      lines.map((line) => (line.slug === slug ? { slug, quantity } : line)),
    );
  return normalizeCart([...rest, { slug, quantity }]);
}
