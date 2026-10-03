const nonVegetarianCategories = new Set([
  "Chicken",
  "Fish",
  "Prawns",
  "Mutton",
  "Eggs",
]);

/** Feature three non-vegetarian dishes and one vegetarian dish when available. */
export function featureRecipeOrder<
  T extends { slug: string; categoryKey: string },
>(items: T[]): T[] {
  const featured = [
    ...items
      .filter((item) => nonVegetarianCategories.has(item.categoryKey))
      .slice(0, 3),
    ...items
      .filter((item) => !nonVegetarianCategories.has(item.categoryKey))
      .slice(0, 1),
  ];
  const selected = new Set(featured.map((item) => item.slug));
  return [...featured, ...items.filter((item) => !selected.has(item.slug))];
}

/** A seeded shuffle keeps the same catalogue in the same order on every render. */
export function sessionOrder<T extends { slug: string }>(
  items: T[],
  seed: number | null,
): T[] {
  if (seed === null) return items;
  const shuffled = [...items].sort((a, b) => a.slug.localeCompare(b.slug));
  let state = seed >>> 0;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function readSessionSeed(
  storage: Pick<Storage, "getItem" | "setItem">,
  create: () => number,
): number {
  const key = "floruvi.recipes.seed.v1";
  try {
    const saved = storage.getItem(key);
    if (saved !== null && /^\d+$/.test(saved)) {
      const seed = Number(saved);
      if (Number.isInteger(seed) && seed >= 0 && seed <= 0xffffffff)
        return seed;
    }
  } catch {
    /* Storage can be disabled. Use the in-memory session instead. */
  }
  const seed = create();
  try {
    storage.setItem(key, String(seed));
  } catch {
    /* Keep the in-memory seed. */
  }
  return seed;
}
