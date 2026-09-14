import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Clock, Users, ArrowRight } from "lucide-react";
import { getRecipe } from "@/lib/recipes";
import { getCatalogue } from "@/lib/catalogue";
import { ProductCard } from "@/components/product-card";
import { siteUrl } from "@/lib/site";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const r = await getRecipe(slug);
  return {
    title: r?.name ?? "Recipe not found",
    description: r?.description,
    alternates: { canonical: `/recipes/${slug}` },
  };
}
export default async function RecipeDetails({ params }: Props) {
  const { slug } = await params;
  const r = await getRecipe(slug);
  if (!r) notFound();
  const { products } = await getCatalogue();
  const crops = products.filter((p) => r.crops.includes(p.slug));
  const schema = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: r.name,
    description: r.description,
    image: `${siteUrl}${r.image.src}`,
    author: { "@type": "Organization", name: "Floruvi" },
    prepTime: `PT${r.prepMinutes}M`,
    cookTime: `PT${r.cookMinutes}M`,
    totalTime: `PT${r.minutes}M`,
    recipeYield: `${r.servings} servings`,
    recipeCategory: r.category,
    recipeIngredient: r.ingredients,
    recipeInstructions: r.steps.map((text) => ({ "@type": "HowToStep", text })),
  };
  return (
    <div className="page-width section">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/recipes">Recipes</Link>
        <span>/</span>
        <span>{r.name}</span>
      </nav>
      <section className="recipe-detail-hero">
        <div>
          <span className="eyebrow">{r.category} · THE FLORUVI KITCHEN</span>
          <h1>{r.name}</h1>
          <p>{r.description}</p>
          <div className="recipe-facts">
            <span>
              <Clock size={18} />
              {r.minutes} minutes
            </span>
            <span>
              <Users size={18} />
              {r.servings} servings
            </span>
          </div>
          <a href="#method" className="text-link">
            Let’s make it <ArrowRight size={17} />
          </a>
        </div>
        <div className="recipe-detail-image">
          <Image
            src={r.image}
            alt={r.name}
            fill
            sizes="(max-width: 800px) 100vw, 55vw"
            preload
          />
        </div>
      </section>
      <p className="box-note">{r.imageCaption}</p>
      <div className="recipe-instructions">
        <aside>
          <span className="eyebrow">WHAT YOU NEED</span>
          <h2>Ingredients</h2>
          <ul>
            {r.ingredients.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
          <p>
            Check ingredient labels for allergens. Wash fresh produce before
            preparation.
          </p>
        </aside>
        <section id="method">
          <span className="eyebrow">STEP BY STEP</span>
          <h2>Let’s make something good.</h2>
          <ol>
            {r.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <div className="kitchen-note">
            <h3>A little kitchen note</h3>
            <p>{r.tip}</p>
          </div>
        </section>
      </div>
      <section className="section">
        <div className="section-heading">
          <h2>Meet the ingredients.</h2>
          <Link href="/recipes" className="text-link">
            More recipes <ArrowRight size={17} />
          </Link>
        </div>
        <div className="product-grid">
          {crops.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
