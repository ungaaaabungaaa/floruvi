// Rebuild the approved single-jar catalogue assets from local PNG originals.
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve("next/package.json"))("sharp");
const source =
  process.argv[2] ?? "output/packaging/glass-jars-approval-2026-10-20/images";
const slugs = [
  "green-banana-flour",
  "onion-powder",
  "onion-flakes",
  "garlic-powder",
  "ginger-powder",
  "turmeric-powder",
  "moringa-leaf-powder",
  "tomato-powder",
  "beetroot-powder",
  "carrot-powder",
  "spinach-powder",
];
const imports = ['import type { StaticImageData } from "next/image";'];
const entries = [];
let bytes = 0;
for (const [i, slug] of slugs.entries()) {
  const input = await fs.readFile(
    path.join(source, `${String(i + 1).padStart(2, "0")}-${slug}.png`),
  );
  const metadata = await sharp(input).metadata();
  if (!metadata.width || metadata.width !== metadata.height)
    throw new Error(`Expected square image: ${slug}`);
  const destination = `src/assets/products/dehydrated/${slug}/main.webp`;
  const webp = await sharp(input).webp({ quality: 88, effort: 5 }).toBuffer();
  await fs.writeFile(destination, webp);
  bytes += webp.length;
  imports.push(`import jar${i} from "@/${destination}";`);
  entries.push(`  "${slug}": jar${i},`);
}
await fs.writeFile(
  "lib/dehydrated-images.ts",
  `${imports.join("\n")}\n\nexport const dehydratedMainImages: Record<string, StaticImageData> = {\n${entries.join("\n")}\n};\n`,
);
console.log(
  JSON.stringify({
    products: slugs.length,
    images: slugs.length,
    webpBytes: bytes,
  }),
);
