import { cache } from "react";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { recipeImage } from "./recipes";
import { storefrontCopy } from "./storefront-copy";
import { getI18n } from "./i18n/server";
import type { Messages } from "./i18n/messages";

// Convex returns translated text and market prices for the version. English text
// keeps its storefront formatting; translations are shown as translated.
const packLabel = (messages: Messages, label: string) =>
  (messages.packLabels as Record<string, string>)[label] ?? label;
const englishCopy = <T extends { translated: boolean }>(record: T) =>
  record.translated ? record : storefrontCopy(record);

export const getShop = cache(async () => {
  const { locale, messages } = await getI18n();
  const raw = await fetchQuery(api.storefront.catalogue, {
    language: locale.language,
    market: locale.market,
  });
  const products = raw.products.map((product) => {
    const text = englishCopy({
      translated: product.translated,
      name: product.name,
      description: product.description,
      uses: product.uses,
    });
    return {
      ...product,
      name: text.name,
      description: text.description,
      uses: text.uses,
      price: product.price && {
        ...product.price,
        packLabel: packLabel(messages, product.price.packLabel),
      },
    };
  });
  const categoryText = messages.categories as Record<
    string,
    { name: string; description: string } | undefined
  >;
  const categories = raw.categories.map((category) => ({
    slug: category.slug,
    name: categoryText[category.slug]?.name ?? storefrontCopy(category.name),
    description:
      categoryText[category.slug]?.description ?? storefrontCopy(category.description),
  }));
  return { commerce: raw.commerce, categories, products };
});
export type ShopProduct = Awaited<ReturnType<typeof getShop>>["products"][number];
export type ShopCategory = Awaited<ReturnType<typeof getShop>>["categories"][number];

export const getProduct = cache(async (slug: string) => {
  const { locale, messages } = await getI18n();
  const result = await fetchQuery(api.storefront.product, {
    slug,
    language: locale.language,
    market: locale.market,
  });
  if (!result) return null;
  const { product, details, english } = result;
  const text = englishCopy({
    translated: product.translated,
    name: product.name,
    description: product.description,
    uses: product.uses,
  });
  return {
    product: {
      ...product,
      ...text,
      price: product.price && {
        ...product.price,
        packLabel: packLabel(messages, product.price.packLabel),
      },
    },
    details: details && (product.translated ? details : storefrontCopy(details)),
    record: english,
  };
});

export const getRecipeList = cache(async () => {
  const { locale, messages } = await getI18n();
  const raw = await fetchQuery(api.storefront.recipes, { language: locale.language });
  const categories = messages.recipeCategories as Record<string, string | undefined>;
  return raw.map((recipe) => {
    const text = englishCopy({
      translated: recipe.translated,
      name: recipe.name,
      description: recipe.description,
      ingredientSearch: recipe.ingredientSearch,
    });
    return {
      slug: recipe.slug,
      categoryKey: recipe.category,
      category: categories[recipe.category] ?? recipe.category,
      minutes: recipe.minutes,
      servings: recipe.servings,
      crops: recipe.crops,
      image: recipeImage(recipe.imageKey),
      name: text.name,
      description: text.description,
      ingredientSearch: text.ingredientSearch,
    };
  });
});
export type RecipeSummary = Awaited<ReturnType<typeof getRecipeList>>[number];

export const getRecipe = cache(async (slug: string) => {
  const { locale, messages } = await getI18n();
  const recipe = await fetchQuery(api.storefront.recipe, { slug, language: locale.language });
  if (!recipe) return null;
  const text = englishCopy({
    translated: recipe.translated,
    name: recipe.name,
    description: recipe.description,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    tip: recipe.tip,
  });
  const categories = messages.recipeCategories as Record<string, string | undefined>;
  return {
    ...recipe,
    ...text,
    categoryKey: recipe.category,
    category: categories[recipe.category] ?? recipe.category,
    image: recipeImage(recipe.imageKey),
  };
});
export type RecipeDetail = NonNullable<Awaited<ReturnType<typeof getRecipe>>>;
