import test from "node:test";
import assert from "node:assert/strict";
import { localProductPreview } from "../lib/local-product-preview";
import { previewShop, previewRecipes } from "../lib/local-product-preview-data";
import { recipesForProduct } from "../lib/product-recipes";

test("review data requires an explicit flag and can never enable in production", () => {
  const environment = process.env as Record<string, string | undefined>;
  const before = {
    mode: environment.NODE_ENV,
    flag: process.env.FLORUVI_PRODUCT_PREVIEW,
  };
  try {
    process.env.FLORUVI_PRODUCT_PREVIEW = "1";
    for (const mode of ["production", "test"]) {
      environment.NODE_ENV = mode;
      assert.equal(localProductPreview(), false);
    }
    environment.NODE_ENV = "development";
    assert.equal(localProductPreview(), true);
    delete process.env.FLORUVI_PRODUCT_PREVIEW;
    assert.equal(localProductPreview(), false);
  } finally {
    if (before.mode === undefined) delete environment.NODE_ENV;
    else environment.NODE_ENV = before.mode;
    if (before.flag === undefined) delete process.env.FLORUVI_PRODUCT_PREVIEW;
    else process.env.FLORUVI_PRODUCT_PREVIEW = before.flag;
  }
});
test("the review preserves pantry records and adds four distinct listings with matching recipes", () => {
  const shop = previewShop(),
    recipes = previewRecipes();
  assert.equal(shop.products.length, 15);
  assert.equal(new Set(shop.products.map((p) => p.slug)).size, 15);
  assert.equal(recipes.length, 220);
  assert.equal(new Set(recipes.map((r) => r.slug)).size, 220);
  for (const slug of [
    "raw-honey",
    "wildflower-honey",
    "single-flower-honey",
    "farm-eggs",
  ]) {
    const product = shop.products.find((p) => p.slug === slug)!;
    assert.ok(product);
    assert.ok(
      recipesForProduct(product, recipes).some((match) => match.direct),
    );
  }
  for (const recipe of recipes.filter((recipe) =>
    recipe.crops.includes("farm-eggs"),
  ))
    assert.ok(recipe.ingredients.some((i) => /\beggs?\b/i.test(i)));
  assert.equal(
    recipes.filter((recipe) => recipe.crops.includes("farm-eggs")).length,
    13,
  );
});
