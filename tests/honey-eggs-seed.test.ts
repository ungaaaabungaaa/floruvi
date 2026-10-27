import test from "node:test";
import assert from "node:assert/strict";
import { convexTest } from "convex-test";
import schema from "../convex/schema";
import { internal } from "../convex/_generated/api";
import { honeyEggProducts, honeyRecipes } from "../lib/honey-eggs-data";
import { dehydratedProducts } from "../convex/dehydratedData";
import { recipeCatalogue } from "../convex/recipeData";
const modules = {
  "../convex/_generated/server.ts": () => import("../convex/_generated/server"),
  "../convex/honeyEggs.ts": () => import("../convex/honeyEggs"),
};

test("honey and egg seed adds only missing records and preserves prices, stock and unrelated data", async () => {
  const t = convexTest(schema, modules);
  const id = await t.run((ctx) =>
    ctx.db.insert("products", dehydratedProducts[0]),
  );
  const before = await t.run((ctx) => ctx.db.get(id));
  const recipe = recipeCatalogue.find(
    (r) => r.slug === "spinach-tomato-egg-scramble",
  )!;
  const rid = await t.run((ctx) =>
    ctx.db.insert("recipes", { ...recipe, name: "Owner recipe name" }),
  );
  const first = await t.mutation(internal.honeyEggs.seed, {});
  assert.equal(first.productsAdded, 4);
  assert.equal(first.categoriesAdded, 2);
  assert.equal(first.recipesAdded, 3);
  assert.equal(first.eggRecipeLinksAdded, 1);
  assert.deepEqual(await t.run((ctx) => ctx.db.get(id)), before);
  for (const product of honeyEggProducts) {
    const current = await t.run((ctx) =>
      ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", product.slug))
        .unique(),
    );
    assert.deepEqual(current?.price, product.price);
  }
  const eggRecipe = await t.run((ctx) => ctx.db.get(rid));
  assert.equal(eggRecipe?.name, "Owner recipe name");
  assert.deepEqual(eggRecipe?.crops, [...recipe.crops, "farm-eggs"]);
  await t.run(async (ctx) => {
    const p = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", "raw-honey"))
      .unique();
    await ctx.db.patch(p!._id, {
      inStock: false,
      description: "Owner copy",
      price: { amountMinor: 50000, currency: "INR", packLabel: "100 ml" },
    });
  });
  const repeat = await t.mutation(internal.honeyEggs.seed, {});
  assert.equal(repeat.productsAdded, 0);
  assert.equal(repeat.productsPreserved, 4);
  assert.equal(repeat.recipesAdded, 0);
  assert.equal(repeat.eggRecipeLinksAdded, 0);
  const owner = await t.run((ctx) =>
    ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", "raw-honey"))
      .unique(),
  );
  assert.equal(owner?.description, "Owner copy");
  assert.equal(owner?.price?.amountMinor, 50000);
  assert.equal(owner?.inStock, false);
  assert.equal(honeyRecipes.length, 3);
});
