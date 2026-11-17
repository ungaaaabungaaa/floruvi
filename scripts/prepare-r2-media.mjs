import { createHash } from "node:crypto";
import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
// Next already depends on sharp. Reuse that pinned installation for metadata;
// no paid image processing, remote service, or extra package is required.
const sharp = createRequire(require.resolve("next/package.json"))("sharp");
const types = { ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".avif": "image/avif", ".gif": "image/gif", ".svg": "image/svg+xml" };
const prefix = "flourvi/";
const manifestFile = path.join(root, "docs/media/r2-manifest.json");

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory()
    ? files(path.join(dir, entry.name))
    : [path.join(dir, entry.name)]))).flat().sort();
}

const entries = [];
for (const file of await files(path.join(root, "src/assets"))) {
  const extension = path.extname(file).toLowerCase();
  if (!types[extension]) continue;
  const bytes = await readFile(file);
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const metadata = await sharp(bytes).metadata();
  if (!metadata.width || !metadata.height) throw new Error(`Missing dimensions: ${file}`);
  const source = path.relative(root, file).split(path.sep).join("/");
  const key = `${prefix}${source.slice(0, -extension.length)}.${sha256.slice(0, 16)}${extension}`;
  entries.push({ source, key, sha256, bytes: bytes.length, contentType: types[extension], width: metadata.width, height: metadata.height });
}
await mkdir(path.dirname(manifestFile), { recursive: true });
await writeFile(manifestFile, `${JSON.stringify({ version: 1, prefix, entries }, null, 2)}\n`);
console.log(`Recorded ${entries.length} public source images in docs/media/r2-manifest.json.`);

if (process.argv.includes("--rewrite")) {
  const bySource = new Map(entries.map((entry) => [entry.source, entry]));
  const call = (entry) => `publicImage(${JSON.stringify(entry.key)}, ${entry.width}, ${entry.height})`;
  let rewritten = 0;
  for (const dir of ["app", "components", "lib"]) {
    for (const file of await files(path.join(root, dir))) {
      if (!/\.tsx?$/.test(file) || file.endsWith("/public-images.ts")) continue;
      const original = await readFile(file, "utf8");
      let changed = false;
      let source = original.replace(/import\s+(\w+)\s+from\s+["']@\/(src\/assets\/[^"']+)["'];?/g, (_, alias, asset) => {
        const entry = bySource.get(asset);
        if (!entry) throw new Error(`Missing manifest entry: ${asset}`);
        changed = true;
        return `const ${alias} = ${call(entry)};`;
      });
      // Re-running the generator updates hashes/dimensions after a source edit.
      source = source.replace(/publicImage\("flourvi\/(src\/assets\/[^"\n]+)\.[a-f0-9]{16}(\.[a-z]+)",\s*\d+,\s*\d+\)/g, (_, stem, extension) => {
        const entry = bySource.get(`${stem}${extension}`);
        if (!entry) throw new Error(`Missing source for public image: ${stem}${extension}`);
        changed = true;
        return call(entry);
      });
      if (!changed) continue;
      if (!source.includes('from "@/lib/public-images"')) {
        const directive = source.match(/^("use client";|'use client';)\s*/);
        const offset = directive?.[0].length ?? 0;
        source = `${source.slice(0, offset)}import { publicImage } from "@/lib/public-images";\n${source.slice(offset)}`;
      }
      if (source !== original) { await writeFile(file, source); rewritten++; }
    }
  }
  console.log(`Updated image references in ${rewritten} source modules.`);
}
