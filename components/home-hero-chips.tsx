"use client";
import { useSearchParams } from "next/navigation";
import type { ShopCategory } from "@/lib/storefront";
import type { Messages } from "@/lib/i18n/messages";

/**
 * Filters the product grid below via the same `category` URL param the shop
 * grid reads — the two stay in sync without sharing React state.
 */
export function HomeHeroChips({
  categories,
  labels,
}: {
  categories: ShopCategory[];
  labels: Messages["shop"];
}) {
  const params = useSearchParams();
  const requested = params.get("category") ?? "all";
  const selected = categories.some((c) => c.slug === requested) ? requested : "all";
  function choose(slug: string) {
    const url = new URL(window.location.href);
    if (slug === "all") url.searchParams.delete("category");
    else url.searchParams.set("category", slug);
    window.history.replaceState(null, "", url);
  }
  return (
    <div className="home-hero-chips" role="group" aria-label={labels.filterLabel}>
      {[{ slug: "all", name: labels.allProduce }, ...categories].map((c) => (
        <button
          key={c.slug}
          type="button"
          aria-pressed={selected === c.slug}
          onClick={() => choose(c.slug)}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
