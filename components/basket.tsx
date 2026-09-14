"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ShieldCheck,
  Leaf,
  LoaderCircle,
} from "lucide-react";
import { useCart } from "./cart-store";
import { getCartBox } from "@/lib/boxes";
import singleBox from "@/src/assets/boxes/single.webp";
import dualBox from "@/src/assets/boxes/dual.webp";
import familyBox from "@/src/assets/boxes/family.webp";
const boxImages = { single: singleBox, dual: dualBox, family: familyBox };
import { productImages } from "@/lib/product-images";
import cartBanner from "@/src/assets/recipes/banners/freshly-picked.webp";
import herbsBanner from "@/src/assets/products/banners/herbs.webp";
import { Botanical } from "./botanical";
import type { Product } from "@/lib/catalogue";
import type { CartLine } from "@/lib/cart";
import { formatMoney, type BasketReview } from "@/lib/pricing";
export type { BasketReview } from "@/lib/pricing";
export function useBasketReview(items: CartLine[]) {
  const key = JSON.stringify(items);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{
    key: string;
    review?: BasketReview;
    error?: string;
  }>({ key: "" });
  useEffect(() => {
    if (!items.length) return;
    const controller = new AbortController();
    fetch("/api/checkout-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: JSON.parse(key) }),
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Could not check your basket.");
        return data as BasketReview;
      })
      .then((review) => setState({ key: key + attempt, review }))
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({
            key: key + attempt,
            error:
              error instanceof Error
                ? error.message
                : "Could not check your basket.",
          });
      });
    return () => controller.abort();
  }, [key, attempt, items.length]);
  const current = state.key === key + attempt ? state : null;
  return {
    review: current?.review,
    error: current?.error,
    loading: items.length > 0 && !current,
    retry: () => setAttempt((n) => n + 1),
  };
}
export function BasketSummary({
  review,
  children,
}: {
  review?: BasketReview;
  children?: React.ReactNode;
}) {
  return (
    <aside className="basket-summary">
      <h2>Order summary</h2>
      <div className="summary-row">
        <span>
          Subtotal{" "}
          {review
            ? `(${review.items.reduce((n, i) => n + i.quantity, 0)} items)`
            : ""}
        </span>
        <span>{review ? formatMoney(review.subtotal) : "—"}</span>
      </div>
      <div className="summary-row">
        <span>Delivery fee</span>
        <span>{review ? formatMoney(review.delivery) : "—"}</span>
      </div>
      <div className="summary-total">
        <span>Total</span>
        <span>
          {review
            ? review.total === null
              ? "Quote required"
              : formatMoney(review.total)
            : "—"}
        </span>
      </div>
      {children}
      <span className="summary-trust">
        <ShieldCheck size={17} /> No payment is taken at this stage.
      </span>
      <Link className="text-link" href="/faq#delivery">
        Delivery information <ArrowRight size={14} />
      </Link>
    </aside>
  );
}
export function EmptyBasket() {
  return (
    <section className="empty-basket">
      <ShoppingBag size={45} strokeWidth={1} />
      <span className="eyebrow">ROOM FOR SOMETHING FRESH</span>
      <h1>Your basket is empty.</h1>
      <p>Choose vegetables to get started.</p>
      <Link className="button button-primary" href="/products">
        Explore the Produce <ArrowRight size={17} />
      </Link>
    </section>
  );
}
export function BasketPage({ products }: { products: Product[] }) {
  const cart = useCart();
  const { review, error, loading, retry } = useBasketReview(cart.items);
  if (!cart.items.length)
    return (
      <div className="page-width section">
        <EmptyBasket />
      </div>
    );
  const missing = review?.items.some((i) => !i.availableToEnquire);
  return (
    <div className="page-width cart-page">
      <section className="cart-hero" aria-labelledby="cart-title">
        <Image
          src={cartBanner}
          alt="A basket of fresh vegetables"
          fill
          sizes="100vw"
          preload
        />
        <div>
          <h1 id="cart-title">Your cart</h1>
          <p>Fresh produce, ready for your table.</p>
          <Leaf size={22} strokeWidth={1.3} aria-hidden="true" />
        </div>
      </section>
      <div className="basket-layout">
        <div>
          <div className="basket-table-head">
            <span>PRODUCT</span>
            <span>QUANTITY</span>
            <span>PRICE</span>
            <span />
          </div>
          <div className="cart-items">
            {cart.items.map((line) => {
              const box = getCartBox(line.slug);
              const product = products.find((p) => p.slug === line.slug);
              const name = box?.name ?? product?.name ?? line.slug;
              const href = box ? "/boxes" : `/products/${line.slug}`;
              const pricedLine = review?.items.find(
                (i) => i.slug === line.slug,
              );
              const src = box
                ? boxImages[box.id]
                : product?.imageUrl || productImages[line.slug];
              return (
                <article className="basket-row" key={line.slug}>
                  <div className="basket-product">
                    <Link href={href} className="basket-image">
                      {src ? (
                        <Image
                          src={src}
                          alt={name}
                          fill
                          sizes="100px"
                          unoptimized={!!product?.imageUrl}
                        />
                      ) : (
                        <Botanical category={product?.category} />
                      )}
                    </Link>
                    <div>
                      <Link href={href}>
                        <h2>{name}</h2>
                      </Link>
                      <p>
                        {box
                          ? `${box.people} · ${box.schedule}`
                          : product
                            ? (pricedLine?.packLabel ??
                              product.price?.packLabel ??
                              "Pack on request")
                            : "This crop is no longer listed."}
                      </p>
                      <span className="cart-product-note">
                        <Leaf size={13} aria-hidden="true" />
                        {box ? "Per delivery" : "Fresh produce"}
                      </span>
                    </div>
                  </div>
                  <div className="quantity-picker">
                    <button
                      type="button"
                      aria-label={`Reduce ${name}`}
                      disabled={line.quantity === 1}
                      onClick={() =>
                        cart.setQuantity(line.slug, line.quantity - 1)
                      }
                    >
                      <Minus size={14} />
                    </button>
                    <output>{line.quantity}</output>
                    <button
                      type="button"
                      aria-label={`Increase ${name}`}
                      disabled={line.quantity === 99}
                      onClick={() =>
                        cart.setQuantity(line.slug, line.quantity + 1)
                      }
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="basket-price">
                    {review ? formatMoney(pricedLine?.lineTotal) : "—"}
                  </span>
                  <button
                    type="button"
                    className="cart-remove"
                    onClick={() => cart.remove(line.slug)}
                    aria-label={`Remove ${name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </article>
              );
            })}
          </div>
          <div className="cart-delivery-note">
            <Leaf size={22} aria-hidden="true" />
            <p>
              {cart.items.every((line) => !!getCartBox(line.slug))
                ? "Delivery included with your box."
                : "Fresh produce, delivered across India."}
            </p>
          </div>
          <Link className="text-link cart-continue" href="/products">
            Continue shopping <ArrowRight size={16} />
          </Link>
        </div>
        <div className="cart-summary-column">
          <BasketSummary review={review}>
            {loading ? (
              <p role="status">
                <LoaderCircle className="spinner" size={16} />
                Checking the catalogue…
              </p>
            ) : error ? (
              <div role="alert">
                <p>{error}</p>
                <button className="button button-outline" onClick={retry}>
                  Try again
                </button>
              </div>
            ) : missing ? (
              <p role="alert">Remove unlisted crops before you continue.</p>
            ) : (
              <Link className="button button-primary" href="/checkout">
                Proceed to checkout <ArrowRight size={17} />
              </Link>
            )}
          </BasketSummary>
          <aside
            className="cart-editorial"
            aria-label="Fresh food for everyday meals"
          >
            <Image
              src={herbsBanner}
              alt="Fresh green herbs"
              fill
              sizes="(max-width: 800px) 100vw, 400px"
            />
            <div>
              <h2>
                Fresh food.
                <br />
                Every day.
              </h2>
              <p>
                Simple ingredients.
                <br />
                More ways to enjoy them.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
