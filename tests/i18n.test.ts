import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { languages } from "../lib/i18n/config";
import {
  fingerprint,
  matchesSource,
  productText,
  recipeText,
} from "../lib/i18n/content-source";
import { productDetailCatalogue } from "../convex/productDetailData";
import { cropCatalogue } from "../convex/catalogueData";
import { recipeCatalogue } from "../convex/recipeData";

const read = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const english = read("messages/en.json");
const translatedLanguages = Object.keys(languages).filter((l) => l !== "en");

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object") {
    const keys = Object.keys(value);
    // Plural objects may use different CLDR categories per language.
    if ("other" in value && keys.every((k) => ["zero", "one", "two", "few", "many", "other"].includes(k)))
      return "plural";
    return Object.fromEntries(keys.sort().map((k) => [k, shape((value as Record<string, unknown>)[k])]));
  }
  return typeof value;
}

test("every dictionary has the English keys, arrays and plural forms", () => {
  for (const language of translatedLanguages) {
    const messages = read(`messages/${language}.json`);
    assert.deepEqual(shape(messages), shape(english), language);
    assert.ok(messages.meta.titleTemplate.includes("%s"), language);
    assert.deepEqual(
      messages.privacy.sections.map((s: { id: string }) => s.id),
      english.privacy.sections.map((s: { id: string }) => s.id),
    );
    assert.deepEqual(Object.keys(messages.packLabels), Object.keys(english.packLabels));
  }
});

test("English source snapshots match the reviewed seed catalogue", () => {
  const products = read("content/i18n/en/products.json");
  const recipes = read("content/i18n/en/recipes.json");
  assert.equal(Object.keys(products).length, cropCatalogue.length);
  assert.equal(Object.keys(recipes).length, recipeCatalogue.length);
  for (const crop of cropCatalogue) {
    const details = productDetailCatalogue.find((d) => d.slug === crop.slug)!.details;
    const text = productText(crop, details);
    assert.equal(products[crop.slug].source, fingerprint(text), crop.slug);
  }
  for (const recipe of recipeCatalogue) {
    assert.equal(recipes[recipe.slug].source, fingerprint(recipeText(recipe)), recipe.slug);
  }
});

test("translations apply only to the English text they were made from", () => {
  const source = { name: "Spinach", description: "Leaves.", uses: ["Salads"], details: null };
  const translation = { ...source, name: "Spinat", description: "Blätter.", uses: ["Salate"], source: fingerprint(source) };
  assert.equal(matchesSource(source, translation), true);
  assert.equal(matchesSource({ ...source, description: "Changed." }, translation), false);
  assert.equal(matchesSource(source, { ...translation, uses: [] }), false);
  assert.equal(matchesSource(source, { ...translation, name: " " }), false);
});

test("available catalogue translations cover every product and recipe", () => {
  for (const language of translatedLanguages) {
    for (const file of ["products", "recipes"]) {
      const path = `content/i18n/${language}/${file}.json`;
      if (!existsSync(path)) continue;
      const source = read(`content/i18n/en/${file}.json`);
      const translated = read(path);
      assert.deepEqual(Object.keys(translated).sort(), Object.keys(source).sort(), path);
      for (const [slug, record] of Object.entries(source) as [string, { source: string }][]) {
        assert.equal(translated[slug].source, record.source, `${path}: ${slug}`);
        const { source: _english, ...englishText } = record as { source: string } & Record<string, unknown>;
        void _english;
        assert.equal(matchesSource(englishText, translated[slug]), true, `${path}: ${slug}`);
      }
    }
  }
});
