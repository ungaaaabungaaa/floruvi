import { v } from "convex/values";
import { query, type QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { languages, markets, type Language, type Market } from "../lib/i18n/config";
import { matchesSource, productText, recipeText } from "../lib/i18n/content-source";
import { priceInMarket } from "../lib/markets/pricing-core";

// Localised public catalogue for one country & language version. Prices are
// calculated here from stored INR prices and the market's reviewed rates.
const languageArg = v.union(
  ...(Object.keys(languages) as Language[]).map((code) => v.literal(code)),
);
const marketArg = v.union(...(Object.keys(markets) as Market[]).map((code) => v.literal(code)));

async function marketPricing(ctx: QueryCtx, market: Market) {
  if (market === "in") return null;
  return ctx.db
    .query("marketPricing")
    .withIndex("by_market", (q) => q.eq("market", market))
    .unique();
}

function productTranslation(
  product: Doc<"products">,
  translation: Doc<"productTranslations"> | null | undefined,
) {
  const english = productText(product, product.details ?? null);
  return translation && matchesSource(english, translation) ? translation : null;
}

function summary(
  product: Doc<"products">,
  translation: Doc<"productTranslations"> | null,
  pricing: Doc<"marketPricing"> | null,
  market: Market,
  imageUrl: string | null,
) {
  return {
    slug: product.slug,
    category: product.category,
    featured: product.featured,
    imageUrl,
    englishName: product.name,
    name: translation?.name ?? product.name,
    description: translation?.description ?? product.description,
    uses: translation?.uses ?? product.uses,
    translated: !!translation,
    price: priceInMarket(product, market, pricing),
  };
}

export const catalogue = query({
  args: { language: languageArg, market: marketArg },
  handler: async (ctx, { language, market }) => {
    const [categories, products, commerce, pricing, translations] = await Promise.all([
      ctx.db.query("categories").collect(),
      ctx.db
        .query("products")
        .withIndex("by_published", (q) => q.eq("published", true))
        .collect(),
      ctx.db
        .query("storeSettings")
        .withIndex("by_key", (q) => q.eq("key", "commerce"))
        .unique(),
      marketPricing(ctx, market),
      language === "en"
        ? []
        : ctx.db
            .query("productTranslations")
            .withIndex("by_language_slug", (q) => q.eq("language", language))
            .collect(),
    ]);
    const bySlug = new Map(translations.map((t) => [t.slug, t]));
    return {
      commerce: commerce
        ? { currency: commerce.currency, deliveryFeeMinor: commerce.deliveryFeeMinor }
        : null,
      pricingRevision: pricing?.revision ?? null,
      categories: categories
        .sort((a, b) => a.rank - b.rank)
        .map(({ slug, name, description }) => ({ slug, name, description })),
      products: await Promise.all(
        products
          .sort((a, b) => a.rank - b.rank)
          .map(async (product) =>
            summary(
              product,
              productTranslation(product, bySlug.get(product.slug)),
              pricing,
              market,
              product.imageId ? await ctx.storage.getUrl(product.imageId) : null,
            ),
          ),
      ),
    };
  },
});

export const product = query({
  args: { slug: v.string(), language: languageArg, market: marketArg },
  handler: async (ctx, { slug, language, market }) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!product?.published) return null;
    const [pricing, stored] = await Promise.all([
      marketPricing(ctx, market),
      language === "en"
        ? null
        : ctx.db
            .query("productTranslations")
            .withIndex("by_language_slug", (q) => q.eq("language", language).eq("slug", slug))
            .unique(),
    ]);
    const translation = productTranslation(product, stored);
    const details = product.details ?? null;
    const imageUrl = product.imageId ? await ctx.storage.getUrl(product.imageId) : null;
    return {
      product: summary(product, translation, pricing, market, imageUrl),
      details:
        details && translation?.details
          ? {
              ...details,
              tagline: translation.details.tagline,
              preparation: translation.details.preparation,
              storage: translation.details.storage,
              nutritionTitle: translation.details.nutritionTitle,
              benefits: details.benefits.map((item, index) => ({
                ...item,
                ...translation.details!.benefits[index],
              })),
              nutrition: details.nutrition.map((item, index) => ({
                ...item,
                ...translation.details!.nutrition[index],
              })),
            }
          : details,
      // Recipe matching reads the stored English text.
      english: { name: product.name, description: product.description, uses: product.uses },
    };
  },
});

export const recipes = query({
  args: { language: languageArg },
  handler: async (ctx, { language }) => {
    const [recipes, translations] = await Promise.all([
      ctx.db
        .query("recipes")
        .withIndex("by_published", (q) => q.eq("published", true))
        .collect(),
      language === "en"
        ? []
        : ctx.db
            .query("recipeTranslations")
            .withIndex("by_language_slug", (q) => q.eq("language", language))
            .collect(),
    ]);
    const bySlug = new Map(translations.map((t) => [t.slug, t]));
    return recipes
      .sort((a, b) => a.rank - b.rank)
      .map((recipe) => {
        const stored = bySlug.get(recipe.slug);
        const translation = stored && matchesSource(recipeText(recipe), stored) ? stored : null;
        const text = translation ?? recipe;
        return {
          slug: recipe.slug,
          category: recipe.category,
          minutes: recipe.minutes,
          imageKey: recipe.imageKey,
          crops: recipe.crops,
          name: text.name,
          description: text.description,
          ingredientSearch: text.ingredients.join(" "),
          translated: !!translation,
        };
      });
  },
});

export const recipe = query({
  args: { slug: v.string(), language: languageArg },
  handler: async (ctx, { slug, language }) => {
    const recipe = await ctx.db
      .query("recipes")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!recipe?.published) return null;
    const stored =
      language === "en"
        ? null
        : await ctx.db
            .query("recipeTranslations")
            .withIndex("by_language_slug", (q) => q.eq("language", language).eq("slug", slug))
            .unique();
    const translation = stored && matchesSource(recipeText(recipe), stored) ? stored : null;
    const text = translation ?? recipe;
    return {
      slug: recipe.slug,
      name: text.name,
      englishName: recipe.name,
      category: recipe.category,
      description: text.description,
      minutes: recipe.minutes,
      prepMinutes: recipe.prepMinutes,
      cookMinutes: recipe.cookMinutes,
      servings: recipe.servings,
      ingredients: text.ingredients,
      steps: text.steps,
      tip: text.tip,
      crops: recipe.crops,
      imageKey: recipe.imageKey,
      translated: !!translation,
    };
  },
});
