"use client";
import { useEffect, useRef, useState } from "react";
import Link from "@/components/i18n/link";
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
import type { ShopProduct } from "@/lib/storefront";
import type { CartLine } from "@/lib/cart";
import type { BasketReview } from "@/lib/pricing";
import type { Messages } from "@/lib/i18n/messages";
import type { CurrencyCode } from "@/lib/i18n/format";
import { Lines } from "./i18n/lines";
import { useI18n } from "./i18n/provider";
export type { BasketReview } from "@/lib/pricing";

export function useBasketReview(items: CartLine[]) {
  const { locale, t } = useI18n();
  const market = locale.market;
  const key = JSON.stringify(items);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{
    key: string;
    review?: BasketReview;
    error?: string;
  }>({ key: "" });
  // The last checked basket stays on screen while a changed basket is checked
  // again, so prices and buttons do not blink on every tap.
  const [last, setLast] = useState<BasketReview>();
  const checked = useRef(false);
  const fallback = t.basket.checkFailed;
  useEffect(() => {
    if (!items.length) return;
    const controller = new AbortController();
    // After the first check, wait briefly so quick +/− taps send one request.
    const timer = setTimeout(
      () =>
        fetch("/api/checkout-review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: JSON.parse(key), market }),
          signal: controller.signal,
        })
          .then(async (response) => {
            if (!response.ok) throw new Error(fallback);
            return (await response.json()) as BasketReview;
          })
          .then((review) => {
            checked.current = true;
            setLast(review);
            setState({ key: key + attempt, review });
          })
          .catch(() => {
            if (!controller.signal.aborted)
              setState({ key: key + attempt, error: fallback });
          }),
      checked.current ? 250 : 0,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [key, attempt, items.length, market, fallback]);
  const current = state.key === key + attempt ? state : null;
  return {
    review: current ? current.review : last,
    error: current?.error,
    /** No result yet: the first check is running. */
    loading: items.length > 0 && !current && !last,
    /** Showing the last result while a changed basket is checked again. */
    refreshing: items.length > 0 && !current && !!last,
    retry: () => setAttempt((n) => n + 1),
  };
}

/** Localised labels for a basket line: a box or a catalogue product. */
export function useLineLabels() {
  const { t, fill } = useI18n();
  const schedule = (slug: string) => {
    const box = getCartBox(slug);
    if (!box) return "";
    const id = slug.slice(`box-${box.id}-`.length) as keyof typeof t.boxes.schedules;
    return t.boxes.schedules[id] ?? box.schedule;
  };
  const name = (slug: string, products: { slug: string; name: string }[], fallback?: string) => {
    const box = getCartBox(slug);
    if (box)
      return fill(t.boxes.boxName, { name: t.boxes[box.id].name, schedule: schedule(slug) });
    return products.find((p) => p.slug === slug)?.name ?? fallback ?? slug;
  };
  return { name, schedule };
}

export function BasketSummary({
  review,
  refreshing = false,
  children,
}: {
  review?: BasketReview;
  /** The totals are from the previous basket and are being checked again. */
  refreshing?: boolean;
  children?: React.ReactNode;
}) {
  const { t, money, plural } = useI18n();
  const quoted = review?.deliveryQuoted;
  return (
    <aside className={refreshing ? "basket-summary is-refreshing" : "basket-summary"} aria-busy={refreshing}>
      <h2>{t.basket.summary}</h2>
      <div className="summary-row">
        <span>
          {t.basket.subtotal}{" "}
          {review
            ? plural(
                review.items.reduce((n, i) => n + i.quantity, 0),
                t.basket.items,
              )
            : ""}
        </span>
        <span>{review ? money(review.subtotal, review.currency as CurrencyCode) : "—"}</span>
      </div>
      <div className="summary-row">
        <span>{t.basket.deliveryFee}</span>
        <span>
          {!review
            ? "—"
            : quoted
              ? t.basket.deliveryQuoted
              : money(review.delivery, review.currency as CurrencyCode)}
        </span>
      </div>
      <div className="summary-total">
        <span>{quoted ? t.basket.totalBeforeDelivery : t.basket.total}</span>
        <span>
          {review
            ? review.total === null
              ? t.money.quoteRequired
              : money(review.total, review.currency as CurrencyCode)
            : "—"}
        </span>
      </div>
      {children}
      <span className="summary-trust">
        <ShieldCheck size={17} />{" "}
        {review?.paymentEnabled ? t.basket.securePayment : t.basket.noPayment}
      </span>
      <Link className="text-link" href="/faq#delivery">
        {t.basket.deliveryInfo} <ArrowRight size={14} />
      </Link>
    </aside>
  );
}
export function EmptyBasket() {
  const { t } = useI18n();
  return (
    <section className="empty-basket">
      <ShoppingBag size={45} strokeWidth={1} />
      <span className="eyebrow">{t.basket.emptyEyebrow}</span>
      <h1>{t.basket.emptyTitle}</h1>
      <p>{t.basket.emptyText}</p>
      <Link className="button button-primary" href="/products">
        {t.basket.emptyCta} <ArrowRight size={17} />
      </Link>
    </section>
  );
}
export function BasketPage({
  products,
  labels,
}: {
  products: ShopProduct[];
  labels: Messages["cart"];
}) {
  const cart = useCart();
  const { t, locale, fill, money } = useI18n();
  const lineLabels = useLineLabels();
  const { review, error, loading, refreshing, retry } = useBasketReview(cart.items);
  if (!cart.items.length)
    return (
      <div className="page-width section">
        <EmptyBasket />
      </div>
    );
  // Judge only the lines still in the basket, so removing a problem line clears it at once.
  const reviewed = cart.items.map((line) => review?.items.find((i) => i.slug === line.slug));
  const missing = reviewed.some((item) => item && !item.availableToEnquire);
  const outOfStock = reviewed.some((item) => item?.outOfStock);
  return (
    <div className="page-width cart-page">
      <section className="cart-hero" aria-labelledby="cart-title">
        <Image
          src={cartBanner}
          alt={labels.heroAlt}
          fill
          sizes="100vw"
          preload
        />
        <div>
          <h1 id="cart-title">{labels.title}</h1>
          <p>{labels.subtitle}</p>
          <Leaf size={22} strokeWidth={1.3} aria-hidden="true" />
        </div>
      </section>
      <div className="basket-layout">
        <div>
          <div className="basket-table-head">
            <span>{labels.headProduct}</span>
            <span>{labels.headQuantity}</span>
            <span>{labels.headPrice}</span>
            <span />
          </div>
          <div className="cart-items">
            {cart.items.map((line) => {
              const box = getCartBox(line.slug);
              const product = products.find((p) => p.slug === line.slug);
              const name = lineLabels.name(line.slug, products);
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
                          ? `${t.boxes[box.id].people} · ${lineLabels.schedule(line.slug)}`
                          : pricedLine?.outOfStock
                            ? t.addToCart.outOfStock
                            : product
                              ? (product.price?.packLabel ??
                                pricedLine?.packLabel ??
                                labels.packOnRequest)
                              : labels.unlisted}
                      </p>
                      {box && (
                        <span className="cart-product-note">{labels.perDelivery}</span>
                      )}
                    </div>
                  </div>
                  <div className="quantity-picker">
                    <button
                      type="button"
                      aria-label={fill(labels.reduce, { name })}
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
                      aria-label={fill(labels.increase, { name })}
                      disabled={line.quantity === 99}
                      onClick={() =>
                        cart.setQuantity(line.slug, line.quantity + 1)
                      }
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="basket-price">
                    {review
                      ? money(
                          // The server's unit price times the new quantity, until the check returns.
                          pricedLine?.unitPrice != null
                            ? pricedLine.unitPrice * line.quantity
                            : pricedLine?.lineTotal,
                          review.currency as CurrencyCode,
                        )
                      : "—"}
                  </span>
                  <button
                    type="button"
                    className="cart-remove"
                    onClick={() => cart.remove(line.slug)}
                    aria-label={fill(labels.remove, { name })}
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
              {!locale.domestic
                ? fill(labels.exportDelivery, { country: locale.countryName })
                : cart.items.every((line) => !!getCartBox(line.slug))
                  ? labels.boxDelivery
                  : labels.domesticDelivery}
            </p>
          </div>
          <Link className="text-link cart-continue" href="/products">
            {labels.continue} <ArrowRight size={16} />
          </Link>
        </div>
        <div className="cart-summary-column">
          <BasketSummary review={review} refreshing={refreshing}>
            {loading ? (
              <p role="status">
                <LoaderCircle className="spinner" size={16} />
                {labels.checking}
              </p>
            ) : error ? (
              <div role="alert">
                <p>{error}</p>
                <button className="button button-outline" onClick={retry}>
                  {labels.tryAgain}
                </button>
              </div>
            ) : missing ? (
              <p role="alert">
                {outOfStock ? labels.removeOutOfStock : labels.removeUnlisted}
              </p>
            ) : (
              <Link className="button button-primary" href="/checkout">
                {labels.proceed} <ArrowRight size={17} />
              </Link>
            )}
          </BasketSummary>
          <aside className="cart-editorial" aria-label={labels.editorialLabel}>
            <Image
              src={herbsBanner}
              alt={labels.editorialAlt}
              fill
              sizes="(max-width: 800px) 100vw, 400px"
            />
            <div>
              <h2>
                <Lines text={labels.editorialTitle} />
              </h2>
              <p>
                <Lines text={labels.editorialText} />
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
