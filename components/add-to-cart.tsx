"use client";
import { useState } from "react";
import Link from "@/components/i18n/link";
import { ShoppingBag, Check, Minus, Plus } from "lucide-react";
import { useCart } from "./cart-store";
import { useI18n } from "./i18n/provider";
export function AddToCart({
  slug,
  name,
  compact = false,
}: {
  slug: string;
  name: string;
  compact?: boolean;
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
        aria-live="polite"
        onClick={() => {
          const success = cart.add(slug, quantity);
          setAdded(success);
          setError(success ? "" : t.addToCart.limit);
        }}
      >
        {added ? (
          <Check size={18} aria-hidden="true" />
        ) : (
          <ShoppingBag size={compact ? 16 : 18} aria-hidden="true" />
        )}
        <span>
          {added
            ? t.addToCart.addedShort
            : compact
              ? t.addToCart.compact
              : t.addToCart.addShort}
        </span>
      </button>
      {error && (
        <p className="cart-feedback" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
export function CartLink() {
  const { count } = useCart();
  const { t, plural } = useI18n();
  return (
    <Link
      href="/cart"
      className="cart-link icon-button"
      aria-label={plural(count, t.cartLink)}
    >
      <ShoppingBag size={21} strokeWidth={1.5} />
      <span aria-hidden="true">{count}</span>
    </Link>
  );
}
