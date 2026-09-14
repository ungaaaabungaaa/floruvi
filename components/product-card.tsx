import { formatMoney } from "@/lib/pricing";
import Link from "next/link";
import Image from "next/image";
import { productGalleryImages } from "@/lib/product-gallery-images";
import { Botanical } from "./botanical";
import type { Product } from "@/lib/catalogue";
import { productImages } from "@/lib/product-images";
import { AddToCart } from "./add-to-cart";

export const categoryLabels: Record<string, string> = {
  "leafy-greens": "Leafy greens",
  herbs: "Fresh herbs",
  microgreens: "Microgreens & shoots",
  "fruiting-crops": "Fruiting crops",
  "roots-and-stems": "Roots & stems",
  "edible-flowers": "Edible flowers",
};
export function ProductCard({ product }: { product: Product }) {
  const packLabel = product.price?.packLabel.split("·").at(-1)?.trim();
  const cropImage = product.imageUrl || productImages[product.slug];
  return (
    <article className="product-card">
      <Link href={`/products/${product.slug}`} className="product-card-link">
        <div className={`product-art art-${product.category}`}>
          {cropImage ? (
            <Image
              src={cropImage}
              alt={product.name}
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
          {productGalleryImages[product.slug] && (
            <Image
              src={productGalleryImages[product.slug]}
              alt=""
              aria-hidden="true"
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="product-hover-image"
            />
          )}
        </div>
      </Link>
      <div className="product-card-bottom">
        <Link href={`/products/${product.slug}`} className="product-meta">
          <h3>{product.name}</h3>
        </Link>
        <div className="product-card-price-row">
          <p>
            <strong>{formatMoney(product.price?.amountMinor)}</strong>
            {packLabel && <span>{packLabel}</span>}
          </p>
          <AddToCart slug={product.slug} name={product.name} compact />
        </div>
      </div>
    </article>
  );
}
