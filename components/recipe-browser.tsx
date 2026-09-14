"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import type { Recipe } from "@/lib/recipes";
import { RecipeCard } from "./recipe-card";
export function RecipeBrowser({ recipes }: { recipes: Recipe[] }) {
  const [visible, setVisible] = useState(12);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const filtered = recipes.filter(
    (r) =>
      (category === "All" || r.category === category) &&
      `${r.name} ${r.description} ${r.ingredientSearch}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  return (
    <div className="recipe-browser">
      <label className="recipe-search">
        <Search size={17} />
        <span className="sr-only">Search recipes</span>
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setVisible(12);
          }}
          placeholder="Search recipes or ingredients…"
        />
      </label>
      <div className="recipe-filters" aria-label="Recipe categories">
        {["All", ...new Set(recipes.map((r) => r.category))].map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={category === c}
            onClick={() => {
              setCategory(c);
              setVisible(12);
            }}
          >
            {c}
          </button>
        ))}
      </div>
      <p className="recipe-result-count" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "recipe" : "recipes"}
      </p>
      <div className="recipe-grid">
        {filtered.slice(0, visible).map((r) => (
          <RecipeCard key={r.slug} recipe={r} />
        ))}
      </div>
      {visible < filtered.length && (
        <button
          type="button"
          className="button button-outline"
          onClick={() => setVisible((n) => n + 12)}
        >
          Show more recipes
        </button>
      )}
      {filtered.length === 0 && (
        <div className="empty-state">
          <h2>No recipes found.</h2>
          <p>Try a different ingredient, or clear your filters.</p>
          <button
            className="button button-outline"
            onClick={() => {
              setSearch("");
              setCategory("All");
              setVisible(12);
            }}
          >
            Show all recipes
          </button>
        </div>
      )}
    </div>
  );
}
