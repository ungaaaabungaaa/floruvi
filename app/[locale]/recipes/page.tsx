import type { Metadata } from "next";
import { RecipeBrowser } from "@/components/recipe-browser";
import { getRecipeList } from "@/lib/storefront";
import { getI18n } from "@/lib/i18n/server";
import { localizePath } from "@/lib/i18n/config";
import { absoluteUrl, jsonLd, pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getI18n();
  return pageMetadata({
    path: "/recipes",
    title: messages.meta.recipes.title,
    description: messages.meta.recipes.description,
  });
}

export default async function Recipes() {
  const [{ locale, messages }, recipes] = await Promise.all([getI18n(), getRecipeList()]);
  const list = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: messages.meta.recipes.title,
    numberOfItems: recipes.length,
    itemListElement: recipes.map((recipe, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: recipe.name,
      url: absoluteUrl(localizePath(locale.locale, `/recipes/${recipe.slug}`)),
    })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(list)} />
      <RecipeBrowser recipes={recipes} labels={messages.recipes} />
    </>
  );
}
