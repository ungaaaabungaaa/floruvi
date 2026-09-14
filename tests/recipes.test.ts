import test from "node:test";
import assert from "node:assert/strict";
import { recipeCatalogue } from "../convex/recipeData";
import { cropCatalogue } from "../convex/catalogueData";

test("88 recipes have complete cooking instructions and preserve original routes", () => {
  assert.equal(recipeCatalogue.length, 88);
  assert.equal(new Set(recipeCatalogue.map((r) => r.slug)).size, 88);
  assert.equal(new Set(recipeCatalogue.map((r) => r.name)).size, 88);
  for (const slug of [
    "everyday-green-salad",
    "spinach-apple-smoothie",
    "roasted-vegetable-bowl",
    "fresh-basil-pasta",
  ])
    assert.ok(recipeCatalogue.some((r) => r.slug === slug));
  for (const recipe of recipeCatalogue) {
    assert.match(recipe.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.equal(
      recipe.minutes,
      recipe.prepMinutes + recipe.cookMinutes,
      recipe.slug,
    );
    assert.ok(
      recipe.servings > 0 &&
        recipe.ingredients.length >= 5 &&
        recipe.steps.length >= 4,
      recipe.slug,
    );
    assert.ok(
      recipe.description && recipe.tip && recipe.imageKey && recipe.published,
      recipe.slug,
    );
    assert.ok(recipe.crops.length > 0, recipe.slug);
    for (const crop of recipe.crops)
      assert.ok(
        cropCatalogue.some((p) => p.slug === crop),
        `${recipe.slug}: ${crop}`,
      );
  }
});
