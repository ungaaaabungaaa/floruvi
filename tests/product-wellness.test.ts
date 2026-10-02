import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { cropCatalogue } from "../convex/catalogueData";
import {
  planWellnessUpdate,
  wellnessKind,
} from "../convex/productWellnessData";
import baseline from "../convex/productWellnessBaseline.json";
import {
  fingerprint,
  productText,
  type ProductText,
  type Translation,
} from "../lib/i18n/content-source";
import { languages, type Language } from "../lib/i18n/config";

const snapshots = Object.fromEntries(
  Object.keys(languages).map((language) => [
    language,
    JSON.parse(readFileSync(`content/i18n/${language}/products.json`, "utf8")),
  ]),
) as Record<Language, Record<string, Translation<ProductText>>>;

// Recover the previous editorial record from its retained flavour/nutrient rows.
// The checked-in before fingerprint proves this is the actual prior revision.
function previous(slug: string, language: Language) {
  const record = structuredClone(snapshots[language][slug]);
  record.description = record.details!.benefits[0].text;
  record.details!.nutrition = record.details!.nutrition.slice(
    0,
    slug === "spinach" ? 4 : 3,
  );
  record.source = (baseline as Record<string, { before: string }>)[slug].before;
  return record;
}
function translations(slug: string) {
  return Object.fromEntries(
    Object.keys(languages)
      .filter((l) => l !== "en")
      .map((l) => [l, previous(slug, l as Language)]),
  );
}

test("all 91 revisions update English and all nine translations together", () => {
  for (const crop of cropCatalogue) {
    const old = previous(crop.slug, "en");
    const text = productText(old, old.details);
    assert.equal(fingerprint(text), old.source, crop.slug);
    const plan = planWellnessUpdate(
      crop.slug,
      crop.category,
      text,
      translations(crop.slug),
    );
    assert.equal(plan.status, "update", crop.slug);
    if (plan.status !== "update") throw new Error(crop.slug);
    assert.equal(plan.translations.length, 9);
    assert.deepEqual(
      plan.english,
      productText(snapshots.en[crop.slug], snapshots.en[crop.slug].details),
    );
    assert.ok(plan.english.description.length > old.description.length + 50);
    for (const translated of plan.translations) {
      const expected = snapshots[translated.language][crop.slug];
      assert.deepEqual(
        productText(translated, translated.details),
        productText(expected, expected.details),
      );
      assert.equal(translated.source, snapshots.en[crop.slug].source);
    }
  }
});

test("owner English edits and missing or stale translations block the whole product update", () => {
  const old = previous("spinach", "en");
  const text = productText(old, old.details);
  assert.equal(
    planWellnessUpdate(
      "spinach",
      "leafy-greens",
      { ...text, description: "Owner's new wording." },
      translations("spinach"),
    ).status,
    "skipped",
  );
  const missing = translations("spinach");
  delete missing.ar;
  const missingResult = planWellnessUpdate(
    "spinach",
    "leafy-greens",
    text,
    missing,
  );
  assert.equal(missingResult.status, "skipped");
  assert.ok(
    missingResult.status === "skipped" && missingResult.reason.includes("ar"),
  );
  const stale = translations("spinach");
  stale.ja.source = "old-source";
  assert.equal(
    planWellnessUpdate("spinach", "leafy-greens", text, stale).status,
    "skipped",
  );
});

test("translation wording edits remain and a second run adds no duplicate copy", () => {
  const old = previous("spinach", "en");
  const translated = translations("spinach");
  translated.de.description = "Vom Besitzer geprüfter deutscher Text.";
  const plan = planWellnessUpdate(
    "spinach",
    "leafy-greens",
    productText(old, old.details),
    translated,
  );
  assert.equal(plan.status, "update");
  if (plan.status !== "update") throw new Error("Expected update");
  assert.ok(
    plan.translations
      .find((t) => t.language === "de")!
      .description.startsWith(translated.de.description),
  );
  assert.equal(
    planWellnessUpdate("spinach", "leafy-greens", plan.english, {}).status,
    "unchanged",
  );
});

test("seasonings and small garnishes do not inherit whole-vegetable weight claims", () => {
  for (const crop of cropCatalogue) {
    const kind = wellnessKind(crop.slug, crop.category);
    if (["herb", "micro", "flower", "wheatgrass"].includes(kind)) {
      const rows = snapshots.en[crop.slug].details!.nutrition;
      assert.ok(
        !rows.some((row) =>
          ["Weight-conscious meals", "Fibre & digestion"].includes(row.title),
        ),
        crop.slug,
      );
    }
  }
  assert.equal(wellnessKind("potato", "roots-and-stems"), "potato");
  assert.equal(wellnessKind("strawberries", "fruiting-crops"), "fruit");
  assert.equal(wellnessKind("broccoli-microgreens", "microgreens"), "micro");
  assert.equal(wellnessKind("ginger", "roots-and-stems"), "herb");
});
