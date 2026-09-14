import { internalMutation } from "./_generated/server";
import { categories, cropCatalogue } from "./catalogueData";

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
