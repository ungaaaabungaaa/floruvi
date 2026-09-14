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
  ArrowLeft,
  LoaderCircle,
} from "lucide-react";
import { useCart } from "./cart-store";
import { productImages } from "@/lib/product-images";
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
      <span className="eyebrow">YOUR FRESH SELECTION</span>
      <h2>Basket summary</h2>
      <div className="summary-row">
        <span>Selected units</span>
        <strong>
          {review?.items.reduce((n, i) => n + i.quantity, 0) ?? "—"}
        </strong>
      </div>
      <div className="summary-row">
        <span>Produce</span>
        <span>{review ? formatMoney(review.subtotal) : "—"}</span>
      </div>
      <div className="summary-row">
        <span>Delivery</span>
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
      <p>Delivery fee applies once per delivery.</p>
      {children}
      <span className="summary-trust">
        <ShieldCheck size={17} /> No payment is taken at this stage.
      </span>
      <Link className="text-link" href="/delivery">
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
    <div className="page-width section">
      <div className="basket-heading">
        <div>
          <span className="eyebrow">FRESHNESS WORTH GROWING</span>
          <h1>Your basket.</h1>
        </div>
        <Link className="text-link" href="/products">
          <ArrowLeft size={15} />
          Keep exploring
        </Link>
      </div>
      <div className="basket-layout">
        <div>
          <div className="basket-table-head">
            <span>YOUR PRODUCE</span>
            <span>QUANTITY</span>
            <span>PRICE</span>
          </div>
          {cart.items.map((line) => {
            const product = products.find((p) => p.slug === line.slug);
            const pricedLine = review?.items.find((i) => i.slug === line.slug);
            const src = product?.imageUrl || productImages[line.slug];
            return (
              <article className="basket-row" key={line.slug}>
                <div className="basket-product">
                  <Link
                    href={`/products/${line.slug}`}
                    className="basket-image"
                  >
                    {src ? (
                      <Image
                        src={src}
                        alt={product?.name ?? line.slug}
                        fill
                        sizes="100px"
                        unoptimized={!!product?.imageUrl}
                      />
                    ) : (
                      <Botanical category={product?.category} />
                    )}
                  </Link>
                  <div>
                    <Link href={`/products/${line.slug}`}>
                      <h2>{product?.name ?? line.slug}</h2>
                    </Link>
                    <p>
                      {product
                        ? (pricedLine?.packLabel ??
                          product.price?.packLabel ??
                          "Pack on request")
                        : "This crop is no longer listed."}
                    </p>
                    <button
                      className="remove-crop"
                      onClick={() => cart.remove(line.slug)}
                      aria-label={`Remove ${product?.name ?? line.slug}`}
                    >
                      <Trash2 size={12} />
                      Remove
                    </button>
                  </div>
                </div>
                <div className="quantity-picker">
                  <button
                    type="button"
                    aria-label={`Reduce ${product?.name ?? line.slug}`}
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
                    aria-label={`Increase ${product?.name ?? line.slug}`}
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
              </article>
            );
          })}
          <div className="basket-caption">
            <span>Availability on request.</span>
            <button type="button" className="text-link" onClick={cart.clear}>
              Clear basket
            </button>
          </div>
          <div className="basket-help">
            <h2>Buying for a business?</h2>
            <p>Tell us about your business and regular produce needs.</p>
            <Link className="text-link" href="/wholesale">
              Business enquiries <ArrowRight size={16} />
            </Link>
          </div>
        </div>
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
              Continue to Checkout <ArrowRight size={17} />
            </Link>
          )}
        </BasketSummary>
      </div>
    </div>
  );
}
