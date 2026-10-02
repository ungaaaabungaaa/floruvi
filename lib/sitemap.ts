import { getRawCatalogue } from "./catalogue";
import { getRawRecipes, recipeImage } from "./recipes";
import { siteUrl } from "./site";
import { shareImage } from "./seo";
import { productPhotos } from "./product-photos";
import { categoryImages } from "./category-images";
import { isLocale, localizePath, locales, type Locale } from "./i18n/config";
import { languageAlternates } from "./i18n/alternates";
import { publishedCategories } from "./category-pages";

const staticPaths = [
  "/",
  "/products",
  "/boxes",
  "/recipes",
  "/how-we-grow",
  "/contact",
  "/faq",
  "/privacy",
  "/terms",
  "/refunds",
  "/shipping",
];

const escape = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const absolute = (path: string) => new URL(path, siteUrl).toString();

type SitemapImage = { src: string; width: number; height: number } | string;
const imageUrl = (image: SitemapImage) =>
  typeof image === "string" ? image : absolute(shareImage(image).url);

/** Public, indexable pages and the photos on each one (for image search). */
export async function publicEntries() {
  const [catalogue, recipes] = await Promise.all([getRawCatalogue(), getRawRecipes()]);
  const entry = (path: string, images: SitemapImage[] = []) => ({
    path,
    images: images.map(imageUrl),
  });
  return [
    ...staticPaths.map((path) => entry(path)),
    ...publishedCategories(catalogue).map((category) =>
      entry(
        `/products/category/${category.slug}`,
        categoryImages[category.slug] ? [categoryImages[category.slug]] : [],
      ),
    ),
    ...catalogue.products.map((product) =>
      entry(`/products/${product.slug}`, productPhotos(product.slug, product.imageUrl)),
    ),
    ...recipes.map((recipe) => {
      let image: SitemapImage[] = [];
      try {
        image = [recipeImage(recipe.imageKey)];
      } catch {
        // A recipe without a photo is still listed.
      }
      return entry(`/recipes/${recipe.slug}`, image);
    }),
  ];
}

export async function publicPaths() {
  return (await publicEntries()).map((item) => item.path);
}

export const sitemapFile = (locale: Locale) => `/sitemaps/${locale}.xml`;

export function sitemapIndex() {
  const entries = locales
    .map((locale) => `  <sitemap><loc>${escape(absolute(sitemapFile(locale)))}</loc></sitemap>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>\n`;
}

/** One sitemap per country & language version, with hreflang alternates. */
export async function localeSitemap(file: string) {
  const locale = file.replace(/\.xml$/, "");
  if (!file.endsWith(".xml") || !isLocale(locale)) return null;
  const urls = (await publicEntries()).map(({ path, images }) => {
    const links = Object.entries(languageAlternates(path))
      .map(
        ([hreflang, href]) =>
          `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${escape(absolute(href))}"/>`,
      )
      .join("\n");
    const photos = images
      .map((src) => `\n    <image:image><image:loc>${escape(src)}</image:loc></image:image>`)
      .join("");
    return `  <url>\n    <loc>${escape(absolute(localizePath(locale, path)))}</loc>\n${links}${photos}\n  </url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join("\n")}\n</urlset>\n`;
}
