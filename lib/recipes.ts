import { cache } from "react";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { recipeImages } from "./recipe-images";

function imageFor(key: string) {
  const image = recipeImages[key];
  if (!image) throw new Error(`Recipe image is missing: ${key}`);
  return image;
}
export const getRecipes = cache(async () => {
  const recipes = await fetchQuery(api.recipes.list, {});
  return recipes.map((r) => ({ ...r, image: imageFor(r.imageKey) }));
});
export const getRecipe = cache(async (slug: string) => {
  const recipe = await fetchQuery(api.recipes.get, { slug });
  return recipe ? { ...recipe, image: imageFor(recipe.imageKey) } : null;
});
export type Recipe = Awaited<ReturnType<typeof getRecipes>>[number];
