import fs from "node:fs/promises";
import { createRequire } from "node:module";
import recipes from "../convex/pantryRecipes.json" with { type: "json" };
const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve("next/package.json"))("sharp");
const directory = "src/assets/recipes/pantry";
let bytes = 0;
for (const recipe of recipes) {
  const source = `${directory}/${recipe.slug}.png`;
  const metadata = await sharp(source).metadata();
  if (!metadata.width || metadata.width !== metadata.height)
    throw new Error(`Expected square image: ${recipe.slug}`);
  const webp = await sharp(source).webp({ quality: 88, effort: 5 }).toBuffer();
  await fs.writeFile(`${directory}/${recipe.slug}.webp`, webp);
  bytes += webp.length;
}
const mapPath = "lib/recipe-images.ts";
let source = await fs.readFile(mapPath, "utf8");
source = source.replace(/^import pantryRecipe\d+ from .*;\n/gm, "");
source = source.replace(/^  "recipe:[^"]+": pantryRecipe\d+,\n/gm, "");
const imports = recipes
  .map(
    (r, i) => `import pantryRecipe${i} from "@/${directory}/${r.slug}.webp";`,
  )
  .join("\n");
const entries = recipes
  .map((r, i) => `  "recipe:${r.slug}": pantryRecipe${i},`)
  .join("\n");
source = source.replace(
  "export const recipeImages",
  `${imports}\nexport const recipeImages`,
);
source = source.replace("  salad,", `${entries}\n  salad,`);
await fs.writeFile(mapPath, source);
console.log(JSON.stringify({ recipes: recipes.length, webpBytes: bytes }));
