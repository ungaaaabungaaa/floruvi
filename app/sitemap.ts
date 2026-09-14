import type { MetadataRoute } from "next";
import { getCatalogue } from "@/lib/catalogue";
import { getRecipes } from "@/lib/recipes";
import { siteUrl } from "@/lib/site";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ products }, recipes] = await Promise.all([
    getCatalogue(),
    getRecipes(),
  ]);
  return [
    "",
    "/products",
    "/boxes",
    "/contact",
    "/privacy",
    "/faq",
    "/recipes",
    "/how-we-grow",
    "/real-talk",
    ...recipes.map((r) => `/recipes/${r.slug}`),
    ...products.map((p) => `/products/${p.slug}`),
  ].map((path) => ({ url: `${siteUrl}${path}` }));
}
