import fs from "node:fs/promises";
import recipes from "../convex/nonVegetarianRecipes.json" with { type: "json" };

// Rebuild the import map from project assets. Never reuse an image for another dish.
const directory = "src/assets/recipes/non-vegetarian";
for (const recipe of recipes)
  await fs.access(`${directory}/${recipe.slug}.webp`);
const mapPath = "lib/recipe-images.ts";
let source = await fs.readFile(mapPath, "utf8");
source = source.replace(/^import nonVegetarian\d+ from .*;\n/gm, "");
source = source.replace(/^  "recipe:[^"]+": nonVegetarian\d+,\n/gm, "");
const imports = recipes
  .map(
    (recipe, index) =>
      `import nonVegetarian${index} from "@/${directory}/${recipe.slug}.webp";`,
  )
  .join("\n");
const entries = recipes
  .map((recipe, index) => `  "recipe:${recipe.slug}": nonVegetarian${index},`)
  .join("\n");
source = source.replace(
  "export const recipeImages",
  `${imports}\nexport const recipeImages`,
);
source = source.replace("  salad,", `${entries}\n  salad,`);
await fs.writeFile(mapPath, source);
console.log(`Mapped ${recipes.length} non-vegetarian recipe images.`);
