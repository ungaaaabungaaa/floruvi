import type { Metadata } from "next";
import { CatalogueBrowser } from "@/components/catalogue-browser";
import { getShop } from "@/lib/storefront";
import { getI18n } from "@/lib/i18n/server";
import { localizePath } from "@/lib/i18n/config";
import { absoluteUrl, jsonLd, pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getI18n();
  return pageMetadata({
    path: "/products",
    title: messages.meta.products.title,
    description: messages.meta.products.description,
  });
}

export default async function Products() {
  const [{ locale, messages }, { products, categories }] = await Promise.all([
    getI18n(),
    getShop(),
  ]);
  const list = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: messages.meta.products.title,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: product.name,
      url: absoluteUrl(localizePath(locale.locale, `/products/${product.slug}`)),
    })),
  };
  return (
    <div className="recipe-collection page-width shop-collection">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(list)} />
      <CatalogueBrowser
        products={products}
        categories={categories}
        labels={messages.shop}
      />
    </div>
  );
}
