import { originalRecipes } from "./originalRecipes";
import newRecipes from "./newRecipes.json";

// Seed input only. Public pages read the live Convex recipes table.
export const recipeCatalogue = [
  ...originalRecipes,
  ...newRecipes.map((recipe) => ({
    ...recipe,
    imageKey: `recipe:${recipe.slug}`,
  })),
].map((recipe, rank) => ({
  ...recipe,
  imageCaption: "Illustrative serving image",
  rank,
  published: true,
}));
