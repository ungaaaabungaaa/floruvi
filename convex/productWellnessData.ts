import copy from "../content/product-wellness.json";
import { languages, type Language } from "../lib/i18n/config";
import {
  fingerprint,
  matchesSource,
  productText,
  type ProductText,
  type Translation,
} from "../lib/i18n/content-source";
import baseline from "./productWellnessBaseline.json";

export function wellnessKind(slug: string, category: string) {
  if (slug === "wheatgrass") return "wheatgrass";
  if (category === "edible-flowers") return "flower";
  if (category === "microgreens") return "micro";
  if (
    category === "herbs" ||
    [
      "ginger",
      "turmeric",
      "green-chillies",
      "jalapeno-peppers",
      "sorrel",
      "spring-onions",
    ].includes(slug)
  )
    return "herb";
  if (["strawberries", "muskmelon"].includes(slug)) return "fruit";
  if (slug === "potato") return "potato";
  return "vegetable";
}

/** Food-group guidance, not measured nutrition for this harvest. */
export function wellnessNotes(
  slug: string,
  category: string,
  language: Language,
  preparation: string,
) {
  const text = copy[language];
  const kind = wellnessKind(slug, category);
  const keys =
    kind === "vegetable"
      ? (["fibre", "weight"] as const)
      : kind === "fruit"
        ? (["fruitFibre", "fruitWeight"] as const)
        : kind === "potato"
          ? (["fibre", "potato"] as const)
          : ([kind] as const);
  return keys.map((key) => ({
    icon: key === "fibre" || key === "fruitFibre" ? "leaf" : "utensils",
    title: text[key][0],
    // Make the food swap actionable for the particular crop.
    text: text[key][1] + (key === "weight" ? ` ${preparation}` : ""),
  }));
}

/** Expand existing translated copy without replacing the owner's wording. */
export function expandedProductText(
  record: ProductText,
  slug: string,
  category: string,
  language: Language,
): ProductText {
  if (!record.details) throw new Error(`Missing product details: ${slug}`);
  const [pairing, serving] = record.details.benefits.slice(3, 5);
  if (!pairing || !serving) throw new Error(`Missing serving notes: ${slug}`);
  return {
    ...record,
    description: `${record.description} ${pairing.text} ${serving.text}`,
    details: {
      ...record.details,
      nutrition: [
        ...record.details.nutrition,
        ...wellnessNotes(
          slug,
          category,
          language,
          record.details.preparation,
        ).map(({ title, text }) => ({ title, text })),
      ],
    },
  };
}

const translatedLanguages = (Object.keys(languages) as Language[]).filter(
  (language) => language !== "en",
);

/** One product and its translations must be ready together, or all stay intact. */
export function planWellnessUpdate(
  slug: string,
  category: string,
  current: ProductText,
  translations: Partial<Record<Language, Translation<ProductText>>>,
) {
  const expected = (
    baseline as Record<string, { before: string; after: string }>
  )[slug];
  const source = fingerprint(current);
  if (!expected)
    return { status: "skipped" as const, reason: "Unknown product" };
  if (source === expected.after) return { status: "unchanged" as const };
  if (source !== expected.before)
    return {
      status: "skipped" as const,
      reason: "English content changed; preserve owner edits",
    };
  const missing = translatedLanguages.filter(
    (language) => !matchesSource(current, translations[language]),
  );
  if (missing.length)
    return {
      status: "skipped" as const,
      reason: `Missing or stale translations: ${missing.join(", ")}`,
    };
  const english = expandedProductText(current, slug, category, "en");
  const nextSource = fingerprint(english);
  if (nextSource !== expected.after)
    throw new Error(`Unexpected content revision: ${slug}`);
  const translated = translatedLanguages.map((language) => ({
    language,
    ...expandedProductText(
      productText(translations[language]!, translations[language]!.details),
      slug,
      category,
      language,
    ),
    source: nextSource,
  }));
  return { status: "update" as const, english, translations: translated };
}
