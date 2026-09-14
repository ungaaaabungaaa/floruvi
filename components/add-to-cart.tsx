"use client";
import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Check, Minus, Plus } from "lucide-react";
import { useCart } from "./cart-store";
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
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  return (
    <div className={compact ? "add-crop compact" : "add-crop"}>
      {!compact && (
        <div className="quantity-picker">
          <button
            type="button"
            aria-label={`Reduce ${name} quantity`}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity === 1}
          >
            <Minus size={15} />
          </button>
          <output aria-label="Selected quantity">{quantity}</output>
          <button
            type="button"
            aria-label={`Increase ${name} quantity`}
            onClick={() => setQuantity((q) => Math.min(99, q + 1))}
            disabled={quantity === 99}
          >
            <Plus size={15} />
          </button>
        </div>
      )}
      <button
        className={`button ${compact ? "button-outline" : "button-primary"}`}
        type="button"
        aria-label={`Add ${name} to basket`}
        onClick={() =>
          setMessage(
            cart.add(slug, quantity)
              ? "Added to your basket."
              : "Basket limit: 20 crops, up to 99 units each.",
          )
        }
      >
        <ShoppingBag size={16} />
        {compact ? "Add to basket" : "Add to Basket"}
      </button>
      {message && (
        <div className="cart-feedback" role="status">
          <Check size={13} />
          {message} <Link href="/cart">View basket →</Link>
        </div>
      )}
      {!compact && (
        <p className="purchase-note">
          Delivery across India.
        </p>
      )}
    </div>
  );
}
export function CartLink() {
  const { count } = useCart();
  return (
    <Link
      href="/cart"
      className="cart-link icon-button"
      aria-label={`Basket, ${count} items`}
    >
      <ShoppingBag size={21} strokeWidth={1.5} />
      <span aria-hidden="true">{count}</span>
    </Link>
  );
}
