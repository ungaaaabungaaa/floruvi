"use client";
import { useState } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { usePreloadedQuery, type Preloaded } from "convex/react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { findProducts } from "@/lib/search";
import { ProductCard } from "@/components/product-card";

function Results({
  preloaded,
  initialCategory,
}: {
  preloaded: Preloaded<typeof api.catalogue.browse>;
  initialCategory: string;
}) {
  const { categories, products } = usePreloadedQuery(preloaded);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState("featured");
  const found = findProducts(products, search, category);
  const results = [...found].sort(
    sort === "az"
      ? (a, b) => a.name.localeCompare(b.name)
      : (a, b) => Number(b.featured) - Number(a.featured),
  );
  return (
    <div>
      <div className="catalogue-toolbar">
        <div className="search-field">
          <Search size={19} />
          <label htmlFor="produce-search" className="sr-only">
            Search produce
          </label>
          <input
            id="produce-search"
            type="search"
            placeholder="Find a leaf, herb, or something new…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="icon-button"
              aria-label="Clear search"
              onClick={() => setSearch("")}
            >
              <X size={16} />
            </button>
          )}
        </div>
        <label className="sort-field">
          <SlidersHorizontal size={16} />
          <span className="sr-only">Sort produce</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="featured">Featured first</option>
            <option value="az">Name: A to Z</option>
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
            onClick={() => setCategory(c.slug)}
          >
            {c.name}
            <span>
              {c.slug === "all"
                ? products.length
                : products.filter((p) => p.category === c.slug).length}
            </span>
          </button>
        ))}
      </div>
      <div className="results-heading">
        <h2 aria-live="polite">
          {results.length} {results.length === 1 ? "crop" : "crops"} to discover
        </h2>
        <span>Good things, at your pace.</span>
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
          <p>Try a different name or explore all categories.</p>
          <button
            className="text-link"
            onClick={() => {
              setSearch("");
              setCategory("all");
            }}
          >
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
      <Results preloaded={preloaded} initialCategory={initialCategory} />
    </ConvexProvider>
  );
}
