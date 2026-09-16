"use client";
import Image from "next/image";
import Link from "@/components/i18n/link";
import { Heart, ArrowRight } from "lucide-react";
import type { ShopProduct } from "@/lib/storefront";
import type { Messages } from "@/lib/i18n/messages";
import { useI18n } from "./i18n/provider";
import { ProductCard } from "./product-card";
import { EditorialBanner } from "./editorial-banner";
import { useWishlist, WishlistButton } from "./wishlist";
import freshBag from "@/src/assets/fresh-bag.webp";
import freshMeal from "@/src/assets/fresh-meal.webp";
export function WishlistPage({
  products,
  labels,
}: {
  products: ShopProduct[];
  labels: Messages["wishlist"];
}) {
  const saved = useWishlist();
  const { plural } = useI18n();
  const recommendations = products
    .filter((product) => !saved.some((item) => item.slug === product.slug))
    .slice(0, 4);
  return (
    <div className="page-width wishlist-page">
      <section
        className="wishlist-hero recipe-banner"
        aria-labelledby="wishlist-title"
      >
        <Image
          src={freshBag}
          alt={labels.heroAlt}
          fill
          sizes="100vw"
          preload
        />
        <div>
          <span className="eyebrow">{labels.eyebrow}</span>
          <h1 id="wishlist-title">
            {labels.title}
            <br />
            <em>{labels.accent}</em>
          </h1>
          <p>{labels.intro}</p>
        </div>
      </section>
      {saved.length ? (
        <>
          <p className="wishlist-count" aria-live="polite">
            {plural(saved.length, labels.count)}
          </p>
          <div className="product-grid">
            {[...saved].reverse().map((item) => {
              const product = products.find((p) => p.slug === item.slug);
              return (
                <div className="wishlist-product" key={item.slug}>
                  {product ? (
                    <ProductCard product={product} />
                  ) : (
                    <div className="wishlist-unavailable">
                      <h2>{item.name}</h2>
                      <p>{labels.unlisted}</p>
                    </div>
                  )}
                  <WishlistButton slug={item.slug} name={item.name} />
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <section className="wishlist-empty">
          <Heart size={32} />
          <h2>{labels.emptyTitle}</h2>
          <p>{labels.emptyText}</p>
          <Link className="text-link" href="/products">
            {labels.explore} <ArrowRight size={16} />
          </Link>
        </section>
      )}
      <EditorialBanner
        image={freshMeal}
        alt={labels.bannerAlt}
        title={labels.bannerTitle}
        className="wishlist-banner left"
      />
      <section className="wishlist-recommendations">
        <div className="section-heading">
          <h2>{labels.recommendations}</h2>
          <Link className="text-link" href="/products">
            {labels.exploreAll} <ArrowRight size={16} />
          </Link>
        </div>
        <div className="product-grid">
          {recommendations.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
