"use client";
import { EditorialBanner } from "./editorial-banner";
import Image from "next/image";
import colourfulTable from "@/src/assets/recipes/banners/colourful-table.webp";
import slowMornings from "@/src/assets/recipes/banners/slow-mornings.webp";
import pastaNight from "@/src/assets/recipes/banners/pasta-night.webp";
import shopBanner from "@/src/assets/recipes/banners/freshly-picked.webp";
import { Fragment, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { findProducts, sortProducts } from "@/lib/search";
import type { ShopCategory, ShopProduct } from "@/lib/storefront";
import type { Messages } from "@/lib/i18n/messages";
import { ProductCard } from "@/components/product-card";
import { Lines } from "@/components/i18n/lines";
import { useI18n } from "@/components/i18n/provider";

type Labels = Messages["shop"];
const interludeImages = [colourfulTable, slowMornings, pastaNight];
const interludeStyles = ["warm left", "right", "dark left"];

function ShopInterlude({
  columns,
  index,
  labels,
}: {
  columns: number;
  index: number;
  labels: Labels;
}) {
  const position = index % interludeImages.length;
  const banner = labels.interludes[position];
  return (
    <EditorialBanner
      image={interludeImages[position]}
      alt={banner.alt}
      title={banner.title}
      className={`shop-interlude shop-interlude-${columns} ${interludeStyles[position]}`}
    />
  );
}

type Props = {
  products: ShopProduct[];
  categories: ShopCategory[];
  labels: Labels;
  initialCategory?: string;
};

function Results({ products, categories, labels, initialCategory = "all" }: Props) {
  const { locale, plural } = useI18n();
  const isShop = initialCategory === "all";
  const params = useSearchParams();
  const search = (params.get("q") ?? "").slice(0, 100);
  const selectedCategory = params.get("category") ?? initialCategory;
  const category = categories.some((c) => c.slug === selectedCategory)
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
  const results = sortProducts(found, sort, !!search.trim(), locale.language);
  const filtered = !!search || category !== "all" || sort !== "recommended";
  const searchField = (
    <div className={isShop ? "recipe-search" : "search-field"}>
      <Search size={19} aria-hidden="true" />
      <label htmlFor="produce-search" className="sr-only">
        {labels.searchLabel}
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
        placeholder={labels.searchPlaceholder}
        value={search}
        onChange={(e) => update({ q: e.target.value })}
      />
      {search && (
        <button
          className="icon-button"
          aria-label={labels.clearSearch}
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
      aria-label={labels.filterLabel}
    >
      {[{ slug: "all", name: labels.allProduce }, ...categories].map((c) => (
        <button
          key={c.slug}
          aria-pressed={category === c.slug}
          onClick={() => update({ category: c.slug })}
        >
          {c.name}
          {!isShop && (
            <span>
              {c.slug === "all"
                ? matches.length
                : matches.filter((p) => p.category === c.slug).length}
            </span>
          )}
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
            alt={labels.bannerAlt}
            fill
            sizes="100vw"
            preload
            className="recipe-banner-photo"
          />
          <div className="recipe-banner-copy">
            <span className="eyebrow">{labels.eyebrow}</span>
            <h1 id="shop-heading">
              <Lines text={labels.title} />
            </h1>
            <p>{labels.subtitle}</p>
            {searchField}
          </div>
          {categoryChips}
        </section>
      ) : (
        <div className="catalogue-toolbar">
          {searchField}
          <label className="sort-field">
            <SlidersHorizontal size={16} aria-hidden="true" />
            <span className="sr-only">{labels.sortLabel}</span>
            <select
              value={sort}
              onChange={(e) => update({ sort: e.target.value })}
            >
              <option value="recommended">
                {search.trim() ? labels.bestMatch : labels.featured}
              </option>
              <option value="az">{labels.az}</option>
              <option value="price-asc">{labels.priceAsc}</option>
              <option value="price-desc">{labels.priceDesc}</option>
            </select>
          </label>
        </div>
      )}
      {!isShop && categoryChips}
      {!isShop && filtered && (
        <div className="results-heading">
          {sort.startsWith("price-") && <span>{labels.perPack}</span>}
          {filtered && (
            <button className="text-link" onClick={reset}>
              {labels.clearFilters} <X size={14} />
            </button>
          )}
        </div>
      )}
      {results.length ? (
        <div className="product-grid">
          {results.map((product, index) => (
            <Fragment key={product.slug}>
              <ProductCard product={product} />
              {isShop &&
                index + 1 < results.length &&
                [2, 3, 4].map(
                  (columns) =>
                    (index + 1) % (columns * 3) === 0 && (
                      <ShopInterlude
                        key={columns}
                        columns={columns}
                        index={(index + 1) / (columns * 3) - 1}
                        labels={labels}
                      />
                    ),
                )}
            </Fragment>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Search size={30} />
          <h2>{labels.noResults}</h2>
          <p>
            {matches.length
              ? plural(matches.length, labels.otherCategories)
              : labels.tryName}
          </p>
          {matches.length > 0 && (
            <button
              className="button button-outline"
              onClick={() => update({ category: "all" })}
            >
              {labels.searchAll}
            </button>
          )}
          {!isShop && (
            <button className="text-link" onClick={reset}>
              {labels.clearFilters}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function CatalogueBrowser(props: Props) {
  return (
    <Suspense fallback={<p role="status">{props.labels.loading}</p>}>
      <Results {...props} />
    </Suspense>
  );
}
