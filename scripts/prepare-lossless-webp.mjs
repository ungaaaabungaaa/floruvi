import fs from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve("next/package.json"))("sharp");
// These already-optimized images are used by existing pages. Do not replace
// them with larger encodes of their retained PNG originals.
const existingWebp = new Set([
  "src/assets/recipe-pasta.webp",
  "src/assets/recipe-roasted-bowl.webp",
  "src/assets/salad-bowl.webp",
]);
// Keep original files. Only process tracked sources, not local generation backups.
const sources = execFileSync("git", ["ls-files", "-z", "src/assets"], { encoding: "utf8" })
  .split("\0").filter((file) => /\.(png|jpe?g)$/i.test(file));
const report = [];
for (const source of sources) {
  const target = source.replace(/\.[^.]+$/, ".webp");
  if (existingWebp.has(target)) continue;
  const original = await fs.readFile(source);
  const converted = await sharp(original).webp({ lossless: true, effort: 6 }).toBuffer();
  const before = await sharp(original).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const after = await sharp(converted).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  // Encoders can discard RGB values behind fully transparent pixels. These
  // values cannot affect the displayed image; alpha and visible RGB must match.
  for (const pixels of [before.data, after.data]) {
    for (let offset = 0; offset < pixels.length; offset += 4) {
      if (pixels[offset + 3] === 0) pixels.fill(0, offset, offset + 3);
    }
  }
  if (before.info.width !== after.info.width || before.info.height !== after.info.height || !before.data.equals(after.data)) {
    throw new Error(`Pixel verification failed: ${source}`);
  }
  await fs.writeFile(target, converted);
  report.push({ source, target, originalBytes: original.length, webpBytes: converted.length, visiblePixelsEqual: true });
}
await fs.writeFile("src/assets/lossless-webp-report.json", JSON.stringify(report, null, 2) + "\n");
const originalBytes = report.reduce((sum, item) => sum + item.originalBytes, 0);
const webpBytes = report.reduce((sum, item) => sum + item.webpBytes, 0);
console.log(JSON.stringify({ count: report.length, originalBytes, webpBytes, savedPercent: (1 - webpBytes / originalBytes) * 100 }));
