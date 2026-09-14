"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { recipes } from "@/lib/recipes";
import { RecipeCard } from "./recipe-card";
export function RecipeBrowser() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const filtered = recipes.filter(
    (r) =>
      (category === "All" || r.category === category) &&
      `${r.name} ${r.description} ${r.ingredients.join(" ")}`
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
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search recipes or ingredients…"
        />
      </label>
      <div className="recipe-filters" aria-label="Recipe categories">
        {["All", ...new Set(recipes.map((r) => r.category))].map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <p className="recipe-result-count" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "recipe" : "recipes"}
      </p>
      <div className="recipe-grid">
        {filtered.map((r) => (
          <RecipeCard key={r.slug} recipe={r} />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="empty-state">
          <h2>No recipes found.</h2>
          <p>Try a different ingredient, or clear your filters.</p>
          <button
            className="button button-outline"
            onClick={() => {
              setSearch("");
              setCategory("All");
            }}
          >
            Show all recipes
          </button>
        </div>
      )}
    </div>
  );
}
