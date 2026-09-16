import Link from "@/components/i18n/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowUpRight,
  Sprout,
  Leaf,
  Truck,
  ChefHat,
  Utensils,
  Sun,
  Flower2,
  Snowflake,
  Salad,
  Lightbulb,
} from "lucide-react";
import { getProduct, getRecipeList, getShop } from "@/lib/storefront";
import { getI18n } from "@/lib/i18n/server";
import { fill, formatCurrency, type CurrencyCode } from "@/lib/i18n/format";
import { localizePath } from "@/lib/i18n/config";
import { recipesForProduct } from "@/lib/product-recipes";
import { productImages } from "@/lib/product-images";
import { absoluteUrl, jsonLd, pageMetadata } from "@/lib/seo";
import { siteUrl } from "@/lib/site";
import { breadcrumbList, schemaPrice } from "@/lib/structured-data";
import { ProductGallery } from "@/components/product-gallery";
import { ProductCard } from "@/components/product-card";
import { AddToCart } from "@/components/add-to-cart";
import { ProductStoryBanner } from "@/components/product-story-banner";
import { Money } from "@/components/i18n/money";

type Props = PageProps<"/[locale]/products/[slug]">;
const icons = {
  leaf: Leaf,
  sprout: Sprout,
  chef: ChefHat,
  utensils: Utensils,
  sun: Sun,
  flower: Flower2,
  salad: Salad,
  lightbulb: Lightbulb,
};
function DetailIcon({ name }: { name: string }) {
  const Icon = icons[name as keyof typeof icons] ?? Leaf;
  return <Icon strokeWidth={1.4} aria-hidden="true" />;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [{ locale, messages }, result] = await Promise.all([getI18n(), getProduct(slug)]);
  if (!result) return { title: messages.meta.productNotFound, robots: { index: false } };
  const { product } = result;
  const image = product.imageUrl ?? productImages[product.slug]?.src;
  const price = product.price;
  return pageMetadata({
    path: `/products/${slug}`,
    title: fill(messages.meta.productTitle, {
      name: product.name,
      country: locale.countryName,
    }),
    description: price
      ? fill(messages.meta.productDescription, {
          description: product.description,
          pack: price.packLabel,
          price: formatCurrency(price.amountMinor, price.currency as CurrencyCode, locale.tag),
        })
      : product.description,
    image: image ? { url: image, alt: product.name } : undefined,
  });
}

