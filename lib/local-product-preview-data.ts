import {
  honeyEggProducts,
  honeyEggCategories,
  honeyRecipes,
} from "./honey-eggs-data";
import {
  dehydratedProducts,
  dehydratedCategory,
} from "../convex/dehydratedData";
import { recipeCatalogue } from "../convex/recipeData";
import { pantryPrices } from "./pantry-weights";
import { wholePrice } from "./markets/pricing-core";

export function previewShop() {
  return {
    commerce: { currency: "INR", deliveryFeeMinor: 9900 },
    categories: [...honeyEggCategories, dehydratedCategory].map(
      ({ slug, name, description }) => ({ slug, name, description }),
    ),
    products: [...honeyEggProducts, ...dehydratedProducts].map((p) => ({
      slug: p.slug,
      name: p.name,
      englishName: p.name,
      description: p.description,
      uses: p.uses,
      category: p.category,
      featured: false,
      imageUrl: null,
      translated: false,
      inStock: true,
      ...pantryPrices(p.slug, wholePrice(p.price), "in"),
    })),
  };
}
export function previewProduct(slug: string) {
  const record = [...honeyEggProducts, ...dehydratedProducts].find(
    (p) => p.slug === slug,
  );
  const product = previewShop().products.find((p) => p.slug === slug);
  if (!record || !product) return null;
  return {
    product,
    details: record.details,
    record: {
      name: record.name,
      description: record.description,
      uses: record.uses,
    },
  };
}
export function previewRecipes() {
  return [
    ...honeyRecipes,
    ...recipeCatalogue.map((recipe) => ({
      ...recipe,
      // Only recipes with an actual egg ingredient receive the egg product link.
      crops: recipe.ingredients.some((ingredient) =>
        /\beggs?\b/i.test(ingredient),
      )
        ? [...new Set([...recipe.crops, "farm-eggs"])]
        : recipe.crops,
    })),
  ].map((recipe) => ({
    ...recipe,
    englishName: recipe.name,
    translated: false,
  }));
}
