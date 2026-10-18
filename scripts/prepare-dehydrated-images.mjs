import fs from "node:fs/promises";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve("next/package.json"))("sharp");
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
const views = ["main", "pouch-detail", "ingredient", "texture", "preparation"];
const imports = ['import type { StaticImageData } from "next/image";'];
const groups = {
  dehydratedMainImages: [],
  dehydratedDetailImages: [],
  dehydratedAdditionalImages: [],
};
let bytes = 0;
for (const [i, slug] of slugs.entries()) {
  const variables = [];
  for (const [j, view] of views.entries()) {
    const stem = `src/assets/products/dehydrated/${slug}/${view}`;
    const input = await fs.readFile(`${stem}.png`);
    const metadata = await sharp(input).metadata();
    if (!metadata.width || metadata.width !== metadata.height)
      throw new Error(`Expected square image: ${stem}`);
    const webp = await sharp(input).webp({ quality: 88, effort: 5 }).toBuffer();
    await fs.writeFile(`${stem}.webp`, webp);
    bytes += webp.length;
    const variable = `p${i}v${j}`;
    imports.push(`import ${variable} from "@/${stem}.webp";`);
    variables.push(variable);
  }
  groups.dehydratedMainImages.push(`  "${slug}": ${variables[0]},`);
  groups.dehydratedDetailImages.push(`  "${slug}": ${variables[1]},`);
  groups.dehydratedAdditionalImages.push(
    `  "${slug}": [${variables.slice(2).join(", ")}],`,
  );
}
await fs.writeFile(
  "lib/dehydrated-images.ts",
  imports.join("\n") +
    "\n\n" +
    Object.entries(groups)
      .map(
        ([key, entries]) =>
          `export const ${key}: Record<string, ${key.endsWith("AdditionalImages") ? "StaticImageData[]" : "StaticImageData"}> = {\n${entries.join("\n")}\n};`,
      )
      .join("\n\n") +
    "\n",
);
console.log(
  JSON.stringify({
    products: slugs.length,
    images: slugs.length * views.length,
    webpBytes: bytes,
  }),
);
