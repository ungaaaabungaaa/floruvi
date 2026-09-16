import { getRawCatalogue } from "./catalogue";
import { getRawRecipes } from "./recipes";
import { siteUrl } from "./site";
import { isLocale, localizePath, locales, type Locale } from "./i18n/config";
import { languageAlternates } from "./i18n/alternates";

const staticPaths = [
  "/",
  "/products",
  "/boxes",
  "/recipes",
  "/how-we-grow",
  "/contact",
  "/faq",
  "/privacy",
];

const escape = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const absolute = (path: string) => new URL(path, siteUrl).toString();

export async function publicPaths() {
  const [{ products }, recipes] = await Promise.all([getRawCatalogue(), getRawRecipes()]);
  return [
    ...staticPaths,
    ...products.map((product) => `/products/${product.slug}`),
    ...recipes.map((recipe) => `/recipes/${recipe.slug}`),
  ];
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
  const urls = (await publicPaths()).map((path) => {
    const links = Object.entries(languageAlternates(path))
      .map(
        ([hreflang, href]) =>
          `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${escape(absolute(href))}"/>`,
      )
      .join("\n");
    return `  <url>\n    <loc>${escape(absolute(localizePath(locale, path)))}</loc>\n${links}\n  </url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`;
}
