type Crop = { slug: string; category: string; uses: string[] };
type Dish = { slug: string; category: string; crops: string[] };
const alternatives: Record<string, string[]> = {
  "radish-microgreens-live-tray": ["radish-microgreens"],
  "pea-microgreens-live-tray": ["pea-shoots"],
  "sunflower-microgreens-live-tray": ["sunflower-shoots"],
  "broccoli-microgreens-live-tray": ["broccoli-microgreens"],
  "fenugreek-microgreens-live-tray": ["fenugreek-microgreens"],
  "red-amaranth-microgreens-live-tray": ["amaranth-microgreens"],
};
export function recipesForProduct<T extends Dish>(
  product: Crop,
  recipes: T[],
  limit = 5,
) {
  const aliases = [product.slug, ...(alternatives[product.slug] ?? [])];
  const text = product.uses.join(" ").toLowerCase();
  const preferred = new Set<string>();
  if (/salad|garnish|plating/.test(text)) preferred.add("Salads");
  if (/soup|broth/.test(text)) preferred.add("Soups");
  if (/pasta|pesto|sauce/.test(text)) preferred.add("Pasta");
  if (/drink|juic|infusion|fruit|dessert/.test(text))
    preferred.add("Smoothies");
  if (/roast|grill|baking/.test(text)) preferred.add("Tray bakes");
  if (/sandwich|wrap|taco/.test(text)) preferred.add("Wraps");
  if (/dal|curry|rice|bowl/.test(text)) preferred.add("Bowls");
  if (/egg|bread|paratha/.test(text)) preferred.add("Breakfast");
  const score = (recipe: T) =>
    aliases.some((s) => recipe.crops.includes(s))
      ? 100
      : preferred.has(recipe.category)
        ? 10
        : 0;
  return [...recipes]
    .sort((a, b) => score(b) - score(a) || a.slug.localeCompare(b.slug))
    .slice(0, limit)
    .map((recipe) => ({
      recipe,
      direct: aliases.some((s) => recipe.crops.includes(s)),
    }));
}
