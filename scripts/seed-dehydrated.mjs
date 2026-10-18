// Run after deploying convex/dehydrated.ts. Uses the owner's authenticated CLI.
import fs from "node:fs/promises";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { dehydratedProducts } from "../convex/dehydratedData.ts";
const production = process.argv.includes("--prod");
const flags = production ? ["--prod"] : [];
const run = (name, args = {}) =>
  JSON.parse(
    execFileSync(
      process.execPath,
      [
        "node_modules/convex/bin/main.js",
        "run",
        name,
        JSON.stringify(args),
        ...flags,
      ],
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "inherit"],
        maxBuffer: 8 * 1024 * 1024,
      },
    ),
  );
const before = run("catalogue:browse");
const existing = new Map(before.products.map((p) => [p.slug, p]));
const imageIds = {};
for (const { slug } of dehydratedProducts) {
  if (existing.get(slug)?.imageUrl) continue;
  const image = await fs.readFile(
    `src/assets/products/dehydrated/${slug}/main.webp`,
  );
  const url = run("dehydrated:imageUploadUrl");
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "image/webp" },
    body: image,
  });
  if (!response.ok)
    throw new Error(`Upload failed: ${slug} (${response.status})`);
  const { storageId } = await response.json();
  assert.ok(storageId);
  imageIds[slug] = storageId;
  console.log(`Uploaded ${slug}`);
}
const seeded = run("dehydrated:seed", { imageIds });
const repeat = run("dehydrated:seed");
assert.equal(repeat.added, 0);
const after = run("catalogue:browse");
for (const p of before.products)
  assert.deepEqual(
    after.products.find((x) => x.slug === p.slug),
    p,
    `Existing product changed: ${p.slug}`,
  );
for (const category of before.categories)
  assert.deepEqual(
    after.categories.find((x) => x.slug === category.slug),
    category,
  );
assert.deepEqual(after.commerce, before.commerce);
const audit = run("dehydrated:audit");
for (const wanted of dehydratedProducts) {
  const actual = audit.find((p) => p.slug === wanted.slug);
  assert.ok(actual && !actual.missing, `Missing ${wanted.slug}`);
  assert.deepEqual(actual.price, wanted.price);
  assert.equal(actual.description, wanted.description);
  assert.equal(actual.category, wanted.category);
  assert.equal(actual.published, true);
  assert.ok(actual.imageUrl);
  const imageResponse = await fetch(actual.imageUrl);
  assert.equal(imageResponse.status, 200);
  assert.match(imageResponse.headers.get("content-type"), /image\/webp/);
}
const report = {
  environment: production ? "production" : "development",
  seeded,
  repeat,
  existingProductsPreserved: before.products.length,
  totalProducts: after.products.length,
  products: audit,
};
await fs.mkdir("backups/dehydrated-2026-10-18", { recursive: true });
await fs.writeFile(
  `backups/dehydrated-2026-10-18/${report.environment}.json`,
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    environment: report.environment,
    seeded,
    repeat,
    existingProductsPreserved: before.products.length,
    totalProducts: after.products.length,
    verifiedImages: audit.length,
  }),
);
