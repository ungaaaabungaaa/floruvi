/** Only categories with reviewed page templates can enter public navigation. */
export const categorySlugs = [
  "leafy-greens",
  "herbs",
  "microgreens",
  "fruiting-crops",
  "roots-and-stems",
  "edible-flowers",
] as const;

export type CategorySlug = (typeof categorySlugs)[number];

export function isCategorySlug(slug: string): slug is CategorySlug {
  return categorySlugs.some((value) => value === slug);
}

/** Empty categories have no search page until products are published in Convex. */
export function publishedCategories<T extends { slug: string }>({
  categories,
  products,
}: {
  categories: T[];
  products: { category: string }[];
}) {
  const populated = new Set(products.map((product) => product.category));
  return categories.filter(
    (category) => isCategorySlug(category.slug) && populated.has(category.slug),
  );
}
