import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve('next/package.json'))('sharp');
const directory = 'src/assets/recipes';
const manifest = JSON.parse(await fs.readFile(`${directory}/generation.json`, 'utf8'));
const recipes = JSON.parse(await fs.readFile('convex/newRecipes.json', 'utf8'));
const entries = recipes.map(recipe => ({ ...recipe, ...manifest.find(item => item.slug === recipe.slug) }));
if (entries.some(entry => !entry.path)) throw new Error('Missing generated recipe image');
for (const entry of entries) {
  await sharp(entry.path).resize(960, 960, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toFile(`${directory}/${entry.slug}.webp`);
}
const base = `import type { StaticImageData } from "next/image";\nimport salad from "@/src/assets/salad-bowl.png";\nimport smoothie from "@/src/assets/recipe-smoothie.png";\nimport bowl from "@/src/assets/recipe-roasted-bowl.png";\nimport pasta from "@/src/assets/recipe-pasta.png";\n`;
await fs.writeFile('lib/recipe-images.ts', base + entries.map((entry, i) => `import recipe${i} from "@/src/assets/recipes/${entry.slug}.webp";`).join('\n') + '\nexport const recipeImages: Record<string, StaticImageData> = { salad, smoothie, bowl, pasta,\n' + entries.map((entry, i) => `"recipe:${entry.slug}": recipe${i},`).join('\n') + '\n};\n');
const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
for (let batch = 0; batch < entries.length; batch += 12) {
  const layers = [];
  for (const [index, entry] of entries.slice(batch, batch + 12).entries()) {
    const left = index % 4 * 280, top = Math.floor(index / 4) * 270;
    layers.push({ input: await sharp(`${directory}/${entry.slug}.webp`).resize(280, 220, { fit: 'contain', background: '#f8f7f2' }).toBuffer(), left, top });
    const words = entry.name.split(' '); let line = ''; const lines = [];
    for (const word of words) { if ((line + word).length > 34) { lines.push(line); line = ''; } line += word + ' '; } lines.push(line);
    const label = `<svg width="280" height="50"><style>text{font:12px sans-serif;fill:#123b2d}</style>${lines.map((text, i) => `<text x="8" y="${16 + i * 16}">${escape(text)}</text>`).join('')}</svg>`;
    layers.push({ input: Buffer.from(label), left, top: top + 220 });
  }
  await sharp({create:{width:1120,height:810,channels:3,background:'#f8f7f2'}}).composite(layers).png().toFile(`/tmp/floruvi-recipes-${batch / 12 + 1}.png`);
}
console.log(`Prepared ${entries.length} recipe images and 7 review sheets`);
