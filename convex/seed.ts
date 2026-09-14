import { recipeCatalogue } from "./recipeData";
import { internalMutation } from "./_generated/server";
import { categories, cropCatalogue } from "./catalogueData";
import {
  pricingBenchmarks,
  pricingRevision,
  deliveryFeeMinor,
} from "./pricingData";

// Run only through the authenticated Convex CLI. Preserve existing owner edits.
export const catalogue = internalMutation({
  args: {},
  handler: async (ctx) => {
    let added = 0;
    for (const category of categories) {
      if (
        !(await ctx.db
          .query("categories")
          .withIndex("by_slug", (q) => q.eq("slug", category.slug))
          .unique())
      )
        await ctx.db.insert("categories", category);
    }
    for (const product of cropCatalogue) {
      if (
        !(await ctx.db
          .query("products")
          .withIndex("by_slug", (q) => q.eq("slug", product.slug))
          .unique())
      ) {
        await ctx.db.insert("products", product);
        added++;
      }
    }
    return { added, totalSeedCrops: cropCatalogue.length };
  },
});

// Additive and repeatable: never overwrite an owner's price, image, or crop edit.
export const pricing = internalMutation({
  args: {},
  handler: async (ctx) => {
    let added = 0;
    for (const benchmark of pricingBenchmarks) {
      const product = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", benchmark.slug))
        .unique();
      if (!product) throw new Error(`Seed catalogue first: ${benchmark.slug}`);
      if (product.price !== undefined) continue;
      const amountMinor = Math.round((benchmark.retailMinor * 140) / 100);
      if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0)
        throw new Error("Invalid seed price");
      await ctx.db.patch(product._id, {
        price: { amountMinor, currency: "INR", packLabel: benchmark.packLabel },
        pricingRevision,
      });
      added++;
    }
    const settings = await ctx.db
      .query("storeSettings")
      .withIndex("by_key", (q) => q.eq("key", "commerce"))
      .unique();
    if (!settings)
      await ctx.db.insert("storeSettings", {
        key: "commerce",
        currency: "INR",
        deliveryFeeMinor,
      });
    return {
      added,
      preserved: pricingBenchmarks.length - added,
      deliveryAdded: !settings,
      revision: pricingRevision,
    };
  },
});

// Adds missing recipes and preserves all existing editorial changes.
export const recipes = internalMutation({
  args: {},
  handler: async (ctx) => {
    let added = 0;
    for (const recipe of recipeCatalogue) {
      const existing = await ctx.db
        .query("recipes")
        .withIndex("by_slug", (q) => q.eq("slug", recipe.slug))
        .unique();
      if (!existing) {
        await ctx.db.insert("recipes", recipe);
        added++;
      }
    }
    return {
      added,
      preserved: recipeCatalogue.length - added,
      totalSeedRecipes: recipeCatalogue.length,
    };
  },
});
