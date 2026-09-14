"use client";
import { Suspense, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { usePreloadedQuery, type Preloaded } from "convex/react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { findProducts, sortProducts } from "@/lib/search";
import { ProductCard } from "@/components/product-card";

function Results({
  preloaded,
  initialCategory,
}: {
  preloaded: Preloaded<typeof api.catalogue.browse>;
  initialCategory: string;
}) {
  const { categories, products } = usePreloadedQuery(preloaded);
  const params = useSearchParams();
  const search = (params.get("q") ?? "").slice(0, 100);
  const selectedCategory = params.get("category") ?? initialCategory;
  const category = categories.some((c) => c.slug === selectedCategory)
    ? selectedCategory
    : "all";
  const sort = ["az", "price-asc", "price-desc"].includes(
    params.get("sort") ?? "",
  )
    ? params.get("sort")!
    : "recommended";
  const input = useRef<HTMLInputElement>(null);
  function update(values: Record<string, string | null>) {
    const url = new URL(window.location.href);
    for (const [key, value] of Object.entries(values)) {
      if (value === null || value === "") url.searchParams.delete(key);
      else url.searchParams.set(key, value);
    }
    window.history.replaceState(null, "", url);
  }
  function reset() {
    update({ q: null, category: "all", sort: null, priced: null });
    input.current?.focus();
  }
  const matches = findProducts(products, search);
  const found = matches.filter(
    (p) => category === "all" || p.category === category,
  );
  const results = sortProducts(found, sort, !!search.trim());
  const filtered = !!search || category !== "all" || sort !== "recommended";
  return (
    <div className="catalogue-browser">
      <div className="catalogue-toolbar">
        <div className="search-field">
          <Search size={19} aria-hidden="true" />
          <label htmlFor="produce-search" className="sr-only">
            Search produce
          </label>
          <input
            ref={input}
            id="produce-search"
            name="q"
            maxLength={100}
            autoComplete="off"
            spellCheck={false}
            onKeyDown={(e) => {
              if (e.key === "Escape") update({ q: null });
            }}
            type="search"
            placeholder="Search vegetables & herbs"
            value={search}
            onChange={(e) => update({ q: e.target.value })}
          />
          {search && (
            <button
              className="icon-button"
              aria-label="Clear search"
              onClick={() => {
                update({ q: null });
                input.current?.focus();
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
        <label className="sort-field">
          <SlidersHorizontal size={16} aria-hidden="true" />
          <span className="sr-only">Sort produce</span>
          <select
            value={sort}
            onChange={(e) => update({ sort: e.target.value })}
          >
            <option value="recommended">
              {search.trim() ? "Best match" : "Featured first"}
            </option>
            <option value="az">Name: A to Z</option>
            <option value="price-asc">Pack price: low to high</option>
            <option value="price-desc">Pack price: high to low</option>
          </select>
        </label>
      </div>
      <div
        className="filter-chips"
        role="group"
        aria-label="Filter by category"
      >
        {[{ slug: "all", name: "All produce" }, ...categories].map((c) => (
          <button
            key={c.slug}
            aria-pressed={category === c.slug}
            onClick={() => update({ category: c.slug })}
          >
            {c.name}
            <span>
              {c.slug === "all"
                ? matches.length
                : matches.filter((p) => p.category === c.slug).length}
            </span>
          </button>
        ))}
      </div>
      <div className="results-heading">
        <h2 aria-live="polite">
          {results.length} {results.length === 1 ? "crop" : "crops"} found
        </h2>
        {sort.startsWith("price-") && <span>Per pack. Sizes vary.</span>}
        {filtered && (
          <button className="text-link" onClick={reset}>
            Clear filters <X size={14} />
          </button>
        )}
      </div>
      {results.length ? (
        <div className="product-grid">
          {results.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Search size={30} />
          <h2>No crops found.</h2>
          <p>
            {matches.length
              ? `${matches.length} ${matches.length === 1 ? "match" : "matches"} in other categories.`
              : "Try a crop name, like spinach or palak."}
          </p>
          {matches.length > 0 && (
            <button
              className="button button-outline"
              onClick={() => update({ category: "all" })}
            >
              Search all categories
            </button>
          )}
          <button className="text-link" onClick={reset}>
            Clear filters ↗
          </button>
        </div>
      )}
    </div>
  );
}
export function CatalogueBrowser({
  preloaded,
  initialCategory = "all",
}: {
  preloaded: Preloaded<typeof api.catalogue.browse>;
  initialCategory?: string;
}) {
  const [client] = useState(
    () => new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!),
  );
  return (
    <ConvexProvider client={client}>
      <Suspense fallback={<p role="status">Loading produce…</p>}>
        <Results preloaded={preloaded} initialCategory={initialCategory} />
      </Suspense>
    </ConvexProvider>
  );
}
