import Image from "next/image";
import { Leaf, Sprout, Truck, ShoppingBag } from "lucide-react";
import leafy from "@/src/assets/products/banners/leafy.webp";
import herbs from "@/src/assets/products/banners/herbs.webp";
import microgreens from "@/src/assets/products/banners/microgreens.webp";
import tomatoes from "@/src/assets/products/banners/tomatoes.webp";
import roots from "@/src/assets/products/banners/roots.webp";
import flowers from "@/src/assets/products/banners/flowers.webp";
const stories = [
  {
    image: leafy,
    title: "Good food today.\nMore to look forward to.",
    alt: "Fresh spinach and kale on a sage background",
  },
  {
    image: herbs,
    title: "A little freshness.\nA lot of flavour.",
    alt: "Basil and mint in soft sunlight",
  },
  {
    image: microgreens,
    title: "Small leaves.\nA fresh beginning.",
    alt: "Young microgreens in a ceramic dish",
  },
  {
    image: tomatoes,
    title: "Bring a little colour\nto every day.",
    alt: "Tomatoes and cucumber on a warm peach background",
  },
  {
    image: roots,
    title: "Simple ingredients.\nMeals worth making.",
    alt: "Carrots and radishes on a cream background",
  },
  {
    image: flowers,
    title: "The finishing touch\nis something fresh.",
    alt: "Edible flowers on a soft rose background",
  },
];
export function ProductStoryBanner({ index }: { index: number }) {
  const story = stories[((index % 6) + 6) % 6];
  return (
    <section className="product-story" aria-label="Freshness worth growing">
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
          <p>Freshness worth growing</p>
        </div>
      </div>
      <div className="product-story-values">
        <span>
          <Leaf />
          Fresh produce
        </span>
        <span>
          <Sprout />
          Grown with care
        </span>
        <span>
          <Truck />
          Delivery across India
        </span>
        <span>
          <ShoppingBag />
          Pick your own mix
        </span>
      </div>
    </section>
  );
}
