"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import Link from "@/components/i18n/link";
import { getCartBox } from "@/lib/boxes";
import { useCart } from "./cart-store";
import { useI18n } from "./i18n/provider";

/** Floating "View cart" pill (Blinkit style): latest items, item count, one tap to the basket. */
export function CartPill({ thumbnails }: { thumbnails: Record<string, string> }) {
  const { items, count } = useCart();
  const pathname = usePathname();
  const { t, plural } = useI18n();
  // The pill steps aside at the footer, so the page needs no extra space below it.
  const [atFooter, setAtFooter] = useState(false);
  useEffect(() => {
    const footer = document.querySelector(".site-footer");
    if (!footer) return;
    const observer = new IntersectionObserver(([entry]) => setAtFooter(entry.isIntersecting));
    observer.observe(footer);
    return () => observer.disconnect();
  }, [pathname]);
  if (!count || /\/(cart|checkout)$/.test(pathname)) return null;
  const latest = items
    .slice(-3)
    .reverse()
    .map((line) => {
      const box = getCartBox(line.slug);
      return { slug: line.slug, src: thumbnails[box ? `box-${box.id}` : line.slug] };
    })
    .filter((item) => item.src);
  const itemCount = plural(count, t.cartPill.items);
  return (
    <Link
      href="/cart"
      className={atFooter ? "cart-pill is-away" : "cart-pill"}
      aria-hidden={atFooter || undefined}
      tabIndex={atFooter ? -1 : undefined}
    >
      {latest.length > 0 && (
        <span className="cart-pill-thumbs" aria-hidden="true">
          {latest.map((item) => (
            <span key={item.slug}>
              <Image src={item.src} alt="" width={36} height={36} sizes="36px" />
            </span>
          ))}
        </span>
      )}
      <span className="cart-pill-text">
        <strong>{t.cartPill.view}</strong>{" "}
        <small key={count}>{itemCount}</small>
      </span>
      <span className="cart-pill-go" aria-hidden="true">
        <ChevronRight size={18} strokeWidth={2.4} />
      </span>
    </Link>
  );
}
