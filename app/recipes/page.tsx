import { getRecipes } from "@/lib/recipes";
import type { Metadata } from "next";
import { RecipeBrowser } from "@/components/recipe-browser";
export const metadata: Metadata = {
  title: "Simple recipes",
  description:
    "Fresh ideas for everyday cooking. Explore vegetable salads, soups, smoothies, breakfast, bowls and pasta with Floruvi.",
  alternates: { canonical: "/recipes" },
};
export default async function Recipes() {
  const recipes = await getRecipes();
  return <RecipeBrowser recipes={recipes} />;
}
