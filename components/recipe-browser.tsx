"use client";
import { Fragment, useState } from "react";
import Image from "next/image";
import { Search, ArrowRight, X } from "lucide-react";
import type { Recipe } from "@/lib/recipes";
import hero from "@/src/assets/recipes/banners/hero.webp";
import kitchen from "@/src/assets/recipes/banners/kitchen.webp";
import pastaNight from "@/src/assets/recipes/banners/pasta-night.webp";
import slowMornings from "@/src/assets/recipes/banners/slow-mornings.webp";
import colourfulTable from "@/src/assets/recipes/banners/colourful-table.webp";
import freshlyPicked from "@/src/assets/recipes/banners/freshly-picked.webp";
import { RecipeCard } from "./recipe-card";
import { useRecipeOrder } from "./use-recipe-order";

const interludes = [
  {
    image: pastaNight,
    title: "A little pasta. A lovely evening.",
    alt: "Basil pasta and cherry tomatoes on a forest-green table",
    style: "dark left",
  },
  {
    image: slowMornings,
    title: "Make time for breakfast.",
    alt: "Avocado toast and a green smoothie in morning light",
    style: "right",
  },
  {
    image: colourfulTable,
    title: "Bring colour to the table.",
    alt: "Roasted carrots, beetroot and chickpeas on a platter",
    style: "warm left",
  },
  {
    image: freshlyPicked,
    title: "Start with something fresh.",
    alt: "Hands holding a basket of fresh vegetables",
    style: "right",
  },
];
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
}: {
  index: number;
  screen: "wide" | "narrow";
}) {
  const banner = interludes[index % interludes.length];
  return (
    <aside
      className={`recipe-banner recipe-interlude interlude-${screen} ${banner.style}`}
      aria-label={banner.title}
    >
      <Image
        src={banner.image}
        alt={banner.alt}
        fill
        sizes="100vw"
        className="recipe-banner-photo"
      />
      <div className="recipe-banner-copy">
        <h2>{banner.title}</h2>
      </div>
    </aside>
  );
}

export function RecipeBrowser({ recipes }: { recipes: Recipe[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const terms = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const orderedRecipes = useRecipeOrder(recipes);
  const filtered = orderedRecipes.filter(
    (recipe) =>
      (category === "All" || recipe.category === category) &&
      terms.every((term) =>
        `${recipe.name} ${recipe.description} ${recipe.ingredientSearch}`
          .toLowerCase()
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
          alt="A bowl of fresh greens, tomatoes and radishes"
          fill
          sizes="100vw"
          preload
          className="recipe-banner-photo"
        />
        <div className="recipe-banner-copy">
          <span className="eyebrow">RECIPES</span>
          <h1 id="recipes-heading">
            Simple Meals
            <br />A Healthier You
          </h1>
          <p>Fresh ideas to make vegetables part of your everyday life.</p>
          <div className="recipe-search">
            <label className="sr-only" htmlFor="recipe-search">
              Search recipes
            </label>
            <input
              id="recipe-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search recipes…"
              aria-controls="recipe-results more-recipes"
            />
            {search ? (
              <button
                type="button"
                aria-label="Clear search"
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
          aria-label="Recipe categories"
        >
          {["All", ...new Set(recipes.map((recipe) => recipe.category))].map(
            (name) => (
              <button
                key={name}
                type="button"
                aria-pressed={category === name}
                aria-controls="recipe-results more-recipes"
                onClick={() => setCategory(name)}
              >
                {name}
              </button>
            ),
          )}
        </div>
      </section>
      <p className="sr-only" role="status">
        {filtered.length} {filtered.length === 1 ? "recipe" : "recipes"} found
      </p>
      <section
        id="recipe-results"
        className="recipe-first-row"
        aria-label="Recipe results"
      >
        <div className="recipe-grid">
          {filtered.slice(0, 4).map((recipe) => (
            <RecipeCard key={recipe.slug} recipe={recipe} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="empty-state">
            <h2>No recipes found.</h2>
            <p>Try another ingredient or clear your filters.</p>
            <button className="button button-outline" onClick={reset}>
              Show all recipes
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
          alt="Hands tossing a fresh vegetable salad with wooden spoons"
          fill
          sizes="100vw"
          className="recipe-banner-photo"
        />
        <div className="recipe-banner-copy">
          <h2 id="kitchen-heading">
            Good Ingredients
            <br />
            Happier Days
          </h2>
          <p>Real food. Real simple.</p>
          {filtered.length > 4 && (
            <a href="#more-recipes" className="button button-primary">
              Explore more recipes <ArrowRight size={18} />
            </a>
          )}
        </div>
      </section>
      <section
        id="more-recipes"
        className="recipe-more"
        aria-label="More recipe results"
      >
        {filtered.length > 4 && (
          <>
            <h2>More recipes</h2>
            <div className="recipe-grid">
              {remaining.map((recipe, index) => (
                <Fragment key={recipe.slug}>
                  <RecipeCard recipe={recipe} />
                  {wideBreaks.has(index + 1) && (
                    <RecipeInterlude
                      index={wideBreaks.get(index + 1)!}
                      screen="wide"
                    />
                  )}
                  {narrowBreaks.has(index + 1) && (
                    <RecipeInterlude
                      index={narrowBreaks.get(index + 1)!}
                      screen="narrow"
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
