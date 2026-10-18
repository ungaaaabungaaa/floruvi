import { originalRecipes } from "./originalRecipes";
import newRecipes from "./newRecipes.json";
import nonVegetarianRecipes from "./nonVegetarianRecipes.json";
import pantryRecipes from "./pantryRecipes.json";

// Seed input only. Public pages read the live Convex recipes table.
export const recipeCatalogue = [
  ...originalRecipes,
  ...newRecipes.map((recipe) => ({
    ...recipe,
    imageKey: `recipe:${recipe.slug}`,
  })),
  ...nonVegetarianRecipes.map((recipe) => ({
    ...recipe,
    imageKey: `recipe:${recipe.slug}`,
  })),
  ...pantryRecipes.map((recipe) => ({
    ...recipe,
    imageKey: `recipe:${recipe.slug}`,
  })),
].map((recipe, rank) => ({
  ...recipe,
  imageCaption: "Illustrative serving image",
  rank,
  published: true,
}));
