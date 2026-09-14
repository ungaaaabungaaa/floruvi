import { query } from "./_generated/server";

export const browse = query({
  args: {},
  handler: async (ctx) => {
    const [categories, products] = await Promise.all([
      ctx.db.query("categories").collect(),
      ctx.db
        .query("products")
        .withIndex("by_published", (q) => q.eq("published", true))
        .collect(),
    ]);
    return {
      categories: categories
        .sort((a, b) => a.rank - b.rank)
        .map(({ slug, name, description, color, symbol }) => ({
          slug,
          name,
          description,
          color,
          symbol,
        })),
      products: await Promise.all(
        products
          .sort((a, b) => a.rank - b.rank)
          .map(async (p) => ({
            slug: p.slug,
            name: p.name,
            category: p.category,
            description: p.description,
            uses: p.uses,
            growingNote: p.growingNote,
            suitability: p.suitability,
            methods: p.methods,
            sourceUrl: p.sourceUrl,
            sourceNote: p.sourceNote,
            featured: p.featured,
            status: p.status,
            imageUrl: p.imageId ? await ctx.storage.getUrl(p.imageId) : null,
          })),
      ),
    };
  },
});
