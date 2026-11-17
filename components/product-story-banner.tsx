import { publicImage } from "@/lib/public-images";
import Image from "next/image";
import { Leaf, Sprout, Truck, ShoppingBag } from "lucide-react";
const leafy = publicImage("flourvi/src/assets/products/banners/leafy.064980aa9b64a678.webp", 1600, 533);
const herbs = publicImage("flourvi/src/assets/products/banners/herbs.308093e4663bfafb.webp", 1600, 539);
const microgreens = publicImage("flourvi/src/assets/products/banners/microgreens.1224ef54034f3a13.webp", 1600, 533);
const tomatoes = publicImage("flourvi/src/assets/products/banners/tomatoes.5e52efb2242df0fd.webp", 1600, 533);
const roots = publicImage("flourvi/src/assets/products/banners/roots.4d00bd0ba1f35ea5.webp", 1600, 533);
const flowers = publicImage("flourvi/src/assets/products/banners/flowers.73034c3ba03ea832.webp", 1600, 533);
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
