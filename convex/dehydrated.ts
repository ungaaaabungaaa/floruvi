import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { dehydratedCategory, dehydratedProducts } from "./dehydratedData";

// Authenticated CLI only. Upload URLs are never exposed through a public function.
export const imageUploadUrl = internalMutation({
  args: {},
  returns: v.string(),
  handler: (ctx) => ctx.storage.generateUploadUrl(),
});

export const seed = internalMutation({
  args: { imageIds: v.optional(v.record(v.string(), v.id("_storage"))) },
  returns: v.object({
    added: v.number(),
    preserved: v.number(),
    imagesAdded: v.number(),
    total: v.number(),
  }),
  handler: async (ctx, { imageIds = {} }) => {
    if (
      !(await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", dehydratedCategory.slug))
        .unique())
    ) {
      await ctx.db.insert("categories", dehydratedCategory);
    }
    for (const slug of Object.keys(imageIds)) {
      if (!dehydratedProducts.some((p) => p.slug === slug))
        throw new Error("Unknown product image");
      if (!(await ctx.db.system.get(imageIds[slug])))
        throw new Error("Missing uploaded image");
    }
    let added = 0,
      imagesAdded = 0;
    for (const product of dehydratedProducts) {
      const existing = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", product.slug))
        .unique();
      const imageId = imageIds[product.slug];
      if (!existing) {
        await ctx.db.insert("products", {
          ...product,
          ...(imageId ? { imageId } : {}),
        });
        added++;
      } else if (!existing.imageId && imageId) {
        await ctx.db.patch(existing._id, { imageId });
        imagesAdded++;
      }
    }
    return {
      added,
      preserved: dehydratedProducts.length - added,
      imagesAdded,
      total: dehydratedProducts.length,
    };
  },
});

export const audit = internalQuery({
  args: {},
  returns: v.array(
    v.union(
      v.object({ slug: v.string(), missing: v.literal(true) }),
      v.object({
        slug: v.string(),
        name: v.string(),
        category: v.string(),
        description: v.string(),
        published: v.boolean(),
        imageUrl: v.union(v.string(), v.null()),
        price: v.optional(
          v.object({
            amountMinor: v.number(),
            currency: v.literal("INR"),
            packLabel: v.string(),
          }),
        ),
      }),
    ),
  ),
  handler: async (ctx) =>
    Promise.all(
      dehydratedProducts.map(async ({ slug }) => {
        const p = await ctx.db
          .query("products")
          .withIndex("by_slug", (q) => q.eq("slug", slug))
          .unique();
        return p
          ? {
              slug,
              name: p.name,
              category: p.category,
              description: p.description,
              price: p.price,
              published: p.published,
              imageUrl: p.imageId ? await ctx.storage.getUrl(p.imageId) : null,
            }
          : { slug, missing: true as const };
      }),
    ),
});
