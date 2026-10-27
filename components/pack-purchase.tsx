"use client";
import { useId, useState } from "react";
import { Minus, Plus, Check, ArrowRight } from "lucide-react";
import { useCart } from "./cart-store";
import { useI18n } from "./i18n/provider";
import { packPackaging, type packOptions } from "@/lib/product-packs";
import styles from "./pantry-purchase.module.css";
import { usePackSelection } from "./pack-selection";

export function PackPurchase({
  slug,
  name,
  options,
  available,
}: {
  slug: string;
  name: string;
  options: NonNullable<ReturnType<typeof packOptions>>;
  available: boolean;
}) {
  const cart = useCart();
  const { money } = useI18n();
  const id = useId();
  const selection = usePackSelection();
  const selected = selection?.size ?? options[0].size;
  const [message, setMessage] = useState("");
  const [addedSize, setAddedSize] = useState<number>();
  const index = Math.max(
    0,
    options.findIndex((option) => option.size === selected),
  );
  const choice = options[index];
  const existing = cart.items.some((item) => item.slug === slug);
  const added = addedSize === selected;
  function change(next: number) {
    selection?.setSize(options[next].size);
    setAddedSize(undefined);
    setMessage("");
  }
  return (
    <div className={styles.preview}>
      <div className={styles.priceLine} aria-live="polite">
        <strong>{money(choice.amountMinor, "INR")}</strong>
        <span>/ {choice.label}</span>
      </div>
      <p className={styles.tax}>
        Price before GST and delivery. Final amount confirmed with your quote.
      </p>
      <div className={styles.orderHeading}>
        <span id={id}>{slug === "farm-eggs" ? "Quantity" : "Volume"}</span>
        <span>{packPackaging(slug)}</span>
      </div>
      <div className={styles.controls}>
        <div className={styles.stepper} role="group" aria-labelledby={id}>
          <button
            type="button"
            aria-label={`Decrease ${slug === "farm-eggs" ? "egg quantity" : "honey volume"}`}
            disabled={index === 0}
            onClick={() => change(index - 1)}
          >
            <Minus size={16} />
          </button>
          <output aria-label="Selected pack" aria-live="polite">
            {choice.label}
          </output>
          <button
            type="button"
            aria-label={`Increase ${slug === "farm-eggs" ? "egg quantity" : "honey volume"}`}
            disabled={index === options.length - 1}
            onClick={() => change(index + 1)}
          >
            <Plus size={16} />
          </button>
        </div>
        <button
          type="button"
          className={styles.add}
          disabled={!available}
          onClick={() => {
            const ok = cart.setPackSize(slug, choice.size);
            setAddedSize(ok ? choice.size : undefined);
            setMessage(
              ok
                ? `${choice.label} ${name.toLowerCase()} in your basket.`
                : "Your basket is full. Remove a product and try again.",
            );
          }}
        >
          <span>
            {!available
              ? "Unavailable"
              : added
                ? "Added to basket"
                : existing
                  ? "Update basket"
                  : "Add to basket"}
          </span>
          {added ? <Check size={18} /> : <ArrowRight size={18} />}
        </button>
      </div>
      <p className={styles.packaging}>
        {slug === "farm-eggs"
          ? "1 dozen = 12 eggs. Choose up to 4 dozen (48 eggs)."
          : "Choose a 100 ml, 250 ml or 500 ml glass jar."}
      </p>
      <p className={styles.confirmation} role="status">
        {message}
      </p>
    </div>
  );
}
