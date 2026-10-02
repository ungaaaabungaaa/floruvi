import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "@/components/i18n/link";
import { Clock, Users, ArrowRight } from "lucide-react";
import { getRecipe, getShop } from "@/lib/storefront";
import { getI18n } from "@/lib/i18n/server";
import { localizePath } from "@/lib/i18n/config";
import { fill, plural } from "@/lib/i18n/format";
import { siteUrl } from "@/lib/site";
import { absoluteUrl, fitDescription, jsonLd, pageMetadata, shareImage } from "@/lib/seo";
import { breadcrumbList } from "@/lib/structured-data";
import { ProductCard } from "@/components/product-card";

type Props = PageProps<"/[locale]/recipes/[slug]">;

// Each page renders on its first visit, then is served from the cache (ISR).
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [{ locale, messages }, r, { products }] = await Promise.all([
    getI18n(),
    getRecipe(slug),
    getShop(),
  ]);
  if (!r) return { title: messages.meta.recipeNotFound, robots: { index: false } };
  const t = messages.recipes;
  const crops = products.filter((p) => r.crops.includes(p.slug)).map((p) => p.name);
  // Many recipes share an intro, so the name, time, servings & crops keep each description unique.
  const facts = [
    plural(locale.tag, r.minutes, t.minutes),
    plural(locale.tag, r.servings, t.servings),
    ...(crops.length ? [crops.join(", ")] : []),
  ];
  return pageMetadata({
    path: `/recipes/${slug}`,
    title: fill(messages.meta.recipeTitle, { name: r.name }),
    description: fitDescription(
      (intro) => `${r.name} — ${intro} ${facts.join(" · ")}`,
      r.description,
    ),
    image: { ...shareImage(r.image), alt: r.name },
    type: "article",
  });
}

export default async function RecipeDetails({ params }: Props) {
  const { slug } = await params;
  const [{ locale, messages }, r, { products }] = await Promise.all([
    getI18n(),
    getRecipe(slug),
    getShop(),
  ]);
  if (!r) notFound();
  const t = messages.recipes;
  const crops = products.filter((p) => r.crops.includes(p.slug));
  const url = absoluteUrl(localizePath(locale.locale, `/recipes/${r.slug}`));
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Recipe",
        name: r.name,
        description: r.description,
        url,
        inLanguage: locale.tag,
        image: absoluteUrl(shareImage(r.image).url),
        author: {
          "@type": "Organization",
          "@id": `${siteUrl}/#organization`,
          name: messages.meta.siteName,
        },
        ...(crops.length ? { keywords: crops.map((crop) => crop.name).join(", ") } : {}),
        prepTime: `PT${r.prepMinutes}M`,
        cookTime: `PT${r.cookMinutes}M`,
        totalTime: `PT${r.minutes}M`,
        recipeYield: plural(locale.tag, r.servings, t.servings),
        recipeCategory: r.category,
        recipeIngredient: r.ingredients,
        recipeInstructions: r.steps.map((text) => ({ "@type": "HowToStep", text })),
      },
      breadcrumbList([
        { name: messages.product.breadcrumbHome, url: absoluteUrl(localizePath(locale.locale, "/")) },
        { name: t.breadcrumbRecipes, url: absoluteUrl(localizePath(locale.locale, "/recipes")) },
        { name: r.name, url },
      ]),
    ],
  };
  return (
    <div className="page-width section">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} />
      <nav className="breadcrumb" aria-label={t.breadcrumb}>
        <Link href="/">{messages.product.breadcrumbHome}</Link>
        <span>/</span>
        <Link href="/recipes">{t.breadcrumbRecipes}</Link>
        <span>/</span>
        <span>{r.name}</span>
      </nav>
      <section className="recipe-detail-hero">
        <div>
          <span className="eyebrow">
            {r.category} · {t.kitchen}
          </span>
          <h1>{r.name}</h1>
          <p>{r.description}</p>
          <div className="recipe-facts">
            <span>
              <Clock size={18} />
              {plural(locale.tag, r.minutes, t.minutes)}
            </span>
            <span>
              <Users size={18} />
              {plural(locale.tag, r.servings, t.servings)}
            </span>
          </div>
          <a href="#method" className="text-link">
            {t.letsMake} <ArrowRight size={17} />
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
      <div className="recipe-instructions">
        <aside>
          <span className="eyebrow">{t.whatYouNeed}</span>
          <h2>{t.ingredients}</h2>
          <ul>
            {r.ingredients.map((i, index) => (
              <li key={index}>{i}</li>
            ))}
          </ul>
          <p>{t.allergens}</p>
        </aside>
        <section id="method">
          <span className="eyebrow">{t.stepByStep}</span>
          <h2>{t.makeSomething}</h2>
          <ol>
            {r.steps.map((s, index) => (
              <li key={index}>{s}</li>
            ))}
          </ol>
          <div className="kitchen-note">
            <h3>{t.kitchenNote}</h3>
            <p>{r.tip}</p>
          </div>
        </section>
      </div>
      <section className="section">
        <div className="section-heading">
          <h2>{t.meetIngredients}</h2>
          <Link href="/recipes" className="text-link">
            {t.moreRecipes} <ArrowRight size={17} />
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
