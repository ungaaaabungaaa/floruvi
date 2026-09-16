import Link from "@/components/i18n/link";
import Image from "next/image";
import { Clock } from "lucide-react";
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
          <span className="recipe-time">
            <Clock size={14} />
            {fill(minutes, { count: recipe.minutes })}
          </span>
        </div>
      </Link>
    </article>
  );
}
