import type { StaticImageData } from "next/image";
import { additionalProductImages } from "./additional-product-images";
import { productGalleryImages } from "./product-gallery-images";
import { productImage } from "./product-images";

/** Every photo of one product, in gallery order: main, close-up, then extra views. */
export function productPhotos(slug: string, imageUrl?: string | null): (StaticImageData | string)[] {
  const main = productImage(slug, imageUrl);
  return [
    ...(main ? [main] : []),
    ...(productGalleryImages[slug] ? [productGalleryImages[slug]] : []),
    ...(additionalProductImages[slug] ?? []),
  ];
}
