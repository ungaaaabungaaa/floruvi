import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowUpRight, Sprout, Check } from "lucide-react";
import { getCatalogue } from "@/lib/catalogue";
import { siteUrl } from "@/lib/site";
import { ProductGallery } from "@/components/product-gallery";
import { ProductCard, categoryLabels } from "@/components/product-card";
import { Button } from "@/components/ui/button";
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
  const { products } = await getCatalogue();
  const p = products.find((p) => p.slug === slug);
  if (!p) notFound();
  const related = products
    .filter((q) => q.category === p.category && q.slug !== p.slug)
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
          <div className="availability">
            <span className="status-dot" /> Available to enquire
            <span>
              Harvest dates, pack sizes, and price confirmed on request.
            </span>
          </div>
          <Button asChild>
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
              <h2>
                {p.suitability === "specialist"
                  ? "A specialist growing project"
                  : "From our growing list"}
              </h2>
              <p>{p.growingNote}</p>
              <span>{p.methods.join(" · ")}</span>
            </div>
          </div>
        </div>
      </div>
      <details className="source-details">
        <summary>About this crop listing and its growing reference</summary>
        <p>
          This crop is a candidate for production. It is not a claim of current
          stock or guaranteed local yield. {p.sourceNote}
        </p>
        <a href={p.sourceUrl} target="_blank" rel="noreferrer">
          Read the growing reference ↗
        </a>
      </details>
      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">KEEP EXPLORING</span>
            <h2>Good company for your kitchen.</h2>
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
