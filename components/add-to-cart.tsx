"use client";
import { useState } from "react";
import Link from "@/components/i18n/link";
import { ShoppingBag, Check, Minus, Plus, ChevronRight } from "lucide-react";
import { useCart } from "./cart-store";
import { useI18n } from "./i18n/provider";
export function AddToCart({
  slug,
  name,
  compact = false,
  available = true,
}: {
  slug: string;
  name: string;
  compact?: boolean;
  /** False when the owner marks the product out of stock. */
  available?: boolean;
}) {
  const cart = useCart();
  const { t, fill } = useI18n();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");
  function changeQuantity(next: number) {
    setQuantity(next);
    setAdded(false);
    setError("");
  }
  if (!available)
    return (
      <div className={compact ? "add-crop compact" : "add-crop"}>
        <span className="stock-out">{t.addToCart.outOfStock}</span>
      </div>
    );
  return (
    <div className={compact ? "add-crop compact" : "add-crop"}>
      {!compact && (
        <div className="quantity-picker">
          <button
            type="button"
            aria-label={fill(t.addToCart.reduce, { name })}
            onClick={() => changeQuantity(Math.max(1, quantity - 1))}
            disabled={quantity === 1}
          >
            <Minus size={15} />
          </button>
          <output aria-label={t.addToCart.selectedQuantity}>{quantity}</output>
          <button
            type="button"
            aria-label={fill(t.addToCart.increase, { name })}
            onClick={() => changeQuantity(Math.min(99, quantity + 1))}
            disabled={quantity === 99}
          >
            <Plus size={15} />
          </button>
        </div>
      )}
      <button
        className={`button ${compact ? "button-outline" : "button-primary"}`}
        type="button"
        aria-label={fill(added ? t.addToCart.added : t.addToCart.add, { name })}
        onClick={() => {
          const success = cart.add(slug, quantity);
          setAdded(success);
          setError(success ? "" : t.addToCart.limit);
        }}
      >
        {added ? (
          <Check size={18} aria-hidden="true" />
        ) : compact ? (
          <Plus size={18} aria-hidden="true" />
        ) : (
          <ShoppingBag size={18} aria-hidden="true" />
        )}
        {!compact && (
          <span>{added ? t.addToCart.addedShort : t.addToCart.addShort}</span>
        )}
      </button>
      {/* Screen readers announce a status region's text, not a changed button label. */}
      <span className="sr-only" role="status">
        {added ? fill(t.addToCart.added, { name }) : ""}
      </span>
      {error && (
        <p className="cart-feedback" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
export function CartLink({ inNavigation = false, onNavigate }: { inNavigation?: boolean; onNavigate?: () => void }) {
  const { count } = useCart();
  const { t, plural } = useI18n();
  return (
    <Link
      href="/cart"
      className={inNavigation ? "navigation-cart" : "cart-link icon-button"}
      onClick={onNavigate}
      aria-label={plural(count, t.cartLink)}
    >
      {inNavigation ? (
        <>
          <span>{t.cartPill.view}</span>
          <span className="navigation-link-end" aria-hidden="true">
            <span className="navigation-count">{count}</span>
            <ChevronRight size={20} />
          </span>
        </>
      ) : (
        <>
          <ShoppingBag size={21} strokeWidth={1.5} />
          <span aria-hidden="true">{count}</span>
        </>
      )}
    </Link>
  );
}
