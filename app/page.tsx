import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getCatalogue } from "@/lib/catalogue";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import hero from "@/src/assets/hero-lifestyle.png";
import towers from "@/src/assets/growing-towers.png";
import salad from "@/src/assets/salad-bowl.png";
import box from "@/src/assets/delivery-greens.png";

export default async function Home() {
  const { categories, products } = await getCatalogue();
  const featured = [
    "butterhead-lettuce",
    "spinach",
    "curly-kale",
    "sweet-basil",
    "cherry-tomatoes",
    "radish-microgreens",
  ].flatMap((slug) => products.filter((p) => p.slug === slug));
  return (
    <>
      <section className="lifestyle-hero">
        <Image
          src={hero}
          alt="A woman enjoys fresh greens at a sunlit kitchen table. Illustrative image."
          fill
          sizes="100vw"
          preload
          className="hero-photo"
        />
        <div className="lifestyle-copy">
          <h1>
            Fresh greens.
            <br />
            For your table.
          </h1>
          <Button asChild>
            <Link href="/products">
              Shop vegetables <ArrowRight size={18} />
            </Link>
          </Button>
        </div>
        <span className="handwritten hero-handwriting">
          Freshness
          <br />
          worth growing.
        </span>
      </section>
      <section className="section page-width home-produce">
        <div className="section-heading">
          <div>
            <h2>Shop vegetables.</h2>
          </div>
          <Link className="text-link" href="/products">
            View all produce <ArrowRight size={17} />
          </Link>
        </div>
        <div className="product-grid home-product-grid">
          {featured.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
        <div className="home-category-links">
          {categories.map((c) => (
            <Link key={c.slug} href={`/categories/${c.slug}`}>
              {c.name}
              <ArrowRight size={14} />
            </Link>
          ))}
        </div>
        <p className="catalogue-note">
          Ask us for current availability and prices. Images are illustrative.
        </p>
      </section>
      <section className="photo-story page-width home-boxes">
        <div className="photo-story-image">
          <Image
            src={box}
            alt="Illustrative vegetable box"
            fill
            sizes="(max-width:800px) 100vw, 50vw"
          />
        </div>
        <div className="photo-story-copy">
          <span className="eyebrow">BOX SUBSCRIPTIONS</span>
          <h2>
            Vegetables,
            <br />
            on your schedule.
          </h2>
          <p>Single · Dual · Family</p>
          <Button asChild>
            <Link href="/boxes">
              Choose your box <ArrowRight size={17} />
            </Link>
          </Button>
        </div>
      </section>
      <section className="photo-story page-width">
        <div className="photo-story-copy">
          <h2>Soilless growing.</h2>
          <p>Hydroponics and aeroponics, explained.</p>
          <Button asChild>
            <Link href="/how-we-grow">
              See How It Works <ArrowRight size={17} />
            </Link>
          </Button>
        </div>
        <div className="photo-story-image">
          <Image
            src={towers}
            alt="Concept of leafy greens in white hydroponic towers"
            fill
            sizes="(max-width: 800px) 100vw, 55vw"
          />
        </div>
      </section>

      <section className="recipe-feature">
        <div className="recipe-feature-image">
          <Image
            src={salad}
            alt="A colourful bowl of greens, tomatoes, cucumber, radish and avocado"
            fill
            sizes="(max-width: 800px) 100vw, 50vw"
          />
        </div>
        <div className="recipe-feature-copy">
          <h2>Simple recipes.</h2>
          <Button asChild>
            <Link href="/recipes">
              Explore Recipes <ArrowRight size={18} />
            </Link>
          </Button>
        </div>
      </section>
      <section className="section page-width business-invite">
        <div>
          <h2>Buying for a business?</h2>
        </div>
        <div className="button-row">
          <Button asChild>
            <Link href="/wholesale">
              Business Enquiries <ArrowRight size={17} />
            </Link>
          </Button>
          <Link href="/contact" className="text-link">
            Buying for home <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </>
  );
}
