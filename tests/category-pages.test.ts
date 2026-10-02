import test from "node:test";
import assert from "node:assert/strict";
import { publishedCategories } from "../lib/category-pages";
import { categories, cropCatalogue } from "../convex/catalogueData";
import { languageAlternates } from "../lib/i18n/alternates";
import { locales, localizePath, parseLocale } from "../lib/i18n/config";

test("only supported categories with published products enter navigation and sitemaps", () => {
  const catalogue = {
    categories: [
      { slug: "herbs", name: "Fresh herbs" },
      { slug: "microgreens", name: "Microgreens" },
      { slug: "unreviewed", name: "No page content yet" },
    ],
    products: [
      { category: "herbs", inStock: false },
      { category: "unreviewed", inStock: true },
    ],
  };
  assert.deepEqual(publishedCategories(catalogue), [catalogue.categories[0]]);
  assert.deepEqual(publishedCategories({ ...catalogue, products: [] }), []);
});

test("all catalogue categories have reciprocal locale addresses including their own version", () => {
  const published = publishedCategories({
    categories,
    products: cropCatalogue,
  });
  assert.equal(published.length, categories.length);
  for (const category of published) {
    const path = `/products/category/${category.slug}`;
    const alternates = languageAlternates(path);
    assert.equal(Object.keys(alternates).length, locales.length + 1);
    assert.equal(alternates["x-default"], path);
    for (const locale of locales) {
      assert.equal(
        alternates[parseLocale(locale).tag],
        localizePath(locale, path),
      );
    }
  }
});
