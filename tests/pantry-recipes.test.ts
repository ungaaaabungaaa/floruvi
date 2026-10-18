import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { convexTest } from "convex-test";
import schema from "../convex/schema";
import { internal } from "../convex/_generated/api";
import { recipeCatalogue } from "../convex/recipeData";
import { dehydratedProducts } from "../convex/dehydratedData";
import recipes from "../convex/pantryRecipes.json";
import { recipesForProduct } from "../lib/product-recipes";
const modules = {
  "../convex/_generated/server.ts": () => import("../convex/_generated/server"),
  "../convex/seed.ts": () => import("../convex/seed"),
};
test("40 distinct pantry recipes use the named product and link all 11 products", () => {
  assert.equal(recipes.length, 40);
  assert.equal(new Set(recipes.map((r) => r.slug)).size, 40);
  assert.equal(new Set(recipes.map((r) => r.name)).size, 40);
  assert.equal(new Set(recipes.flatMap((r) => r.crops)).size, 11);
  for (const r of recipes) {
    assert.equal(r.minutes, r.prepMinutes + r.cookMinutes);
    assert.ok(
      r.servings > 0 && r.ingredients.length >= 5 && r.steps.length >= 4,
      r.slug,
    );
    assert.ok(r.description && r.tip, r.slug);
    assert.doesNotMatch(
      JSON.stringify(r),
      /detox|cures|prevents disease|weight.loss|gluten.free/i,
    );
    const product = dehydratedProducts.find((p) => r.crops.includes(p.slug));
    assert.ok(product, r.slug);
    assert.ok(
      r.ingredients
        .join(" ")
        .toLowerCase()
        .includes(product.name.toLowerCase()),
      r.slug,
    );
    assert.ok(existsSync(`src/assets/recipes/pantry/${r.slug}.webp`), r.slug);
  }
  for (const product of dehydratedProducts) {
    const direct = recipesForProduct(product, recipeCatalogue).filter(
      (m) => m.direct,
    );
    assert.ok(direct.length >= 3, product.slug);
    assert.ok(
      direct.every((m) => recipes.some((r) => r.slug === m.recipe.slug)),
      product.slug,
    );
  }
});
test("recipe seed adds only missing recipes, preserves owner edits, and is repeatable", async () => {
  const t = convexTest(schema, modules);
  const baseline = recipeCatalogue.filter(
    (r) => !recipes.some((p) => p.slug === r.slug),
  );
  assert.equal(baseline.length, 177);
  const ids = await t.run(async (ctx) => {
    const ids = [];
    for (const r of baseline) ids.push(await ctx.db.insert("recipes", r));
    await ctx.db.patch(ids[0], { description: "Owner recipe description" });
    return ids;
  });
  const before = await t.run((ctx) =>
    Promise.all(ids.map((id) => ctx.db.get(id))),
  );
  assert.deepEqual(await t.mutation(internal.seed.recipes, {}), {
    added: 40,
    preserved: 177,
    totalSeedRecipes: 217,
  });
  const after = await t.run((ctx) =>
    Promise.all(ids.map((id) => ctx.db.get(id))),
  );
  assert.deepEqual(after, before);
  assert.deepEqual(await t.mutation(internal.seed.recipes, {}), {
    added: 0,
    preserved: 217,
    totalSeedRecipes: 217,
  });
});
