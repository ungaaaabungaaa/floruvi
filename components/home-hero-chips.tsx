"use client";
import type { ShopCategory } from "@/lib/storefront";
import type { Messages } from "@/lib/i18n/messages";
import { setUrlParams, useUrlParams } from "./use-url-params";

/**
 * Filters the product grid below via the same `category` URL param the shop
 * grid reads — the two stay in sync without sharing React state.
 */
export function HomeHeroChips({
  categories,
  labels,
  query,
}: {
  categories: ShopCategory[];
  labels: Messages["shop"];
  query: string;
}) {
  const params = useUrlParams(query);
  const requested = params.get("category") ?? "all";
  const selected = categories.some((c) => c.slug === requested) ? requested : "all";
  function choose(slug: string) {
    setUrlParams({ category: slug === "all" ? null : slug });
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
