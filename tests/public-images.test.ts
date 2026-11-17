import test from "node:test";
import assert from "node:assert/strict";
import { convexTest } from "convex-test";
import { makeFunctionReference } from "convex/server";
import schema from "../convex/schema";
import { dehydratedProducts } from "../convex/dehydratedData";
import { publicImageUrl, publicProductImage } from "../convex/publicImages";

const modules = {
  "../convex/_generated/server.ts": () => import("../convex/_generated/server"),
  "../convex/publicImages.ts": () => import("../convex/publicImages"),
};
const migrate = makeFunctionReference<"mutation">("publicImages:migrate");
const rollback = makeFunctionReference<"mutation">("publicImages:rollback");

test("public image migration checks source, supports dry run and retains originals", async () => {
  const prior = process.env.R2_PUBLIC_BASE_URL;
  process.env.R2_PUBLIC_BASE_URL = "https://assets.imai.studio";
  try {
    const t = convexTest(schema, modules);
    const { id, imageId, url } = await t.run(async (ctx) => {
      const imageId = await ctx.storage.store(
        new Blob(["jar"], { type: "image/webp" }),
      );
      // Convex test does not populate upload MIME metadata.
      // @ts-expect-error System metadata setup is supported by the test harness only.
      await ctx.db.patch(imageId, { contentType: "image/webp" });
      const id = await ctx.db.insert("products", {
        ...dehydratedProducts[0],
        imageId,
      });
      return { id, imageId, url: await ctx.storage.getUrl(imageId) };
    });
    const image = {
      slug: dehydratedProducts[0].slug,
      expectedUrl: url!,
      key: "flourvi/convex/jar.123.webp",
      sha256: "a".repeat(64),
      size: 3,
      contentType: "image/webp",
    };
    await assert.rejects(
      t.mutation(migrate, {
        dryRun: false,
        images: [{ ...image, expectedUrl: "stale" }],
      }),
      /changed since audit/,
    );
    assert.deepEqual(
      await t.mutation(migrate, { dryRun: true, images: [image] }),
      { checked: 1, updated: 1 },
    );
    assert.equal(
      (await t.run((ctx) => ctx.db.get(id)))!.publicImage,
      undefined,
    );
    await t.mutation(migrate, { dryRun: false, images: [image] });
    assert.deepEqual(
      await t.mutation(migrate, { dryRun: false, images: [image] }),
      { checked: 1, updated: 0 },
    );
    assert.equal(
      await t.run(async (ctx) =>
        publicProductImage(ctx, (await ctx.db.get(id))!),
      ),
      `https://assets.imai.studio/${image.key}`,
    );
    assert.ok(
      await t.run(async (ctx) => Boolean(await ctx.storage.get(imageId))),
    );
    await t.mutation(rollback, {
      images: [{ slug: image.slug, expectedKey: image.key }],
    });
    assert.equal(
      await t.run(async (ctx) =>
        publicProductImage(ctx, (await ctx.db.get(id))!),
      ),
      url,
    );
    assert.equal(publicImageUrl("flourvi/../private"), null);
  } finally {
    if (prior === undefined) delete process.env.R2_PUBLIC_BASE_URL;
    else process.env.R2_PUBLIC_BASE_URL = prior;
  }
});

test("public image base rejects credentials, signed URLs and invalid keys", () => {
  const prior = process.env.R2_PUBLIC_BASE_URL;
  try {
    for (const base of ["http://assets.imai.studio", "https://user:secret@assets.imai.studio", "https://assets.imai.studio?token=x", "https://assets.imai.studio#fragment", "invalid"]) {
      process.env.R2_PUBLIC_BASE_URL = base;
      assert.equal(publicImageUrl("flourvi/image.webp"), null);
    }
    process.env.R2_PUBLIC_BASE_URL = "https://assets.imai.studio/public/";
    assert.equal(publicImageUrl("flourvi/image.webp"), "https://assets.imai.studio/public/flourvi/image.webp");
    for (const key of ["flourvi/../private", "flourvi/./image", "flourvi//image", "flourvi/image?token=x", "flourvi/image#hash", "flourvi/image\\file", "private/image"])
      assert.equal(publicImageUrl(key), null);
  } finally {
    if (prior === undefined) delete process.env.R2_PUBLIC_BASE_URL;
    else process.env.R2_PUBLIC_BASE_URL = prior;
  }
});

test("changed product image uses Convex fallback rather than stale R2 metadata", async () => {
  const prior = process.env.R2_PUBLIC_BASE_URL;
  process.env.R2_PUBLIC_BASE_URL = "https://assets.imai.studio";
  try {
    const t = convexTest(schema, modules);
    const result = await t.run(async ctx => {
      const original = await ctx.storage.store(new Blob(["old"]));
      const replacement = await ctx.storage.store(new Blob(["new"]));
      const id = await ctx.db.insert("products", {
        ...dehydratedProducts[0], imageId: replacement,
        publicImage: { key: "flourvi/old.webp", sha256: "a".repeat(64), size: 3, contentType: "image/webp", sourceImageId: original },
      });
      return { actual: await publicProductImage(ctx, (await ctx.db.get(id))!), expected: await ctx.storage.getUrl(replacement) };
    });
    assert.equal(result.actual, result.expected);
  } finally {
    if (prior === undefined) delete process.env.R2_PUBLIC_BASE_URL;
    else process.env.R2_PUBLIC_BASE_URL = prior;
  }
});
