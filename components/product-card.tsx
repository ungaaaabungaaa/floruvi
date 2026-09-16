import Link from "@/components/i18n/link";
import Image from "next/image";
import { productGalleryImages } from "@/lib/product-gallery-images";
import { Botanical } from "./botanical";
import type { ShopProduct } from "@/lib/storefront";
import { productImages } from "@/lib/product-images";
import { AddToCart } from "./add-to-cart";
import { WishlistButton } from "./wishlist";
import { Money } from "./i18n/money";

export function ProductCard({ product }: { product: ShopProduct }) {
  const packLabel = product.price?.packLabel.split("·").at(-1)?.trim();
  const cropImage = product.imageUrl || productImages[product.slug];
  return (
    <article className="product-card">
      <div className="product-art-wrap">
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
                seed={product.englishName.length % 5}
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
        <WishlistButton slug={product.slug} name={product.name} />
      </div>
      <div className="product-card-bottom">
        <Link href={`/products/${product.slug}`} className="product-meta">
          <h3>{product.name}</h3>
          {packLabel && <span className="product-pack">{packLabel}</span>}
        </Link>
        <div className="product-card-row">
          <p className="product-card-price">
            <Money minor={product.price?.amountMinor} currency={product.price?.currency} />
          </p>
          <AddToCart slug={product.slug} name={product.name} compact />
        </div>
      </div>
    </article>
  );
}
