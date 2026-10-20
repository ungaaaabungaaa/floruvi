import type { Metadata } from "next";
import Link from "@/components/i18n/link";
import Image from "next/image";
import { ArrowUpRight, Leaf, Sprout, Truck, Users } from "lucide-react";
import { getShop, getRecipeList } from "@/lib/storefront";
import { getI18n } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n/format";
import { localizePath } from "@/lib/i18n/config";
import { absoluteUrl, jsonLd, pageMetadata } from "@/lib/seo";
import { CatalogueBrowser } from "@/components/catalogue-browser";
import { GrowingNotebook } from "@/components/growing-notebook";
import "@/components/growing-additions.css";
import { RecipeCard } from "@/components/recipe-card";
import { featureRecipeOrder } from "@/lib/session-order";
import { HomeHero } from "@/components/home-hero";
import { PantryBanner } from "@/components/pantry-banner";
import { ProductCard } from "@/components/product-card";
import { boxSizes } from "@/lib/boxes";
import singleBox from "@/src/assets/boxes/single.webp";
import dualBox from "@/src/assets/boxes/dual.webp";
import familyBox from "@/src/assets/boxes/family.webp";

const boxImages = { single: singleBox, dual: dualBox, family: familyBox };

export async function generateMetadata(): Promise<Metadata> {
  const { locale, messages } = await getI18n();
  return pageMetadata({
    path: "/",
    description: locale.domestic
      ? messages.meta.description
      : fill(messages.meta.descriptionExport, { country: locale.countryName }),
  });
}

export default async function Home() {
  const [{ locale, messages }, { products, categories }, recipes] =
    await Promise.all([getI18n(), getShop(), getRecipeList()]);
  // The home page is cached for everyone, so it never reads the query string on the
  // server. useUrlParams applies a ?q= or ?category= filter after hydration.
  const query = "";
  const t = messages.home;
  const boxes = messages.common.boxes;
  const featuredRecipes = featureRecipeOrder(recipes).slice(0, 4);
  const pantryProducts = products.filter(
    (product) => product.category === "flours-and-powders",
  );

  const list = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: messages.meta.products.title,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: product.name,
      url: absoluteUrl(
        localizePath(locale.locale, `/products/${product.slug}`),
      ),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(list)}
      />
      <div className="page-width home-hero-frame">
        <HomeHero
          labels={t}
          search={messages.shop}
          categories={categories}
          pageQuery={query}
        />
      </div>
      <div className="recipe-collection page-width shop-collection home-catalogue">
        <CatalogueBrowser
          products={products}
          categories={categories}
          labels={messages.shop}
          query={query}
          hideBanner
        />
      </div>
      <div className="home-chapters">
        {pantryProducts.length > 0 && (
          <section
            className="home-pantry home-wrap"
            aria-labelledby="home-pantry-title"
          >
            <PantryBanner labels={t} />
            <div className="pantry-products-heading">
              <h3>
                {
                  categories.find(
                    (category) => category.slug === "flours-and-powders",
                  )?.name
                }
              </h3>
              <Link
                href="/products/category/flours-and-powders"
                className="home-more"
              >
                {t.pantry.browse} <ArrowUpRight size={19} aria-hidden="true" />
              </Link>
            </div>
            <div
              className="pantry-products"
              tabIndex={0}
              role="region"
              aria-label={t.pantry.browse}
            >
              {pantryProducts.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          </section>
        )}
        <section
          className="home-recipes home-wrap"
          aria-labelledby="home-recipes-title"
        >
          <div className="home-section-heading">
            <h2 id="home-recipes-title">{t.recipesTitle}</h2>
            <Link href="/recipes" className="home-more">
              {t.allRecipes} <ArrowUpRight size={19} aria-hidden="true" />
            </Link>
          </div>
          <div className="recipe-grid">
            {featuredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.slug}
                recipe={recipe}
                minutes={t.minutes}
              />
            ))}
          </div>
        </section>

        <section className="home-boxes" aria-labelledby="home-boxes-title">
          <div className="home-wrap">
            <div className="home-section-heading">
              <div>
                <span className="eyebrow">{t.boxesEyebrow}</span>
                <h2 id="home-boxes-title">
                  {t.boxesTitle}
                  <br />
                  <em>{t.boxesAccent}</em>
                </h2>
              </div>
              <Link href="/boxes" className="home-more">
                {t.exploreBoxes} <ArrowUpRight size={19} aria-hidden="true" />
              </Link>
            </div>
            <div className="home-box-grid">
              {boxSizes.map((box) => (
                <Link
                  href="/boxes"
                  className="home-box-card"
                  key={box.id}
                  aria-label={fill(t.boxLabel, {
                    name: boxes[box.id].name,
                    people: boxes[box.id].people,
                  })}
                >
                  <div className="home-box-photo">
                    <Image
                      src={boxImages[box.id]}
                      alt={fill(t.boxAlt, { name: boxes[box.id].name })}
                      fill
                      sizes="(max-width: 700px) 100vw, 440px"
                    />
                  </div>
                  <div className="home-box-info">
                    <div>
                      <h3>{boxes[box.id].name}</h3>
                      <span className="home-box-people">
                        <Users size={13} aria-hidden="true" />
                        {boxes[box.id].people}
                      </span>
                    </div>
                    <span className="recipe-card-arrow" aria-hidden="true">
                      <ArrowUpRight size={20} />
                    </span>
                  </div>
                  <p className="home-box-description">
                    {boxes[box.id].description}
                  </p>
                </Link>
              ))}
            </div>
            <div className="home-box-features">
              <ul>
                <li>
                  <Leaf size={16} aria-hidden="true" />
                  {t.boxFeatures[0]}
                </li>
                <li>
                  <Sprout size={16} aria-hidden="true" />
                  {t.boxFeatures[1]}
                </li>
                <li>
                  <Truck size={16} aria-hidden="true" />
                  {t.boxFeatures[2]}
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Testimonials stay unpublished until real customer quotes are approved. */}
      </div>
      <div className="home-growing-notebook">
        <div className="page-width">
          <GrowingNotebook labels={messages.howWeGrow} />
        </div>
      </div>
    </>
  );
}
