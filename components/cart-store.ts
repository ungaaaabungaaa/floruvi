"use client";
import { useSyncExternalStore } from "react";
import {
  normalizeCart,
  updateCart,
  type CartLine,
  MAX_CART_LINES,
  MAX_QUANTITY,
} from "@/lib/cart";
const KEY = "floruvi.basket.v1";
const EVENT = "floruvi:basket";
const EMPTY: CartLine[] = [];
let cachedRaw: string | null | undefined;
let cachedItems: CartLine[] = EMPTY;
let storageUnavailable = false;
function getSnapshot() {
  if (storageUnavailable) return cachedItems;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      try {
        cachedItems = normalizeCart(raw ? JSON.parse(raw) : []);
      } catch {
        cachedItems = [];
      }
    }
  } catch {
    /* Keep an in-memory basket when browser storage is unavailable. */
  }
  return cachedItems;
}
function subscribe(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(EVENT, listener);
  };
}
function save(items: CartLine[]) {
  cachedItems = normalizeCart(items);
  try {
    localStorage.setItem(KEY, JSON.stringify(cachedItems));
    cachedRaw = localStorage.getItem(KEY);
  } catch {
    storageUnavailable = true;
  }
  window.dispatchEvent(new Event(EVENT));
}
export function useCart() {
  const items = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
  return {
    items,
    count: items.reduce((sum, line) => sum + line.quantity, 0),
    add(slug: string, quantity = 1) {
      const current = getSnapshot();
      const nextQuantity =
        (current.find((i) => i.slug === slug)?.quantity ?? 0) + quantity;
      if (
        nextQuantity > MAX_QUANTITY ||
        (current.length >= MAX_CART_LINES &&
          !current.some((i) => i.slug === slug))
      )
        return false;
      save(updateCart(current, slug, nextQuantity));
      return true;
    },
    setQuantity(slug: string, quantity: number) {
      save(updateCart(getSnapshot(), slug, quantity));
    },
    remove(slug: string) {
      save(getSnapshot().filter((i) => i.slug !== slug));
    },
    clear() {
      save([]);
    },
  };
}
