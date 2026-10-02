import fs from "node:fs/promises";
import { createRequire } from "node:module";

// Reuse the exact site mark. Only the output size and file format change.
const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve("next/package.json"))("sharp");
const source = new URL("../src/assets/floruvi-mark.png", import.meta.url);
const app = new URL("../app/", import.meta.url);
const mark = await fs.readFile(source);
const png = (size) => sharp(mark).resize(size, size).png().toBuffer();

await fs.writeFile(new URL("icon.png", app), await png(96));
await fs.writeFile(new URL("apple-icon.png", app), await png(180));

// ICO stores one PNG for each common browser-tab size.
const sizes = [16, 32, 48, 64];
const images = await Promise.all(sizes.map(png));
const directory = Buffer.alloc(6 + sizes.length * 16);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(sizes.length, 4);
let offset = directory.length;
for (const [index, size] of sizes.entries()) {
  const entry = 6 + index * 16;
  directory[entry] = size;
  directory[entry + 1] = size;
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(images[index].length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += images[index].length;
}
await fs.writeFile(new URL("favicon.ico", app), Buffer.concat([directory, ...images]));

console.log("Prepared Floruvi browser and Apple icons from the existing carrot mark.");
