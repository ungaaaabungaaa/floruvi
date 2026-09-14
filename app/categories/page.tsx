import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { getCatalogue } from "@/lib/catalogue";
import Image from "next/image";
import { categoryImages } from "@/lib/category-images";
export const metadata: Metadata = {
  title: "Crop categories",
  alternates: { canonical: "/categories" },
};
export default async function Categories() {
  const { categories, products } = await getCatalogue();
  return (
    <div className="page-width section">
      <div className="page-heading">
        <span className="eyebrow">SO MANY WAYS TO GROW</span>
        <h1>
          Good things.
          <br />
          <em>By nature.</em>
        </h1>
        <p>Six starting points for your next great dish.</p>
      </div>
      <div className="category-index">
        {categories.map((c, i) => (
          <Link
            href={`/categories/${c.slug}`}
            key={c.slug}
            className="category-feature"
          >
            <div style={{ background: c.color }}>
              <span className="category-number">0{i + 1}</span>
              <Image
                src={categoryImages[c.slug]}
                alt={`${c.name}, illustrative assortment`}
                fill
                sizes="(max-width: 800px) 100vw, 33vw"
              />
            </div>
            <div>
              <span className="eyebrow">
                {products.filter((p) => p.category === c.slug).length} CROPS TO
                EXPLORE
              </span>
              <h2>
                {c.name} <ArrowUpRight size={26} />
              </h2>
              <p>{c.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
