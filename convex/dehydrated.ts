import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { dehydratedCategory, dehydratedProducts } from "./dehydratedData";

// Authenticated CLI only. Upload URLs are never exposed through a public function.
export const imageUploadUrl = internalMutation({
  args: {},
  returns: v.string(),
  handler: (ctx) => ctx.storage.generateUploadUrl(),
});

// Owner CLI only. Compare the current URL to the saved audit before changing it.
// All 11 replacements commit together; a concurrent owner edit aborts the batch.
export const replaceImages = internalMutation({
  args: {
    images: v.array(
      v.object({
        slug: v.string(),
        imageId: v.id("_storage"),
        expectedUrl: v.union(v.string(), v.null()),
      }),
    ),
  },
  returns: v.object({ updated: v.number(), deleted: v.number() }),
  handler: async (ctx, { images }) => {
    const expected = new Set<string>(dehydratedProducts.map((p) => p.slug));
    if (
      images.length !== expected.size ||
      new Set(images.map((p) => p.slug)).size !== expected.size
    )
      throw new Error("Provide exactly 11 distinct pantry products");
    const changes = [];
    for (const image of images) {
      if (!expected.has(image.slug)) throw new Error("Unknown pantry product");
      const product = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", image.slug))
        .unique();
      if (!product) throw new Error(`Missing product: ${image.slug}`);
      const metadata = await ctx.db.system.get(image.imageId);
      if (!metadata || metadata.contentType !== "image/webp")
        throw new Error("Expected an uploaded WebP image");
      const currentUrl = product.imageId
        ? await ctx.storage.getUrl(product.imageId)
        : null;
      if (currentUrl !== image.expectedUrl)
        throw new Error(`Image changed since audit: ${image.slug}`);
      changes.push({ product, imageId: image.imageId });
    }
    // Bounded maintenance scan: never delete a file still used by another product.
    const products = await ctx.db.query("products").take(1000);
    if (products.length === 1000)
      throw new Error("Catalogue exceeds maintenance scan limit");
    let updated = 0;
    const oldIds = new Set<
      NonNullable<(typeof changes)[number]["product"]["imageId"]>
    >();
    for (const { product, imageId } of changes) {
      if (product.imageId === imageId) continue;
      await ctx.db.patch(product._id, { imageId });
      if (product.imageId) oldIds.add(product.imageId);
      updated++;
    }
    const replacements = new Map(
      changes.map(({ product, imageId }) => [product._id, imageId]),
    );
    const used = new Set(
      products.map((p) => replacements.get(p._id) ?? p.imageId),
    );
    let deleted = 0;
    for (const id of oldIds) {
      if (!used.has(id)) {
        await ctx.storage.delete(id);
        deleted++;
      }
    }
    return { updated, deleted };
  },
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
