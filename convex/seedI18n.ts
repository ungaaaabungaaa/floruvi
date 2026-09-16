import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { languages, markets, type Language, type Market } from "../lib/i18n/config";

// Run only through the authenticated Convex CLI: scripts/i18n/seed-convex.ts.
// Repeatable. A record is replaced only when its source changes (a new study
// revision or new English text), so dashboard edits to the same source stay.

const translated = (Object.keys(languages) as Language[]).filter((code) => code !== "en");
const languageArg = v.union(...translated.map((code) => v.literal(code)));
const rates = v.record(v.string(), v.number());
const validRate = (rate: number) => Number.isFinite(rate) && rate > 0;

export const marketPricing = internalMutation({
  args: {
    revision: v.string(),
    markets: v.array(
      v.object({
        market: v.string(),
        currency: v.string(),
        stepMinor: v.number(),
        categoryRates: rates,
        productRates: rates,
        researchedOn: v.string(),
        observationsUsed: v.number(),
      }),
    ),
  },
  handler: async (ctx, { revision, markets: rows }) => {
    let inserted = 0;
    let replaced = 0;
    let kept = 0;
    for (const row of rows) {
      const config = markets[row.market as Market];
      if (!config || row.market === "in" || config.currency !== row.currency)
        throw new Error(`Invalid market pricing: ${row.market}`);
      if (
        !Number.isSafeInteger(row.stepMinor) ||
        row.stepMinor <= 0 ||
        !Object.values(row.categoryRates).every(validRate) ||
        !Object.values(row.productRates).every(validRate)
      )
        throw new Error(`Invalid rates: ${row.market}`);
      const existing = await ctx.db
        .query("marketPricing")
        .withIndex("by_market", (q) => q.eq("market", row.market))
        .unique();
      if (!existing) {
        await ctx.db.insert("marketPricing", { ...row, revision });
        inserted++;
      } else if (existing.revision !== revision) {
        await ctx.db.replace(existing._id, { ...row, revision });
        replaced++;
      } else kept++;
    }
    return { inserted, replaced, kept, revision };
  },
});

const textPair = v.object({ title: v.string(), text: v.string() });

export const productTranslations = internalMutation({
  args: {
    language: languageArg,
    records: v.array(
      v.object({
        slug: v.string(),
        source: v.string(),
        name: v.string(),
        description: v.string(),
        uses: v.array(v.string()),
        details: v.union(
          v.null(),
          v.object({
            tagline: v.string(),
            benefits: v.array(textPair),
            preparation: v.string(),
            storage: v.string(),
            nutritionTitle: v.string(),
            nutrition: v.array(textPair),
          }),
        ),
      }),
    ),
  },
  handler: async (ctx, { language, records }) => {
    const counts = { inserted: 0, replaced: 0, kept: 0, unknown: 0 };
    for (const record of records) {
      const product = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", record.slug))
        .unique();
      if (!product) {
        counts.unknown++;
        continue;
      }
      const existing = await ctx.db
        .query("productTranslations")
        .withIndex("by_language_slug", (q) => q.eq("language", language).eq("slug", record.slug))
        .unique();
      if (!existing) {
        await ctx.db.insert("productTranslations", { language, ...record });
        counts.inserted++;
      } else if (existing.source !== record.source) {
        await ctx.db.replace(existing._id, { language, ...record });
        counts.replaced++;
      } else counts.kept++;
    }
    return counts;
  },
});

export const recipeTranslations = internalMutation({
  args: {
    language: languageArg,
    records: v.array(
      v.object({
        slug: v.string(),
        source: v.string(),
        name: v.string(),
        description: v.string(),
        ingredients: v.array(v.string()),
        steps: v.array(v.string()),
        tip: v.string(),
      }),
    ),
  },
  handler: async (ctx, { language, records }) => {
    const counts = { inserted: 0, replaced: 0, kept: 0, unknown: 0 };
    for (const record of records) {
      const recipe = await ctx.db
        .query("recipes")
        .withIndex("by_slug", (q) => q.eq("slug", record.slug))
        .unique();
      if (!recipe) {
        counts.unknown++;
        continue;
      }
      const existing = await ctx.db
        .query("recipeTranslations")
        .withIndex("by_language_slug", (q) => q.eq("language", language).eq("slug", record.slug))
        .unique();
      if (!existing) {
        await ctx.db.insert("recipeTranslations", { language, ...record });
        counts.inserted++;
      } else if (existing.source !== record.source) {
        await ctx.db.replace(existing._id, { language, ...record });
        counts.replaced++;
      } else counts.kept++;
    }
    return counts;
  },
});
