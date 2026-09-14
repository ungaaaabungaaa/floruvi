"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WishlistButton } from "./wishlist";
import { useState } from "react";
import Image, { type StaticImageData } from "next/image";
import type { Product } from "@/lib/catalogue";
import { productImages } from "@/lib/product-images";
import { Botanical } from "./botanical";
import { productGalleryImages } from "@/lib/product-gallery-images";

export function ProductGallery({
  product,
  dishes = [],
}: {
  product: Product;
  dishes?: { image: StaticImageData; name: string; slug: string }[];
}) {
  const [selected, setSelected] = useState(0);
  const crop = product.imageUrl || productImages[product.slug];
  const views = [
    {
      src: crop,
      label: product.name,
      href: null,
    },
    ...(productGalleryImages[product.slug]
      ? [
          {
            src: productGalleryImages[product.slug],
            label: `${product.name} close-up`,
            href: null,
          },
        ]
      : []),
    ...dishes.slice(0, 2).map((dish) => ({
      src: dish.image,
      label: `${dish.name} serving idea`,
      href: `/recipes/${dish.slug}`,
    })),
  ];
  const view = views[selected];
  return (
    <div className="product-gallery">
      <div className="gallery-main">
        <WishlistButton slug={product.slug} name={product.name} />
        {view.href && (
          <Link className="gallery-recipe-link" href={view.href}>
            View recipe <ArrowRight size={15} />
          </Link>
        )}
        {view.src ? (
          <Image
            src={view.src}
            alt={view.label}
            fill
            sizes="(max-width: 800px) 100vw, 50vw"
            preload={selected === 0}
            unoptimized={selected === 0 && Boolean(product.imageUrl)}
          />
        ) : (
          <Botanical
            category={product.category}
            seed={product.name.length % 5}
          />
        )}
      </div>
      <div className="gallery-thumbnails" aria-label="Product images">
        {views.map((item, index) => (
          <button
            key={item.label}
            type="button"
            onClick={() => setSelected(index)}
            aria-pressed={selected === index}
            aria-label={`View ${item.label}`}
          >
            {item.src ? (
              <Image
                src={item.src}
                alt=""
                fill
                sizes="80px"
                unoptimized={index === 0 && Boolean(product.imageUrl)}
              />
            ) : (
              <Botanical category={product.category} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
