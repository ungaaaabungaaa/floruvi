import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import {
  honeyEggProducts,
  honeyEggCategories,
  honeyRecipes,
} from "../lib/honey-eggs-data";
import { recipeCatalogue } from "./recipeData";

/** Owner-authenticated CLI only. Add records without overwriting owner edits. */
export const seed = internalMutation({
  args: {},
  returns: v.object({
    productsAdded: v.number(),
    productsPreserved: v.number(),
    categoriesAdded: v.number(),
    recipesAdded: v.number(),
    recipesPreserved: v.number(),
    eggRecipeLinksAdded: v.number(),
  }),
  handler: async (ctx) => {
    let productsAdded = 0,
      categoriesAdded = 0,
      recipesAdded = 0,
      eggRecipeLinksAdded = 0;
    for (const [index, category] of honeyEggCategories.entries()) {
      const prior = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", category.slug))
        .unique();
      if (!prior) {
        await ctx.db.insert("categories", {
          ...category,
          color: "#f0e9d5",
          symbol: "leaf",
          rank: 7 + index,
        });
        categoriesAdded++;
      }
    }
    for (const [index, product] of honeyEggProducts.entries()) {
      const prior = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", product.slug))
        .unique();
      if (prior) continue;
      await ctx.db.insert("products", {
        ...product,
        price: { ...product.price, currency: "INR" },
        featured: false,
        published: true,
        status: "enquiry",
        rank: 120 + index,
        suitability: "established",
        methods: ["Sourced food"],
        growingNote: "Follow the product pack instructions.",
        sourceUrl: "https://floruvi.com/products/" + product.slug,
        sourceNote:
          "Product range, sizes and net review prices approved by the owner on 27 October 2026. Supplier and batch claims require verification before fulfilment.",
        pricingRevision: "honey-eggs-net-2026-10-27",
      });
      productsAdded++;
    }
    for (const [index, recipe] of honeyRecipes.entries()) {
      const prior = await ctx.db
        .query("recipes")
        .withIndex("by_slug", (q) => q.eq("slug", recipe.slug))
        .unique();
      if (prior) continue;
      await ctx.db.insert("recipes", {
        ...recipe,
        imageCaption: "Illustrative serving image",
        rank: 300 + index,
        published: true,
      });
      recipesAdded++;
    }
    // Bounded lookups of known egg recipes. Preserve all current editorial text.
    for (const recipe of recipeCatalogue.filter((r) =>
      r.ingredients.some((i) => /\beggs?\b/i.test(i)),
    )) {
      const prior = await ctx.db
        .query("recipes")
        .withIndex("by_slug", (q) => q.eq("slug", recipe.slug))
        .unique();
      if (
        prior &&
        prior.ingredients.some((i) => /\beggs?\b/i.test(i)) &&
        !prior.crops.includes("farm-eggs")
      ) {
        await ctx.db.patch(prior._id, { crops: [...prior.crops, "farm-eggs"] });
        eggRecipeLinksAdded++;
      }
    }
    return {
      productsAdded,
      productsPreserved: honeyEggProducts.length - productsAdded,
      categoriesAdded,
      recipesAdded,
      recipesPreserved: honeyRecipes.length - recipesAdded,
      eggRecipeLinksAdded,
    };
  },
});
