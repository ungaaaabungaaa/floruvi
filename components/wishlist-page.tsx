"use client";
import Image from "next/image";
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import type { Product } from "@/lib/catalogue";
import { ProductCard } from "./product-card";
import { EditorialBanner } from "./editorial-banner";
import { useWishlist, WishlistButton } from "./wishlist";
import freshBag from "@/src/assets/fresh-bag.webp";
import freshMeal from "@/src/assets/fresh-meal.webp";
export function WishlistPage({ products }: { products: Product[] }) {
  const saved = useWishlist();
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
          alt="A linen bag filled with fresh vegetables"
          fill
          sizes="100vw"
          preload
        />
        <div>
          <span className="eyebrow">YOUR WISHLIST</span>
          <h1 id="wishlist-title">
            Good choices.
            <br />
            <em>Bring them to your table.</em>
          </h1>
          <p>
            Your next fresh meal starts here. Turn the ingredients you love into
            something you’ll enjoy today.
          </p>
        </div>
      </section>
      {saved.length ? (
        <>
          <p className="wishlist-count" aria-live="polite">
            {saved.length} saved {saved.length === 1 ? "item" : "items"}
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
                      <p>This product is no longer listed.</p>
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
          <h2>Save a little inspiration.</h2>
          <p>Tap the heart on a product to keep your favourites here.</p>
          <Link className="text-link" href="/products">
            Explore produce <ArrowRight size={16} />
          </Link>
        </section>
      )}
      <EditorialBanner
        image={freshMeal}
        alt="A colourful fresh salad with herbs & lemon"
        title="Make your next meal a fresh one."
        className="wishlist-banner left"
      />
      <section className="wishlist-recommendations">
        <div className="section-heading">
          <h2>You might also like</h2>
          <Link className="text-link" href="/products">
            Explore all <ArrowRight size={16} />
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
