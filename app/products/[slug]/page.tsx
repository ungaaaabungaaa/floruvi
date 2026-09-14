import { formatMoney } from "@/lib/pricing";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowUpRight, Sprout, Check } from "lucide-react";
import { getCatalogue } from "@/lib/catalogue";
import { siteUrl } from "@/lib/site";
import { getRecipes } from "@/lib/recipes";
import { RecipeCard } from "@/components/recipe-card";
import { ProductGallery } from "@/components/product-gallery";
import { ProductCard, categoryLabels } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { AddToCart } from "@/components/add-to-cart";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { products } = await getCatalogue();
  const p = products.find((p) => p.slug === slug);
  return {
    title: p?.name ?? "Crop not found",
    description: p?.description,
    alternates: { canonical: `/products/${slug}` },
  };
}
export default async function ProductDetails({ params }: Props) {
  const { slug } = await params;
  const [{ products }, recipes] = await Promise.all([
    getCatalogue(),
    getRecipes(),
  ]);
  const p = products.find((p) => p.slug === slug);
  if (!p) notFound();
  const related = products
    .filter((q) => q.category === p.category && q.slug !== p.slug)
    .slice(0, 4);
  const productRecipes = recipes
    .filter((recipe) => recipe.crops.includes(p.slug))
    .slice(0, 4);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    category: categoryLabels[p.category],
    url: `${siteUrl}/products/${p.slug}`,
    ...(p.imageUrl ? { image: p.imageUrl } : {}),
  };
  return (
    <div className="page-width section">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/products">Our produce</Link>
        <span>/</span>
        <Link href={`/categories/${p.category}`}>
          {categoryLabels[p.category]}
        </Link>
        <span>/</span>
        <span>{p.name}</span>
      </nav>
      <div className="product-detail">
        <ProductGallery product={p} />
        <div className="detail-copy">
          <Link className="eyebrow" href={`/categories/${p.category}`}>
            {categoryLabels[p.category]}
          </Link>
          <h1>{p.name}</h1>
          <p className="detail-description">{p.description}</p>
          <p className="detail-price">
            {formatMoney(p.price?.amountMinor)}
            {p.price && <small> / {p.price.packLabel}</small>}
          </p>
          <div className="availability">
            <span className="status-dot" /> Available across India
          </div>
          <AddToCart slug={p.slug} name={p.name} />
          <Button asChild variant="outline">
            <Link href={`/contact?product=${encodeURIComponent(p.name)}`}>
              Ask about this crop <ArrowUpRight size={18} />
            </Link>
          </Button>
          <Link
            className="text-link"
            href={`/wholesale?product=${encodeURIComponent(p.name)}`}
          >
            Buying for your business? <ArrowUpRight size={16} />
          </Link>
          <div className="detail-uses">
            <span className="eyebrow">GOOD IN</span>
            <div>
              {p.uses.map((use) => (
                <span key={use}>
                  <Check size={14} />
                  {use}
                </span>
              ))}
            </div>
          </div>
          <div className="growing-note">
            <Sprout size={24} />
            <div>
              <h2>How it grows</h2>
              <p>{p.growingNote}</p>
              <span>{p.methods.join(" · ")}</span>
            </div>
          </div>
        </div>
      </div>
      <details className="source-details">
        <summary>Growing reference</summary>
        <p>{p.sourceNote}</p>
        <a href={p.sourceUrl} target="_blank" rel="noreferrer">
          Read the growing reference ↗
        </a>
      </details>
      {productRecipes.length > 0 && (
        <section className="section">
          <div className="section-heading">
            <h2>Cook with {p.name.toLowerCase()}.</h2>
          </div>
          <div className="home-recipe-grid">
            {productRecipes.map((recipe) => (
              <RecipeCard key={recipe.slug} recipe={recipe} />
            ))}
          </div>
        </section>
      )}
      <section className="section">
        <div className="section-heading">
          <div>
            <h2>More vegetables.</h2>
          </div>
        </div>
        <div className="product-grid">
          {related.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
