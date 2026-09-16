import { cache } from "react";
import { fetchQuery } from "convex/nextjs";
import type { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";
import { recipeImages } from "./recipe-images";

export function recipeImage(key: string) {
  const image = recipeImages[key];
  if (!image) throw new Error(`Recipe image is missing: ${key}`);
  return image;
}
export type RecipeSummaryRecord = FunctionReturnType<typeof api.recipes.list>[number];
export type RecipeRecord = NonNullable<FunctionReturnType<typeof api.recipes.get>>;

export const getRawRecipes = cache(() => fetchQuery(api.recipes.list, {}));
export const getRawRecipe = cache((slug: string) => fetchQuery(api.recipes.get, { slug }));
