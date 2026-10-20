// Owner-authenticated CLI. Back up old public images before replacing the 11 jars.
import fs from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { dehydratedProducts } from "../convex/dehydratedData.ts";

const production = process.argv.includes("--prod");
const environment = production ? "production" : "development";
const folder = `backups/glass-jars-2026-10-20/${environment}`;
const hash = (data) => createHash("sha256").update(data).digest("hex");
function run(name, args = {}) {
  return JSON.parse(
    execFileSync(
      process.execPath,
      [
        "node_modules/convex/bin/main.js",
        "run",
        name,
        JSON.stringify(args),
        ...(production ? ["--prod"] : []),
      ],
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "inherit"],
        maxBuffer: 16 * 1024 * 1024,
      },
    ),
  );
}
await fs.mkdir(folder, { recursive: true });
const before = run("catalogue:browse");
const snapshot = `${folder}/before-${Date.now()}.json`;
await fs.writeFile(snapshot, JSON.stringify(before, null, 2));
const images = [];
for (const { slug, price } of dehydratedProducts) {
  const product = before.products.find((p) => p.slug === slug);
  assert.ok(product, `Missing product: ${slug}`);
  assert.deepEqual(product.price, price, `Price changed; review ${slug}`);
  const data = await fs.readFile(
    `src/assets/products/dehydrated/${slug}/main.webp`,
  );
  let old = null;
  if (product.imageUrl) {
    const response = await fetch(product.imageUrl);
    assert.ok(response.ok, `Cannot back up ${slug}`);
    old = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(`${folder}/${slug}-${hash(old).slice(0, 12)}.webp`, old);
  }
  // A complete matching run is handled below without upload or mutation.
  images.push({ slug, data, old, expectedUrl: product.imageUrl });
}
if (images.every((p) => p.old && hash(p.old) === hash(p.data))) {
  console.log(JSON.stringify({ environment, alreadyCurrent: 11 }));
  process.exit(0);
}
const uploaded = [];
for (const { slug, data, expectedUrl } of images) {
  const url = run("dehydrated:imageUploadUrl");
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "image/webp" },
    body: data,
  });
  assert.ok(response.ok, `Upload failed: ${slug}`);
  const { storageId: imageId } = await response.json();
  assert.ok(imageId);
  uploaded.push({ slug, imageId, expectedUrl });
  // Save progress for recovery if the remaining upload or guarded mutation fails.
  await fs.writeFile(
    `${folder}/uploads.json`,
    JSON.stringify(uploaded, null, 2),
  );
}
const changed = run("dehydrated:replaceImages", { images: uploaded });
const after = run("catalogue:browse");
const targetSlugs = new Set(dehydratedProducts.map((p) => p.slug));
assert.equal(after.products.length, before.products.length);
assert.deepEqual(after.categories, before.categories);
assert.deepEqual(after.commerce, before.commerce);
for (const previous of before.products) {
  const current = after.products.find((p) => p.slug === previous.slug);
  assert.ok(current);
  if (targetSlugs.has(previous.slug)) {
    assert.deepEqual({ ...current, imageUrl: previous.imageUrl }, previous);
    const response = await fetch(current.imageUrl);
    assert.ok(response.ok);
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.equal(
      hash(bytes),
      hash(images.find((p) => p.slug === previous.slug).data),
    );
  } else assert.deepEqual(current, previous);
}
await fs.writeFile(`${folder}/after.json`, JSON.stringify(after, null, 2));
console.log(
  JSON.stringify({
    environment,
    ...changed,
    verifiedJarImages: 11,
    products: after.products.length,
    otherContentPreserved: true,
  }),
);
