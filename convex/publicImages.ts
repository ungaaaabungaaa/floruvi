import { v } from "convex/values";
import { internalMutation, type QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

export function publicImageUrl(key: string): string | null {
  const base = process.env.R2_PUBLIC_BASE_URL;
  if (!base) return null;
  try {
    const url = new URL(base);
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash)
      return null;
    if (
      !key.startsWith("flourvi/") ||
      key.split("/").some((part) => !part || part === "." || part === "..") ||
      /[\\?#]/.test(key)
    ) return null;
    return `${url.href.replace(/\/+$/, "")}/${key.split("/").map(encodeURIComponent).join("/")}`;
  } catch {
    return null;
  }
}

export async function publicProductImage(
  ctx: Pick<QueryCtx, "storage">,
  product: Doc<"products">,
) {
  if (
    product.publicImage &&
    product.publicImage.sourceImageId === product.imageId
  ) {
    const url = publicImageUrl(product.publicImage.key);
    if (url) return url;
  }
  return product.imageId ? ctx.storage.getUrl(product.imageId) : null;
}

export async function publicProductMedia(
  ctx: QueryCtx,
  product: Doc<"products">,
) {
  const image = product.publicImage;
  if (image && image.sourceImageId === product.imageId) {
    const url = publicImageUrl(image.key);
    if (url) return { url, size: image.size, contentType: image.contentType };
  }
  if (!product.imageId) return null;
  const metadata = await ctx.db.system.get(product.imageId);
  return metadata
    ? {
        url: await ctx.storage.getUrl(product.imageId),
        size: metadata.size,
        contentType: metadata.contentType,
      }
    : null;
}

// Owner CLI only. Upload and verify bytes first. Original files are retained.
export const migrate = internalMutation({
  args: {
    dryRun: v.boolean(),
    images: v.array(
      v.object({
        slug: v.string(),
        expectedUrl: v.string(),
        key: v.string(),
        sha256: v.string(),
        size: v.number(),
        contentType: v.string(),
      }),
    ),
  },
  returns: v.object({ checked: v.number(), updated: v.number() }),
  handler: async (ctx, { images, dryRun }) => {
    if (
      !images.length ||
      images.length > 100 ||
      new Set(images.map((i) => i.slug)).size !== images.length
    )
      throw new Error("Provide 1 to 100 distinct products");
    let updated = 0;
    for (const image of images) {
      if (
        !publicImageUrl(image.key) ||
        !/^[a-f0-9]{64}$/.test(image.sha256) ||
        !Number.isSafeInteger(image.size) ||
        image.size <= 0 ||
        !["image/webp", "image/png", "image/jpeg"].includes(image.contentType)
      )
        throw new Error("Invalid public image metadata");
      const product = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", image.slug))
        .unique();
      if (
        !product?.published ||
        !product.imageId ||
        (await ctx.storage.getUrl(product.imageId)) !== image.expectedUrl
      )
        throw new Error(`Image changed since audit: ${image.slug}`);
      const stored = await ctx.db.system.get(product.imageId);
      if (
        !stored ||
        stored.size !== image.size ||
        stored.contentType !== image.contentType
      )
        throw new Error(`Source metadata differs: ${image.slug}`);
      const next = {
        key: image.key,
        sha256: image.sha256,
        size: image.size,
        contentType: image.contentType,
        sourceImageId: product.imageId,
      };
      if (
        !product.publicImage ||
        Object.entries(next).some(
          ([key, value]) =>
            product.publicImage![key as keyof typeof next] !== value,
        )
      ) {
        if (!dryRun) await ctx.db.patch(product._id, { publicImage: next });
        updated++;
      }
    }
    return { checked: images.length, updated };
  },
});

export const rollback = internalMutation({
  args: {
    images: v.array(v.object({ slug: v.string(), expectedKey: v.string() })),
  },
  returns: v.number(),
  handler: async (ctx, { images }) => {
    if (!images.length || images.length > 100)
      throw new Error("Provide 1 to 100 products");
    let updated = 0;
    for (const image of images) {
      const product = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", image.slug))
        .unique();
      if (!product || product.publicImage?.key !== image.expectedKey)
        throw new Error("Image changed since migration");
      await ctx.db.patch(product._id, { publicImage: undefined });
      updated++;
    }
    return updated;
  },
});
