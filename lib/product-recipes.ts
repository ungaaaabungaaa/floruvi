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
// Stable per product, so inspiration links spread over the recipes instead of
// piling onto the same alphabetical few.
function spread(seed: string) {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) hash = Math.imul(hash ^ seed.charCodeAt(i), 16777619);
  return hash >>> 0;
}
/** Every recipe that uses the crop (up to `max`), then related inspiration up to `min`. */
export function recipesForProduct<T extends Dish>(
  product: Crop,
  recipes: T[],
  cropCategories: Record<string, string> = {},
  { min = 5, max = 10 } = {},
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
  const direct = (recipe: T) => aliases.some((s) => recipe.crops.includes(s));
  const related = (recipe: T) =>
    (recipe.crops.some((crop) => cropCategories[crop] === product.category) ? 20 : 0) +
    (preferred.has(recipe.category) ? 10 : 0);
  const order = (a: T, b: T) =>
    spread(product.slug + a.slug) - spread(product.slug + b.slug);
  const matches = recipes.filter(direct).sort(order).slice(0, max);
  const inspiration = recipes
    .filter((recipe) => !direct(recipe))
    .sort((a, b) => related(b) - related(a) || order(a, b))
    .slice(0, Math.max(0, min - matches.length));
  return [...matches, ...inspiration].map((recipe) => ({
    recipe,
    direct: direct(recipe),
  }));
}
