import test from "node:test";
import assert from "node:assert/strict";
import { recipeCatalogue } from "../convex/recipeData";
import { cropCatalogue } from "../convex/catalogueData";
import nonVegetarianRecipes from "../convex/nonVegetarianRecipes.json";
import { existsSync } from "node:fs";

test("177 recipes have complete cooking instructions and preserve original routes", () => {
  assert.equal(recipeCatalogue.length, 177);
  assert.equal(new Set(recipeCatalogue.map((r) => r.slug)).size, 177);
  assert.equal(new Set(recipeCatalogue.map((r) => r.name)).size, 177);
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

test("89 non-vegetarian recipes have dish images and protein cooking checks", () => {
  assert.equal(nonVegetarianRecipes.length, 89);
  assert.ok(
    nonVegetarianRecipes.length >
      recipeCatalogue.length - nonVegetarianRecipes.length,
  );
  for (const recipe of nonVegetarianRecipes) {
    assert.ok(
      existsSync(`src/assets/recipes/non-vegetarian/${recipe.slug}.webp`),
      recipe.slug,
    );
    const steps = recipe.steps.join(" ");
    if (recipe.category === "Chicken") assert.match(steps, /74°C/, recipe.slug);
    if (recipe.category === "Fish") assert.match(steps, /63°C/, recipe.slug);
    if (recipe.category === "Mutton")
      assert.match(steps, /71°C|63°C.*3 minutes/, recipe.slug);
    if (recipe.category === "Prawns")
      assert.match(steps, /firm, pearly and opaque/, recipe.slug);
    if (recipe.category === "Eggs")
      assert.match(steps, /71°C|yolks and whites are firm/, recipe.slug);
  }
});
