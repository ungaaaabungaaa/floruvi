export type CartLine = { slug: string; quantity: number };
export const MAX_CART_LINES = 20;
export const MAX_QUANTITY = 99;

export function normalizeCart(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return [];
  const lines = new Map<string, number>();
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
    lines.set(
      item.slug,
      Math.min(MAX_QUANTITY, (lines.get(item.slug) ?? 0) + item.quantity),
    );
  }
  return [...lines].map(([slug, quantity]) => ({ slug, quantity }));
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
