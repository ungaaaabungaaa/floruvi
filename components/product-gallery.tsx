"use client";
import Link from "@/components/i18n/link";
import { ArrowRight } from "lucide-react";
import { WishlistButton } from "./wishlist";
import { useState } from "react";
import Image, { type StaticImageData } from "next/image";
import type { ShopProduct } from "@/lib/storefront";
import type { Messages } from "@/lib/i18n/messages";
import { fill } from "@/lib/i18n/format";
import { productImages } from "@/lib/product-images";
import { Botanical } from "./botanical";
import { productGalleryImages } from "@/lib/product-gallery-images";

export function ProductGallery({
  product,
  labels,
  dishes = [],
}: {
  product: ShopProduct;
  labels: Messages["product"]["gallery"];
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
            label: fill(labels.closeUp, { name: product.name }),
            href: null,
          },
        ]
      : []),
    ...dishes.slice(0, 2).map((dish) => ({
      src: dish.image,
      label: fill(labels.servingIdea, { name: dish.name }),
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
            {labels.viewRecipe} <ArrowRight size={15} />
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
            seed={product.englishName.length % 5}
          />
        )}
      </div>
      <div className="gallery-thumbnails" aria-label={labels.images}>
        {views.map((item, index) => (
          <button
            key={item.label}
            type="button"
            onClick={() => setSelected(index)}
            aria-pressed={selected === index}
            aria-label={fill(labels.view, { label: item.label })}
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