export default async function ProductDetails({ params }: Props) {
  const { slug } = await params;
  const [{ locale, messages }, result, shop, recipes] = await Promise.all([
    getI18n(),
    getProduct(slug),
    getShop(),
    getRecipeList(),
  ]);
  if (!result) notFound();
  const { product: p, details, record } = result;
  const t = messages.product;
  const inlineName = locale.language === "de" ? p.name : p.name.toLocaleLowerCase(locale.tag);
  const related = shop.products
    .filter((q) => q.slug !== p.slug)
    .sort(
      (a, b) =>
        Number(b.category === p.category) - Number(a.category === p.category),
    )
    .slice(0, 4);
  // Recipe matching reads the stored English uses & category keys.
  const meals = recipesForProduct(
    { slug: p.slug, category: p.category, uses: record.uses },
    recipes.map((recipe) => ({ ...recipe, category: recipe.categoryKey })),
  ).map(({ recipe, direct }) => ({
    recipe: recipes.find((item) => item.slug === recipe.slug)!,
    direct,
  }));
  const url = absoluteUrl(localizePath(locale.locale, `/products/${p.slug}`));
  const image = p.imageUrl ?? (productImages[p.slug] && absoluteUrl(productImages[p.slug].src));
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: p.name,
        description: p.description,
        category: shop.categories.find((c) => c.slug === p.category)?.name,
        sku: p.slug,
        url,
        inLanguage: locale.tag,
        brand: { "@type": "Brand", name: "Floruvi" },
        ...(image ? { image } : {}),
        ...(p.price
          ? {
              offers: {
                "@type": "Offer",
                url,
                price: schemaPrice(p.price.amountMinor, p.price.currency),
                priceCurrency: p.price.currency,
                itemCondition: "https://schema.org/NewCondition",
                seller: { "@id": `${siteUrl}/#organization` },
              },
            }
          : {}),
      },
      breadcrumbList([
        {
          name: t.breadcrumbHome,
          url: absoluteUrl(localizePath(locale.locale, "/")),
        },
        {
          name: t.breadcrumbShop,
          url: absoluteUrl(localizePath(locale.locale, "/products")),
        },
        { name: p.name, url },
      ]),
    ],
  };
  return (
    <div className="page-width product-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structuredData)} />
      <section className="product-detail" aria-labelledby="product-heading">
        <ProductGallery
          key={p.slug}
          product={p}
          labels={t.gallery}
          dishes={meals
            .filter((m) => m.direct)
            .map((m) => ({
              image: m.recipe.image,
              name: m.recipe.name,
              slug: m.recipe.slug,
            }))}
        />
        <div className="detail-copy">
          <h1 id="product-heading">{p.name}</h1>
          {details && <p className="product-tagline">{details.tagline}</p>}
          <p className="detail-description">{p.description}</p>
          <p className="detail-price">
            <Money minor={p.price?.amountMinor} currency={p.price?.currency} />
            {p.price && <small> / {p.price.packLabel}</small>}
          </p>
          <AddToCart slug={p.slug} name={p.name} />
          <div className="product-assurances">
            <span>
              <Leaf />
              {t.assurances.fresh}
            </span>
            <span>
              <Sprout />
              {t.assurances.care}
            </span>
            <span>
              <ChefHat />
              {t.assurances.cook}
            </span>
            <span>
              <Truck />
              {locale.domestic
                ? t.assurances.domestic
                : fill(t.assurances.export, { country: locale.countryName })}
            </span>
          </div>
          <div className="hero-meals">
            <div className="hero-meals-heading">
              <h2>{t.waysToEnjoy}</h2>
              <a href="#ways-heading">
                {t.seeAllRecipes} <ArrowUpRight size={14} />
              </a>
            </div>
            <div className="hero-meal-list">
              {meals.slice(0, 3).map(({ recipe }) => (
                <Link href={`/recipes/${recipe.slug}`} key={recipe.slug}>
                  <Image
                    src={recipe.image}
                    alt={recipe.name}
                    width={100}
                    height={100}
                  />
                  <div>
                    <h3>{recipe.name}</h3>
                    <p>{fill(t.minutes, { count: recipe.minutes })}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          {details && (
            <div className="hero-storage">
              <Leaf size={23} />
              <div>
                <h2>{t.howToStore}</h2>
                <p>{details.storage}</p>
              </div>
            </div>
          )}
        </div>
      </section>
      {details && (
        <section className="product-why" aria-labelledby="why-heading">
          <div className="product-section-heading">
            <h2 id="why-heading">{fill(t.whyEat, { name: inlineName })}</h2>
            <p>{t.whySubtitle}</p>
          </div>
          <div className="product-benefit-layout">
            <div className="product-benefits">
              {details.benefits.map((benefit, index) => (
                <div className="product-benefit" key={index}>
                  <DetailIcon name={benefit.icon} />
                  <div>
                    <h3>{benefit.title}</h3>
                    <p>{benefit.text}</p>
                  </div>
                </div>
              ))}
              <div className="product-benefit">
                <Snowflake strokeWidth={1.4} />
                <div>
                  <h3>{t.keepFresh}</h3>
                  <p>{details.storage}</p>
                </div>
              </div>
            </div>
            <aside className="product-nutrition">
              <h3>{details.nutritionTitle}</h3>
              {details.nutrition.map((n, index) => (
                <div className="nutrition-row" key={index}>
                  <DetailIcon name={n.icon} />
                  <div>
                    <h4>{n.title}</h4>
                    <p>{n.text}</p>
                  </div>
                </div>
              ))}
              <a
                href={details.nutritionSource}
                target="_blank"
                rel="noreferrer"
                className="nutrition-reference"
              >
                {t.foodGuide} <ArrowUpRight size={12} />
              </a>
            </aside>
          </div>
        </section>
      )}
      <section className="product-ways" aria-labelledby="ways-heading">
        <div className="product-section-heading">
          <h2 id="ways-heading">{fill(t.waysToEnjoyName, { name: inlineName })}</h2>
        </div>
        <div className="product-meal-grid">
          {meals.map(({ recipe, direct }) => (
            <Link
              className="product-meal"
              href={`/recipes/${recipe.slug}`}
              key={recipe.slug}
            >
              <div className="product-meal-image">
                <Image
                  src={recipe.image}
                  alt={recipe.name}
                  fill
                  sizes="(max-width: 600px) 44vw, (max-width: 900px) 30vw, 19vw"
                />
              </div>
              <h3>{recipe.name}</h3>
              {!direct && <p>{t.servingInspiration}</p>}
            </Link>
          ))}
        </div>
      </section>
      {details && <ProductStoryBanner index={details.bannerIndex} />}
      <section className="product-recommendations">
        <div className="section-heading">
          <h2>{t.youMayAlsoLike}</h2>
          <Link href="/products" className="text-link">
            {t.viewAll} <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="product-grid">
          {related.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
