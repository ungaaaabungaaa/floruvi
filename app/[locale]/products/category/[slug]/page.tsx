import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "@/components/i18n/link";
import { CategoryLinks } from "@/components/category-links";
import { ProductCard } from "@/components/product-card";
import { RecipeCard } from "@/components/recipe-card";
import { categoryImages } from "@/lib/category-images";
import { isCategorySlug, publishedCategories } from "@/lib/category-pages";
import { getI18n } from "@/lib/i18n/server";
import { localizePath } from "@/lib/i18n/config";
import { fill, formatCurrency } from "@/lib/i18n/format";
import { getRecipeList, getShop } from "@/lib/storefront";
import { absoluteUrl, jsonLd, pageMetadata, shareImage } from "@/lib/seo";
import { breadcrumbList } from "@/lib/structured-data";

type Props = PageProps<"/[locale]/products/category/[slug]">;

async function categoryData(slug: string) {
  if (!isCategorySlug(slug)) notFound();
  const [i18n, shop] = await Promise.all([getI18n(), getShop()]);
  const categories = publishedCategories(shop);
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();
  return {
    ...i18n,
    category,
    categories,
    products: shop.products.filter((product) => product.category === slug),
    guide: i18n.messages.categoryGuides[slug],
    commerce: shop.commerce,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { category, locale, messages } = await categoryData(slug);
  const image = categoryImages[slug];
  return pageMetadata({
    path: `/products/category/${slug}`,
    title: fill(
      locale.domestic
        ? messages.categoryPage.title
        : messages.categoryPage.titleExport,
      {
        name: category.name,
        country: locale.countryName,
      },
    ),
    description: category.description,
    image: image ? { ...shareImage(image), alt: category.name } : undefined,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [
    { category, categories, products, guide, commerce, locale, messages },
    recipes,
  ] = await Promise.all([categoryData(slug), getRecipeList()]);
  const t = messages.categoryPage;
  const productSlugs = new Set(products.map((product) => product.slug));
  const meals = recipes
    .filter((recipe) => recipe.crops.some((crop) => productSlugs.has(crop)))
    .slice(0, 4);
  const url = (path: string) => absoluteUrl(localizePath(locale.locale, path));
  const path = `/products/category/${slug}`;
  const list = {
    "@type": "ItemList",
    name: category.name,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: product.name,
      url: url(`/products/${product.slug}`),
    })),
  };
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url(path)}#collection`,
        url: url(path),
        name: category.name,
        description: category.description,
        inLanguage: locale.tag,
        mainEntity: list,
      },
      breadcrumbList([
        { name: messages.product.breadcrumbHome, url: url("/") },
        { name: messages.product.breadcrumbShop, url: url("/products") },
        { name: category.name, url: url(path) },
      ]),
    ],
  };
  return (
    <div className="page-width category-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(schema)}
      />
      <nav className="breadcrumb" aria-label={messages.product.breadcrumbShop}>
        <Link href="/">{messages.product.breadcrumbHome}</Link>
        <span aria-hidden="true">/</span>
        <Link href="/products">{messages.product.breadcrumbShop}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{category.name}</span>
      </nav>
      <header className="category-photo-heading">
        <div className="page-heading">
          <h1>{category.name}</h1>
          <p>{guide.intro}</p>
          <p>{guide.selection}</p>
        </div>
        <div className="category-heading-image">
          <Image
            src={categoryImages[slug]}
            alt={category.name}
            fill
            sizes="(max-width: 700px) 90vw, 45vw"
            preload
          />
        </div>
      </header>
      <section aria-labelledby="category-products">
        <div className="section-heading">
          <h2 id="category-products">{t.productsHeading}</h2>
          <Link href="/contact" className="text-link">
            {t.enquiry}
          </Link>
        </div>
        <p className="category-delivery">
          {locale.domestic
            ? commerce?.deliveryFeeMinor == null
              ? messages.product.assurances.domestic
              : fill(messages.product.assurances.domesticFee, {
                  fee: formatCurrency(
                    commerce.deliveryFeeMinor,
                    "INR",
                    locale.tag,
                  ),
                })
            : fill(messages.product.assurances.export, {
                country: locale.countryName,
              })}{" "}
          <Link href="/shipping">{t.deliveryLink}</Link>
        </p>
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>
      {meals.length > 0 && (
        <section
          className="category-recipes"
          aria-labelledby="category-recipes"
        >
          <div className="section-heading">
            <h2 id="category-recipes">{t.recipesHeading}</h2>
          </div>
          <div className="recipe-grid">
            {meals.map((recipe) => (
              <RecipeCard
                key={recipe.slug}
                recipe={recipe}
                minutes={messages.home.minutes}
              />
            ))}
          </div>
        </section>
      )}
      <CategoryLinks
        categories={categories}
        label={t.browseCategories}
        current={slug}
      />
    </div>
  );
}
