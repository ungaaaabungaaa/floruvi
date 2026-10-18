import test from "node:test";
import assert from "node:assert/strict";
import { convexTest } from "convex-test";
import schema from "../convex/schema";
import { internal } from "../convex/_generated/api";
import { dehydratedProducts } from "../convex/dehydratedData";

const modules = {
  "../convex/_generated/server.ts": () => import("../convex/_generated/server"),
  "../convex/dehydrated.ts": () => import("../convex/dehydrated"),
};

test("owner pack prices stay separate, including onion powder and flakes", () => {
  const expected = [
    ["green-banana-flour", "500 g", 74900],
    ["onion-powder", "250 g", 32900],
    ["onion-flakes", "250 g", 32900],
    ["garlic-powder", "200 g", 34900],
    ["ginger-powder", "250 g", 42900],
    ["turmeric-powder", "500 g", 52900],
    ["moringa-leaf-powder", "250 g", 59900],
    ["tomato-powder", "200 g", 47900],
    ["beetroot-powder", "250 g", 84900],
    ["carrot-powder", "250 g", 55900],
    ["spinach-powder", "250 g", 62900],
  ];
  assert.deepEqual(
    dehydratedProducts.map((p) => [
      p.slug,
      p.price.packLabel,
      p.price.amountMinor,
    ]),
    expected,
  );
  for (const p of dehydratedProducts) {
    assert.match(
      p.description,
      new RegExp(`India price: ₹${p.price.amountMinor / 100}`),
    );
    assert.doesNotMatch(
      p.description,
      /sample|mockup|preview|organic|gluten.free/i,
    );
    assert.equal(p.price.currency, "INR");
    assert.ok(!("stock" in p));
  }
});

test("seed is repeatable and preserves owner edits and unrelated catalogue records", async () => {
  const t = convexTest(schema, modules);
  const priorId = await t.run((ctx) =>
    ctx.db.insert("products", {
      ...dehydratedProducts[0],
      slug: "existing-product",
      description: "Existing catalogue copy",
    }),
  );
  const prior = await t.run((ctx) => ctx.db.get(priorId));
  assert.equal((await t.mutation(internal.dehydrated.seed, {})).added, 11);
  const id = await t.run(async (ctx) => {
    const p = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", "green-banana-flour"))
      .unique();
    await ctx.db.patch(p!._id, {
      description: "Owner copy",
      inStock: false,
      price: { amountMinor: 79900, currency: "INR", packLabel: "500 g" },
    });
    return p!._id;
  });
  assert.deepEqual(await t.mutation(internal.dehydrated.seed, {}), {
    added: 0,
    preserved: 11,
    imagesAdded: 0,
    total: 11,
  });
  const p = await t.run((ctx) => ctx.db.get(id));
  assert.equal(p!.description, "Owner copy");
  assert.equal(p!.price!.amountMinor, 79900);
  assert.equal(p!.inStock, false);
  assert.deepEqual(await t.run((ctx) => ctx.db.get(priorId)), prior);
  assert.equal((await t.query(internal.dehydrated.audit, {})).length, 11);
});
