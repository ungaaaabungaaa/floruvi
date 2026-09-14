import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();
    return recipes
      .sort((a, b) => a.rank - b.rank)
      .map((r) => ({
        slug: r.slug,
        name: r.name,
        category: r.category,
        description: r.description,
        minutes: r.minutes,
        imageKey: r.imageKey,
        imageCaption: r.imageCaption,
        ingredientSearch: r.ingredients.join(" "),
        crops: r.crops,
      }));
  },
});
export const get = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const r = await ctx.db
      .query("recipes")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!r?.published) return null;
    return {
      slug: r.slug,
      name: r.name,
      category: r.category,
      description: r.description,
      minutes: r.minutes,
      prepMinutes: r.prepMinutes,
      cookMinutes: r.cookMinutes,
      servings: r.servings,
      ingredients: r.ingredients,
      steps: r.steps,
      tip: r.tip,
      crops: r.crops,
      imageKey: r.imageKey,
      imageCaption: r.imageCaption,
    };
  },
});
