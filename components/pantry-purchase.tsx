"use client";

import { useState } from "react";
import { Minus, Plus, Check, ArrowRight } from "lucide-react";
import { useCart } from "./cart-store";
import { useI18n } from "./i18n/provider";
import {
  formatWeight,
  nextWeight,
  packagingFor,
  weightPrice,
  MAX_WEIGHT_GRAMS,
  type WeightPricing,
} from "@/lib/pantry-weights";
import styles from "./pantry-purchase.module.css";

export function PantryPurchase({
  slug,
  name,
  pricing,
  available,
}: {
  slug: string;
  name: string;
  pricing: WeightPricing;
  available: boolean;
}) {
  const cart = useCart();
  const { money, t } = useI18n();
  const [grams, setGrams] = useState(250);
  const [message, setMessage] = useState("");
  const [added, setAdded] = useState(false);
  const price = weightPrice(pricing, grams);
  const existing = cart.items.some((item) => item.slug === slug);
  function changeWeight(direction: 1 | -1) {
    setGrams(nextWeight(grams, direction));
    setAdded(false);
    setMessage("");
  }
  return (
    <div className={styles.preview}>
      <div className={styles.priceLine} aria-live="polite">
        <strong>{money(price, "INR")}</strong>
      </div>
      <p className={styles.tax}>Inclusive of GST and taxes</p>
      <div className={styles.orderHeading}>
        <span id="weight-label">Weight</span>
        <span aria-live="polite">{packagingFor(grams)}</span>
      </div>
      <div className={styles.controls}>
        <div
          className={styles.stepper}
          role="group"
          aria-labelledby="weight-label"
        >
          <button
            type="button"
            aria-label="Decrease weight"
            disabled={grams === 250}
            onClick={() => changeWeight(-1)}
          >
            <Minus size={16} />
          </button>
          <output aria-label="Selected weight" aria-live="polite">
            {formatWeight(grams)}
          </output>
          <button
            type="button"
            aria-label="Increase weight"
            disabled={grams === MAX_WEIGHT_GRAMS}
            onClick={() => changeWeight(1)}
          >
            <Plus size={16} />
          </button>
        </div>
        <button
          type="button"
          className={styles.add}
          disabled={!available || price === null}
          onClick={() => {
            const ok = cart.setWeight(slug, grams);
            setAdded(ok);
            setMessage(
              ok
                ? `${formatWeight(grams)} ${name.toLowerCase()} in your basket.`
                : t.addToCart.limit,
            );
          }}
        >
          <span>
            {!available
              ? t.addToCart.outOfStock
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
        250 g &amp; 500 g in glass jars. Larger weights in bulk.
      </p>
      <p className={styles.confirmation} role="status">
        {message}
      </p>
    </div>
  );
}
