// Translatable catalogue text. Keys and array order must match Convex records.

export type ProductText = {
  name: string;
  description: string;
  uses: string[];
  details: {
    tagline: string;
    benefits: { title: string; text: string }[];
    preparation: string;
    storage: string;
    nutritionTitle: string;
    nutrition: { title: string; text: string }[];
  } | null;
};
export type RecipeText = {
  name: string;
  description: string;
  ingredients: string[];
  steps: string[];
  tip: string;
};
export type Translation<T> = T & { source: string };

type ProductRecord = {
  name: string;
  description: string;
  uses: string[];
};
type DetailsRecord = {
  tagline: string;
  benefits: { title: string; text: string }[];
  preparation: string;
  storage: string;
  nutritionTitle: string;
  nutrition: { title: string; text: string }[];
} | null;

export function productText(product: ProductRecord, details: DetailsRecord): ProductText {
  return {
    name: product.name,
    description: product.description,
    uses: [...product.uses],
    details: details
      ? {
          tagline: details.tagline,
          benefits: details.benefits.map(({ title, text }) => ({ title, text })),
          preparation: details.preparation,
          storage: details.storage,
          nutritionTitle: details.nutritionTitle,
          nutrition: details.nutrition.map(({ title, text }) => ({ title, text })),
        }
      : null,
  };
}

export function recipeText(recipe: RecipeText): RecipeText {
  return {
    name: recipe.name,
    description: recipe.description,
    ingredients: [...recipe.ingredients],
    steps: [...recipe.steps],
    tip: recipe.tip,
  };
}

/** FNV-1a fingerprint of the English source. A changed record falls back to English. */
export function fingerprint(value: unknown) {
  const text = JSON.stringify(value);
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/** Use a translation only when it was made from the same English text and shape. */
export function matchesSource<T extends object>(
  english: T,
  translation: Translation<T> | undefined,
): translation is Translation<T> {
  if (!translation || translation.source !== fingerprint(english)) return false;
  return sameShape(english, translation);
}

function sameShape(a: unknown, b: unknown): boolean {
  if (Array.isArray(a))
    return Array.isArray(b) && a.length === b.length && a.every((v, i) => sameShape(v, b[i]));
  if (a && typeof a === "object") {
    if (!b || typeof b !== "object" || Array.isArray(b)) return false;
    return Object.keys(a).every((key) =>
      sameShape((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]),
    );
  }
  if (a === null) return b === null;
  return typeof a === typeof b && (typeof a !== "string" || (b as string).trim().length > 0);
}
