import test from "node:test";
import assert from "node:assert/strict";
import { convexTest, type TestConvex } from "convex-test";
import schema from "../convex/schema";
import { internal } from "../convex/_generated/api";
import { dehydratedProducts } from "../convex/dehydratedData";

const modules = {
  "../convex/_generated/server.ts": () => import("../convex/_generated/server"),
  "../convex/dehydrated.ts": () => import("../convex/dehydrated"),
};

test("owner pack prices stay separate, including onion powder and flakes", () => {
  const expected = [
    ["green-banana-flour", "500 g", 78645],
    ["onion-powder", "250 g", 32900],
    ["onion-flakes", "250 g", 32900],
    ["garlic-powder", "200 g", 34900],
    ["ginger-powder", "250 g", 45045],
    ["turmeric-powder", "500 g", 55545],
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
    assert.doesNotMatch(p.description, /India price|pack\./);
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

test("jar replacement rejects incomplete batches and stale audits without changing products", async () => {
  const t = convexTest(schema, modules);
  await t.mutation(internal.dehydrated.seed, {});
  await assert.rejects(
    t.mutation(internal.dehydrated.replaceImages, { images: [] }),
    /exactly 11/,
  );
  const imageId = await uploadImage(t, "jar");
  const images = dehydratedProducts.map(({ slug }) => ({
    slug,
    imageId,
    expectedUrl: null,
  }));
  const stale = images.map((image, i) =>
    i === 10 ? { ...image, expectedUrl: "https://old.invalid/image" } : image,
  );
  await assert.rejects(
    t.mutation(internal.dehydrated.replaceImages, { images: stale }),
    /changed since audit/,
  );
  const before = await t.run((ctx) => ctx.db.query("products").collect());
  assert.ok(before.every((p) => !p.imageId));
  assert.deepEqual(
    await t.mutation(internal.dehydrated.replaceImages, { images }),
    { updated: 11, deleted: 0 },
  );
  const after = await t.run((ctx) => ctx.db.query("products").collect());
  for (const p of after) {
    const { imageId: actual, ...rest } = p;
    assert.equal(actual, imageId);
    assert.deepEqual(
      rest,
      before.find((old) => old.slug === p.slug),
    );
  }
});

test("jar replacement removes unreferenced old files but preserves shared files", async () => {
  const t = convexTest(schema, modules);
  await t.mutation(internal.dehydrated.seed, {});
  const oldId = await uploadImage(t, "old");
  const sharedId = await uploadImage(t, "shared");
  const newId = await uploadImage(t, "new");
  await t.run(async (ctx) => {
    const products = await ctx.db.query("products").collect();
    for (const [i, p] of products.entries())
      await ctx.db.patch(p._id, { imageId: i === 0 ? sharedId : oldId });
    await ctx.db.insert("products", {
      ...dehydratedProducts[0],
      slug: "unrelated",
      imageId: sharedId,
    });
  });
  const audit = await t.query(internal.dehydrated.audit, {});
  const images = audit.map((p) => {
    assert.ok(!("missing" in p));
    return { slug: p.slug, expectedUrl: p.imageUrl, imageId: newId };
  });
  assert.deepEqual(
    await t.mutation(internal.dehydrated.replaceImages, { images }),
    { updated: 11, deleted: 1 },
  );
  assert.equal(await t.run((ctx) => ctx.storage.get(oldId)), null);
  assert.ok(
    await t.run(async (ctx) => Boolean(await ctx.storage.get(sharedId))),
  );
});

async function uploadImage(t: TestConvex<typeof schema>, content: string) {
  return t.run(async (ctx) => {
    const id = await ctx.storage.store(
      new Blob([content], { type: "image/webp" }),
    );
    // convex-test storeBlob omits Content-Type; HTTP uploads include it.
    // @ts-expect-error The test harness permits system metadata setup; production does not.
    await ctx.db.patch(id, { contentType: "image/webp" });
    return id;
  });
}

test("pricing update compares prior state, is atomic and does not compound taxes", async () => {
  const t = convexTest(schema, modules);
  await t.run(async (ctx) => {
    for (const p of dehydratedProducts)
      await ctx.db.insert("products", {
        ...p,
        pricingRevision: "old",
        price: { ...p.price, amountMinor: 10000 },
        inStock: false,
      });
  });
  const expected = dehydratedProducts.map((p) => ({
    slug: p.slug,
    amountMinor: 10000,
    packLabel: p.price.packLabel,
    description: p.description,
  }));
  await assert.rejects(
    t.mutation(internal.dehydrated.updatePricing, {
      expected: expected.map((p, i) =>
        i === 10 ? { ...p, amountMinor: 1 } : p,
      ),
    }),
    /changed since audit/,
  );
  assert.ok(
    (await t.query(internal.dehydrated.audit, {})).every(
      (p) => "price" in p && p.price?.amountMinor === 10000,
    ),
  );
  assert.equal(
    (await t.mutation(internal.dehydrated.updatePricing, { expected })).updated,
    11,
  );
  assert.equal(
    (await t.mutation(internal.dehydrated.updatePricing, { expected })).updated,
    0,
  );
  const stored = await t.run((ctx) => ctx.db.query("products").collect());
  assert.ok(stored.every((p) => p.inStock === false));
  assert.equal(
    stored.find((p) => p.slug === "moringa-leaf-powder")!.price!.amountMinor,
    59900,
  );
});
