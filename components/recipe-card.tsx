import Link from "@/components/i18n/link";
import Image from "next/image";
import { ArrowRight, Clock, Utensils } from "lucide-react";
import type { RecipeSummary } from "@/lib/storefront";
import { fill } from "@/lib/i18n/format";
export function RecipeCard({
  recipe,
  minutes,
}: {
  recipe: RecipeSummary;
  minutes: string;
}) {
  return (
    <article className="recipe-card">
      <Link href={`/recipes/${recipe.slug}`}>
        <div className="recipe-card-image">
          <Image
            src={recipe.image}
            alt={recipe.name}
            fill
            sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 25vw"
          />
        </div>
        <div className="recipe-card-copy">
          <h3>{recipe.name}</h3>
          <p>{recipe.description}</p>
          <div className="recipe-card-footer">
            <div className="recipe-card-facts">
              <span className="recipe-time">
                <Clock size={14} aria-hidden="true" />
                {fill(minutes, { count: recipe.minutes })}
              </span>
              <span className="recipe-servings">
                <Utensils size={14} aria-hidden="true" />
                {recipe.servings}
              </span>
            </div>
            <span className="recipe-card-arrow" aria-hidden="true">
              <ArrowRight size={16} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
