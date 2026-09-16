"use client";
import { Fragment, useState } from "react";
import { EditorialBanner } from "./editorial-banner";
import Image from "next/image";
import { Search, X } from "lucide-react";
import type { RecipeSummary } from "@/lib/storefront";
import type { Messages } from "@/lib/i18n/messages";
import { Lines } from "@/components/i18n/lines";
import { useI18n } from "@/components/i18n/provider";
import hero from "@/src/assets/recipes/banners/hero.webp";
import kitchen from "@/src/assets/recipes/banners/kitchen.webp";
import pastaNight from "@/src/assets/recipes/banners/pasta-night.webp";
import slowMornings from "@/src/assets/recipes/banners/slow-mornings.webp";
import colourfulTable from "@/src/assets/recipes/banners/colourful-table.webp";
import freshlyPicked from "@/src/assets/recipes/banners/freshly-picked.webp";
import { RecipeCard } from "./recipe-card";
import { useRecipeOrder } from "./use-recipe-order";

type Labels = Messages["recipes"];
const interludeImages = [pastaNight, slowMornings, colourfulTable, freshlyPicked];
const interludeStyles = ["dark left", "right", "warm left", "right"];
// Alternate two and three rows, using each breakpoint's column count.
function breakPositions(columns: number, count: number) {
  const positions = new Map<number, number>();
  let end = 0,
    group = 0;
  while (end < count) {
    end += columns * (group % 2 === 0 ? 2 : 3);
    if (end < count) positions.set(end, group);
    group++;
  }
  return positions;
}
function RecipeInterlude({
  index,
  screen,
  labels,
}: {
  index: number;
  screen: "wide" | "narrow";
  labels: Labels;
}) {
  const position = index % interludeImages.length;
  const banner = labels.interludes[position];
  return (
    <EditorialBanner
      image={interludeImages[position]}
      alt={banner.alt}
      title={banner.title}
      className={`interlude-${screen} ${interludeStyles[position]}`}
    />
  );
}

export function RecipeBrowser({
  recipes,
  labels,
}: {
  recipes: RecipeSummary[];
  labels: Labels;
}) {
  const { locale, plural } = useI18n();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const terms = search
    .trim()
    .toLocaleLowerCase(locale.tag)
    .split(/\s+/)
    .filter(Boolean);
  const orderedRecipes = useRecipeOrder(recipes);
  const filtered = orderedRecipes.filter(
    (recipe) =>
      (category === "All" || recipe.categoryKey === category) &&
      terms.every((term) =>
        `${recipe.name} ${recipe.description} ${recipe.ingredientSearch}`
          .toLocaleLowerCase(locale.tag)
          .includes(term),
      ),
  );
  const remaining = filtered.slice(4);
  const wideBreaks = breakPositions(4, remaining.length);
  const narrowBreaks = breakPositions(2, remaining.length);
  const reset = () => {
    setSearch("");
    setCategory("All");
  };
  return (
    <div className="recipe-collection page-width">
      <section
        className="recipe-banner recipe-banner-hero"
        aria-labelledby="recipes-heading"
      >
        <Image
          src={hero}
          alt={labels.heroAlt}
          fill
          sizes="100vw"
          preload
          className="recipe-banner-photo"
        />
        <div className="recipe-banner-copy">
          <span className="eyebrow">{labels.eyebrow}</span>
          <h1 id="recipes-heading">
            <Lines text={labels.title} />
          </h1>
          <p>{labels.subtitle}</p>
          <div className="recipe-search">
            <label className="sr-only" htmlFor="recipe-search">
              {labels.searchLabel}
            </label>
            <input
              id="recipe-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={labels.searchPlaceholder}
              aria-controls="recipe-results more-recipes"
            />
            {search ? (
              <button
                type="button"
                aria-label={labels.clearSearch}
                onClick={() => setSearch("")}
              >
                <X size={19} />
              </button>
            ) : (
              <Search size={20} aria-hidden="true" />
            )}
          </div>
        </div>
        <div
          className="recipe-filters"
          role="group"
          aria-label={labels.categoriesLabel}
        >
          {[
            ["All", labels.all],
            ...new Map(
              recipes.map((recipe) => [recipe.categoryKey, recipe.category]),
            ),
          ].map(([key, name]) => (
            <button
              key={key}
              type="button"
              aria-pressed={category === key}
              aria-controls="recipe-results more-recipes"
              onClick={() => setCategory(key)}
            >
              {name}
            </button>
          ))}
        </div>
      </section>
      <p className="sr-only" role="status">
        {plural(filtered.length, labels.found)}
      </p>
      <section
        id="recipe-results"
        className="recipe-first-row"
        aria-label={labels.resultsLabel}
      >
        <div className="recipe-grid">
          {filtered.slice(0, 4).map((recipe) => (
            <RecipeCard
              key={recipe.slug}
              recipe={recipe}
              minutes={labels.cardMinutes}
            />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="empty-state">
            <h2>{labels.noResults}</h2>
            <p>{labels.noResultsText}</p>
            <button className="button button-outline" onClick={reset}>
              {labels.showAll}
            </button>
          </div>
        )}
      </section>
      <section
        className="recipe-banner recipe-banner-kitchen"
        aria-labelledby="kitchen-heading"
      >
        <Image
          src={kitchen}
          alt={labels.kitchenAlt}
          fill
          sizes="100vw"
          className="recipe-banner-photo"
        />
        <div className="recipe-banner-copy">
          <h2 id="kitchen-heading">
            <Lines text={labels.kitchenTitle} />
          </h2>
          <p>{labels.kitchenText}</p>
        </div>
      </section>
      <section
        id="more-recipes"
        className="recipe-more"
        aria-label={labels.moreLabel}
      >
        {filtered.length > 4 && (
          <>
            <h2>{labels.more}</h2>
            <div className="recipe-grid">
              {remaining.map((recipe, index) => (
                <Fragment key={recipe.slug}>
                  <RecipeCard recipe={recipe} minutes={labels.cardMinutes} />
                  {wideBreaks.has(index + 1) && (
                    <RecipeInterlude
                      index={wideBreaks.get(index + 1)!}
                      screen="wide"
                      labels={labels}
                    />
                  )}
                  {narrowBreaks.has(index + 1) && (
                    <RecipeInterlude
                      index={narrowBreaks.get(index + 1)!}
                      screen="narrow"
                      labels={labels}
                    />
                  )}
                </Fragment>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
