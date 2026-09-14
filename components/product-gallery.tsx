"use client";
import { useState } from "react";
import Image from "next/image";
import type { Product } from "@/lib/catalogue";
import { productImages } from "@/lib/product-images";
import { Botanical } from "./botanical";
import { productGalleryImages } from "@/lib/product-gallery-images";

export function ProductGallery({ product }: { product: Product }) {
  const [selected, setSelected] = useState(0);
  const crop = product.imageUrl || productImages[product.slug];
  const views = [
    {
      src: crop,
      label: product.name,
      caption: product.imageUrl
        ? product.name
        : crop
          ? "Illustrative crop image. Appearance varies by harvest."
          : "Category illustration. Crop appearance varies.",
    },
    ...(productGalleryImages[product.slug]
      ? [
          {
            src: productGalleryImages[product.slug],
            label: `${product.name} close-up`,
            caption: "Illustrative crop photo. Appearance varies by harvest.",
          },
        ]
      : []),
  ];
  const view = views[selected];
  return (
    <div className="product-gallery">
      <div className="gallery-main">
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
      <p className="image-caption" aria-live="polite">
        {view.caption}
      </p>
    </div>
  );
}
