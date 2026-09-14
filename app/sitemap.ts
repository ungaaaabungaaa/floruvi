import type { MetadataRoute } from "next";
import { getCatalogue } from "@/lib/catalogue";
import { recipes } from "@/lib/recipes";
import { siteUrl } from "@/lib/site";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, categories } = await getCatalogue();
  return [
    "",
    "/products",
    "/categories",
    "/our-farm",
    "/wholesale",
    "/contact",
    "/privacy",
    "/delivery",
    "/faq",
    "/recipes",
    "/health",
    "/how-we-grow",
    "/sustainability",
    "/real-talk",
    ...recipes.map((r) => `/recipes/${r.slug}`),
    ...products.map((p) => `/products/${p.slug}`),
    ...categories.map((c) => `/categories/${c.slug}`),
  ].map((path) => ({ url: `${siteUrl}${path}` }));
}
