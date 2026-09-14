import { formatMoney } from "@/lib/pricing";
import Link from "next/link";
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
import { getCatalogue, getProductDetails } from "@/lib/catalogue";
import { siteUrl } from "@/lib/site";
import { getRecipes } from "@/lib/recipes";
import { recipesForProduct } from "@/lib/product-recipes";
import { ProductGallery } from "@/components/product-gallery";
import { ProductCard, categoryLabels } from "@/components/product-card";
import { AddToCart } from "@/components/add-to-cart";
import { ProductStoryBanner } from "@/components/product-story-banner";
type Props = { params: Promise<{ slug: string }> };
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
  const { products } = await getCatalogue();
  const p = products.find((p) => p.slug === slug);
  return {
    title: p?.name ?? "Product not found",
    description: p?.description,
    alternates: { canonical: `/products/${slug}` },
  };
}
export default async function ProductDetails({ params }: Props) {
  const { slug } = await params;
  const [{ products }, recipes, details] = await Promise.all([
    getCatalogue(),
    getRecipes(),
    getProductDetails(slug),
  ]);
  const p = products.find((p) => p.slug === slug);
  if (!p) notFound();
  const related = products
    .filter((q) => q.slug !== p.slug)
    .sort(
      (a, b) =>
        Number(b.category === p.category) - Number(a.category === p.category),
    )
    .slice(0, 4);
  const meals = recipesForProduct(p, recipes);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    category: categoryLabels[p.category],
    url: `${siteUrl}/products/${p.slug}`,
    ...(p.imageUrl ? { image: p.imageUrl } : {}),
  };
  return (
    <div className="page-width product-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <section className="product-detail" aria-labelledby="product-heading">
        <ProductGallery
          key={p.slug}
          product={p}
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
          <p className="detail-description">
            {p.description}
            {details && (
              <span className="product-description-extra">
                {details.preparation}
              </span>
            )}
          </p>
          <p className="detail-price">
            {formatMoney(p.price?.amountMinor)}
            {p.price && <small> / {p.price.packLabel}</small>}
          </p>
          <AddToCart slug={p.slug} name={p.name} />
          <div className="product-assurances">
            <span>
              <Leaf />
              Fresh produce
            </span>
            <span>
              <Sprout />
              Grown with care
            </span>
            <span>
              <ChefHat />
              Cook your way
            </span>
            <span>
              <Truck />
              Across India
            </span>
          </div>
          <div className="hero-meals">
            <div className="hero-meals-heading">
              <h2>Ways to enjoy</h2>
              <a href="#ways-heading">
                See all recipes <ArrowUpRight size={14} />
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
                    <p>{recipe.minutes} mins</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          {details && (
            <div className="hero-storage">
              <Leaf size={23} />
              <div>
                <h2>How to store</h2>
                <p>{details.storage}</p>
              </div>
            </div>
          )}
        </div>
      </section>
      {details && (
        <section className="product-why" aria-labelledby="why-heading">
          <div className="product-section-heading">
            <h2 id="why-heading">Why eat {p.name.toLowerCase()}?</h2>
            <p>Good ingredients. Everyday possibilities.</p>
          </div>
          <div className="product-benefit-layout">
            <div className="product-benefits">
              {details.benefits.map((benefit) => (
                <div className="product-benefit" key={benefit.title}>
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
                  <h3>Keep it fresh</h3>
                  <p>{details.storage}</p>
                </div>
              </div>
            </div>
            <aside className="product-nutrition">
              <h3>{details.nutritionTitle}</h3>
              {details.nutrition.map((n) => (
                <div className="nutrition-row" key={n.title}>
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
                Food guide <ArrowUpRight size={12} />
              </a>
            </aside>
          </div>
        </section>
      )}
      <section className="product-ways" aria-labelledby="ways-heading">
        <div className="product-section-heading">
          <h2 id="ways-heading">Ways to enjoy {p.name.toLowerCase()}</h2>
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
              {!direct && <p>Serving inspiration</p>}
            </Link>
          ))}
        </div>
      </section>
      {details && <ProductStoryBanner index={details.bannerIndex} />}
      <section className="product-recommendations">
        <div className="section-heading">
          <h2>You may also like</h2>
          <Link href="/products" className="text-link">
            View all <ArrowUpRight size={16} />
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
