import test from "node:test";
import assert from "node:assert/strict";
import { productDetailCatalogue } from "../convex/productDetailData";
import { cropCatalogue } from "../convex/catalogueData";
import { recipeCatalogue } from "../convex/recipeData";
import { recipesForProduct } from "../lib/product-recipes";

test("all 91 products have complete details and one of six banner choices", () => {
  assert.equal(productDetailCatalogue.length, 91);
  assert.equal(new Set(productDetailCatalogue.map((p) => p.slug)).size, 91);
  assert.equal(
    new Set(productDetailCatalogue.map((p) => p.details.bannerIndex)).size,
    6,
  );
  for (const product of cropCatalogue) {
    const details = productDetailCatalogue.find(
      (p) => p.slug === product.slug,
    )?.details;
    assert.ok(details, product.slug);
    assert.ok(details.preparation.length > 20 && details.storage.length > 20);
    assert.ok(details.benefits.length === 5 && details.nutrition.length >= 3);
    assert.ok(details.nutritionSource.startsWith("https://"));
    assert.ok(
      !JSON.stringify(details).match(
        /cures|detox|prevents disease|pesticide.free/i,
      ),
    );
    const linked = recipesForProduct(product, recipeCatalogue);
    assert.ok(linked.length >= 5 && linked.length <= 10, product.slug);
    assert.equal(new Set(linked.map((m) => m.recipe.slug)).size, linked.length);
    assert.ok(
      linked.every((m) =>
        recipeCatalogue.some((r) => r.slug === m.recipe.slug),
      ),
    );
  }
});
test("direct crop recipes lead and unrelated recipes are labelled as inspiration", () => {
  const spinach = cropCatalogue.find((p) => p.slug === "spinach")!;
  const matches = recipesForProduct(spinach, recipeCatalogue);
  assert.ok(
    matches.every((m) => m.direct && m.recipe.crops.includes("spinach")),
  );
  const tray = cropCatalogue.find(
    (p) => p.slug === "radish-microgreens-live-tray",
  )!;
  const trayMatches = recipesForProduct(tray, recipeCatalogue);
  assert.ok(trayMatches[0].direct);
  assert.ok(trayMatches[0].recipe.crops.includes("radish-microgreens"));
  const flowers = cropCatalogue.find((p) => p.slug === "pansy-flowers")!;
  assert.ok(
    recipesForProduct(flowers, recipeCatalogue).every((m) => !m.direct),
  );
});

test("product pages link every recipe and spread inspiration instead of repeating a few", () => {
  const categories = Object.fromEntries(cropCatalogue.map((p) => [p.slug, p.category]));
  const linked = new Set<string>();
  const inspiration = new Map<string, number>();
  for (const product of cropCatalogue)
    for (const { recipe, direct } of recipesForProduct(product, recipeCatalogue, categories)) {
      linked.add(recipe.slug);
      if (!direct) inspiration.set(recipe.slug, (inspiration.get(recipe.slug) ?? 0) + 1);
    }
  assert.equal(linked.size, recipeCatalogue.length);
  // Alphabetical filling once put one salad on 52 product pages.
  assert.ok(Math.max(...inspiration.values()) <= 25);
  const tomatoes = recipesForProduct(
    cropCatalogue.find((p) => p.slug === "cherry-tomatoes")!,
    recipeCatalogue,
    categories,
  );
  assert.ok(tomatoes.length > 5 && tomatoes.every((m) => m.direct));
});
