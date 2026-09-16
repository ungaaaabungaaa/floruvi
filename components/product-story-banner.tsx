import Image from "next/image";
import { Leaf, Sprout, Truck, ShoppingBag } from "lucide-react";
import leafy from "@/src/assets/products/banners/leafy.webp";
import herbs from "@/src/assets/products/banners/herbs.webp";
import microgreens from "@/src/assets/products/banners/microgreens.webp";
import tomatoes from "@/src/assets/products/banners/tomatoes.webp";
import roots from "@/src/assets/products/banners/roots.webp";
import flowers from "@/src/assets/products/banners/flowers.webp";
import { getI18n } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n/format";
const images = [leafy, herbs, microgreens, tomatoes, roots, flowers];
export async function ProductStoryBanner({ index }: { index: number }) {
  const { locale, messages } = await getI18n();
  const t = messages.product.story;
  const position = ((index % 6) + 6) % 6;
  const story = { ...t.banners[position], image: images[position] };
  return (
    <section className="product-story" aria-label={t.label}>
      <div className="product-story-art">
        <Image
          src={story.image}
          alt={story.alt}
          fill
          sizes="(max-width: 700px) 100vw, 70vw"
        />
        <div className="product-story-copy">
          <h2>{story.title}</h2>
          <span className="story-rule" />
          <p>{t.tagline}</p>
        </div>
      </div>
      <div className="product-story-values">
        <span>
          <Leaf />
          {t.fresh}
        </span>
        <span>
          <Sprout />
          {t.care}
        </span>
        <span>
          <Truck />
          {locale.domestic ? t.domestic : fill(t.export, { country: locale.countryName })}
        </span>
        <span>
          <ShoppingBag />
          {t.mix}
        </span>
      </div>
    </section>
  );
}
