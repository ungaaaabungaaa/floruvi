import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Botanical } from "./botanical";
import type { Product } from "@/lib/catalogue";
import { productImages } from "@/lib/product-images";

export const categoryLabels: Record<string, string> = {
  "leafy-greens": "Leafy greens",
  herbs: "Fresh herbs",
  microgreens: "Microgreens & shoots",
  "fruiting-crops": "Fruiting crops",
  "roots-and-stems": "Roots & stems",
  "edible-flowers": "Edible flowers",
};
export function ProductCard({ product }: { product: Product }) {
  const cropImage = product.imageUrl || productImages[product.slug];
  return (
    <article className="product-card">
      <Link href={`/products/${product.slug}`} className="product-card-link">
        <div className={`product-art art-${product.category}`}>
          {cropImage ? (
            <Image
              src={cropImage}
              alt={
                product.imageUrl
                  ? product.name
                  : `${product.name}, illustrative image`
              }
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              unoptimized={Boolean(product.imageUrl)}
            />
          ) : (
            <Botanical
              category={product.category}
              seed={product.name.length % 5}
            />
          )}
          <span className="art-label">
            {product.suitability === "specialist"
              ? "Specialist crop"
              : "Growing list"}
          </span>
          <span className="product-arrow">
            <ArrowUpRight size={19} />
          </span>
        </div>
        <div className="product-meta">
          <span className="eyebrow">{categoryLabels[product.category]}</span>
          <h3>{product.name}</h3>
          <p>
            Ask about availability <span aria-hidden="true">↗</span>
          </p>
        </div>
      </Link>
    </article>
  );
}
