import type { Metadata } from "next";
import Link from "@/components/i18n/link";
import Image from "next/image";
import { ArrowUpRight, Users } from "lucide-react";
import { getShop } from "@/lib/storefront";
import { getI18n } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n/format";
import { pageMetadata } from "@/lib/seo";
import { ProductCard } from "@/components/product-card";
import { HomeHero } from "@/components/home-hero";
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
  const [{ messages }, { products }] = await Promise.all([getI18n(), getShop()]);
  const t = messages.home;
  const boxes = messages.common.boxes;
  const featured = [
    "butterhead-lettuce",
    "spinach",
    "cherry-tomatoes",
    "cucumber",
    "carrot",
    "sweet-basil",
    "curly-kale",
    "bell-peppers",
    "radish-microgreens",
    "arugula",
  ].flatMap((slug) => products.filter((product) => product.slug === slug));

  return (
    <>
      <HomeHero labels={t} search={messages.shop} />
      <div className="home-chapters">
        <section
          className="home-picks home-wrap"
          aria-labelledby="home-picks-title"
        >
          <div className="home-section-heading">
            <h2 id="home-picks-title">{t.freshToday}</h2>
            <Link href="/products" className="home-more">
              {t.shopAll} <ArrowUpRight size={19} aria-hidden="true" />
            </Link>
          </div>
          <nav className="home-category-links" aria-label={t.categoriesLabel}>
            <Link href="/products?category=leafy-greens">{t.categoryLinks.leafy}</Link>
            <Link href="/products?category=herbs">{t.categoryLinks.herbs}</Link>
            <Link href="/products?category=microgreens">{t.categoryLinks.microgreens}</Link>
            <Link href="/products?category=fruiting-crops">{t.categoryLinks.colourful}</Link>
          </nav>
          <div className="home-fresh-grid">
            {featured.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </section>

        <section className="home-boxes" aria-labelledby="home-boxes-title">
          <div className="home-wrap">
            <div className="home-section-heading">
              <h2 id="home-boxes-title">
                {t.boxesTitle}
                <br />
                <em>{t.boxesAccent}</em>
              </h2>
              <div>
                <Link href="/boxes" className="home-more">
                  {t.exploreBoxes} <ArrowUpRight size={19} aria-hidden="true" />
                </Link>
              </div>
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
                    <ArrowUpRight size={22} aria-hidden="true" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
