"use client";
import { useSyncExternalStore } from "react";
import Link from "@/components/i18n/link";
import { Heart } from "lucide-react";
import { useI18n } from "./i18n/provider";
const KEY = "floruvi.wishlist.v1",
  EVENT = "floruvi:wishlist";
type Saved = { slug: string; name: string };
const EMPTY: Saved[] = [];
let raw: string | null | undefined,
  items: Saved[] = EMPTY,
  unavailable = false;
function snapshot() {
  if (unavailable) return items;
  try {
    const next = localStorage.getItem(KEY);
    if (next !== raw) {
      raw = next;
      try {
        const value = JSON.parse(next ?? "[]");
        items = Array.isArray(value)
          ? value
              .filter(
                (v): v is Saved =>
                  v &&
                  typeof v.slug === "string" &&
                  /^[a-z0-9-]+$/.test(v.slug) &&
                  typeof v.name === "string",
              )
              .filter((v, i, a) => a.findIndex((x) => x.slug === v.slug) === i)
              .slice(0, 200)
          : EMPTY;
      } catch {
        items = EMPTY;
      }
    }
  } catch {
    /* Keep the in-memory list if storage is blocked. */
  }
  return items;
}
function subscribe(notify: () => void) {
  const storage = (e: StorageEvent) => {
    if (e.key === KEY || e.key === null) notify();
  };
  window.addEventListener("storage", storage);
  window.addEventListener(EVENT, notify);
  return () => {
    window.removeEventListener("storage", storage);
    window.removeEventListener(EVENT, notify);
  };
}
function toggle(product: Saved) {
  const current = snapshot();
  items = current.some((p) => p.slug === product.slug)
    ? current.filter((p) => p.slug !== product.slug)
    : [...current, product].slice(-200);
  try {
    raw = JSON.stringify(items);
    localStorage.setItem(KEY, raw);
  } catch {
    unavailable = true;
  }
  window.dispatchEvent(new Event(EVENT));
}
export function useWishlist() {
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY);
}
export function WishlistButton({ slug, name }: { slug: string; name: string }) {
  const saved = useWishlist().some((p) => p.slug === slug);
  const { t, fill } = useI18n();
  return (
    <button
      type="button"
      className="wishlist-heart"
      aria-label={fill(saved ? t.wishlist.remove : t.wishlist.save, { name })}
      aria-pressed={saved}
      onClick={() => toggle({ slug, name })}
    >
      <Heart fill={saved ? "currentColor" : "none"} strokeWidth={1.6} />
    </button>
  );
}
export function WishlistMenu({
  inNavigation = false,
  onNavigate,
}: {
  inNavigation?: boolean;
  onNavigate?: () => void;
}) {
  const saved = useWishlist();
  const { t, plural } = useI18n();
  return (
    <Link
      href="/wishlist"
      onClick={onNavigate}
      className={
        inNavigation ? "navigation-wishlist" : "icon-button wishlist-link"
      }
      aria-label={plural(saved.length, t.wishlist.menu)}
    >
      {inNavigation ? (
        <>
          <span>{t.wishlist.title}</span>
          <span className="navigation-wishlist-count">
            {saved.length}
            <Heart size={20} />
          </span>
        </>
      ) : (
        <>
          <Heart size={21} />
          <span aria-hidden="true">{saved.length}</span>
        </>
      )}
    </Link>
  );
}
