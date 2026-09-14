import Link from "next/link";
import Image from "next/image";
import { categoryImages } from "@/lib/category-images";
import { notFound } from "next/navigation";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { getCatalogue } from "@/lib/catalogue";
import { CatalogueBrowser } from "@/components/catalogue-browser";
import type { Metadata } from "next";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { categories } = await getCatalogue();
  const c = categories.find((c) => c.slug === slug);
  return {
    title: c?.name ?? "Category not found",
    description: c?.description,
    alternates: { canonical: `/categories/${slug}` },
  };
}
export default async function Category({ params }: Props) {
  const { slug } = await params;
  const [{ categories }, preloaded] = await Promise.all([
    getCatalogue(),
    preloadQuery(api.catalogue.browse, {}),
  ]);
  const c = categories.find((c) => c.slug === slug);
  if (!c) notFound();
  return (
    <div className="page-width section">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/categories">Categories</Link>
        <span>/</span>
        <span>{c.name}</span>
      </nav>
      <div className="page-heading category-photo-heading">
        <div>
          <span className="eyebrow">THE FLORUVI GROWING LIST</span>
          <h1>{c.name}</h1>
          <p>{c.description}</p>
        </div>
        <div className="category-heading-image">
          <Image
            src={categoryImages[slug]}
            alt={`${c.name}, illustrative assortment`}
            fill
            sizes="(max-width: 800px) 100vw, 50vw"
            preload
          />
        </div>
      </div>
      <CatalogueBrowser preloaded={preloaded} initialCategory={slug} />
    </div>
  );
}
