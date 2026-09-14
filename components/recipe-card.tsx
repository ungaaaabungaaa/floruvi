import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowUpRight } from "lucide-react";
import type { Recipe } from "@/lib/recipes";
export function RecipeCard({ recipe }: { recipe: Recipe }) {
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
          <span className="eyebrow">{recipe.category}</span>
          <h3>{recipe.name}</h3>
          <p>{recipe.description}</p>
          <span className="recipe-time">
            <Clock size={14} />
            {recipe.minutes} minutes <ArrowUpRight size={17} />
          </span>
        </div>
      </Link>
    </article>
  );
}
