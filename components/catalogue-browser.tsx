"use client";
import { storefrontCopy } from "@/lib/storefront-copy";
import Image from "next/image";
import colourfulTable from "@/src/assets/recipes/banners/colourful-table.webp";
import slowMornings from "@/src/assets/recipes/banners/slow-mornings.webp";
import pastaNight from "@/src/assets/recipes/banners/pasta-night.webp";
import shopBanner from "@/src/assets/recipes/banners/freshly-picked.webp";
import { Fragment, Suspense, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { usePreloadedQuery, type Preloaded } from "convex/react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { findProducts, sortProducts } from "@/lib/search";
import { ProductCard } from "@/components/product-card";

const shopInterludes = [
  { image: colourfulTable, title: "Bring colour to the table.", alt: "Roasted carrots, beetroot & chickpeas on a platter", style: "warm left" },
  { image: slowMornings, title: "Fresh starts. Slow mornings.", alt: "Avocado toast & a green smoothie in morning light", style: "right" },
  { image: pastaNight, title: "Good ingredients. Great evenings.", alt: "Basil pasta & cherry tomatoes on a green table", style: "dark left" },
];

function ShopInterlude({ columns, index }: { columns: number; index: number }) {
  const banner = shopInterludes[index % shopInterludes.length];
  return (
    <aside className={`recipe-banner recipe-interlude shop-interlude shop-interlude-${columns} ${banner.style}`} aria-label={banner.title}>
      <Image src={banner.image} alt={banner.alt} fill sizes="100vw" className="recipe-banner-photo" />
      <div className="recipe-banner-copy"><h2>{banner.title}</h2></div>
    </aside>
  );
}

function Results({
  preloaded,
  initialCategory,
}: {
  preloaded: Preloaded<typeof api.catalogue.browse>;
  initialCategory: string;
}) {
  const { categories, products } = storefrontCopy(usePreloadedQuery(preloaded));
  const isShop = initialCategory === "all";
  const params = useSearchParams();
  const search = (params.get("q") ?? "").slice(0, 100);
  const selectedCategory = params.get("category") ?? initialCategory;
  const category =
    categories.some((c) => c.slug === selectedCategory)
      ? selectedCategory
      : "all";
  const sort =
    !isShop &&
    ["az", "price-asc", "price-desc"].includes(params.get("sort") ?? "")
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
  const searchField = (
    <div className={isShop ? "recipe-search" : "search-field"}>
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
  );
  const categoryChips = (

        <div
          className={isShop ? "recipe-filters" : "filter-chips"}
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
              {!isShop && <span>
                {c.slug === "all"
                  ? matches.length
                  : matches.filter((p) => p.category === c.slug).length}
              </span>}
            </button>
          ))}
        </div>
  );
  return (
    <div className="catalogue-browser">
      {isShop ? (
        <section
          className="recipe-banner recipe-banner-hero shop-banner"
          aria-labelledby="shop-heading"
        >
          <Image
            src={shopBanner}
            alt="A basket of freshly picked vegetables"
            fill
            sizes="100vw"
            preload
            className="recipe-banner-photo"
          />
          <div className="recipe-banner-copy">
            <span className="eyebrow">FRESH FROM FLORUVI</span>
            <h1 id="shop-heading">
              Fresh picks.
              <br />
              For your table.
            </h1>
            <p>Vegetables, herbs & microgreens.</p>
            {searchField}
          </div>
          {categoryChips}
        </section>
      ) : (
        <div className="catalogue-toolbar">
          {searchField}
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
      )}
      {!isShop && categoryChips}
      {!isShop && filtered && <div className="results-heading">
        {sort.startsWith("price-") && <span>Per pack. Sizes vary.</span>}
        {filtered && (
          <button className="text-link" onClick={reset}>
            Clear filters <X size={14} />
          </button>
        )}
      </div>}
      {results.length ? (
        <div className="product-grid">
          {results.map((product, index) => (
            <Fragment key={product.slug}>
              <ProductCard product={product} />
              {isShop && index + 1 < results.length && [2, 3, 4].map((columns) => (
                (index + 1) % (columns * 3) === 0 && (
                  <ShopInterlude key={columns} columns={columns} index={(index + 1) / (columns * 3) - 1} />
                )
              ))}
            </Fragment>
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
          {!isShop && <button className="text-link" onClick={reset}>
            Clear filters
          </button>}
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
