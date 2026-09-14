import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Leaf,
  Droplets,
  Sprout,
  Utensils,
  Heart,
} from "lucide-react";
import { getCatalogue } from "@/lib/catalogue";
import { productImages } from "@/lib/product-images";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import hero from "@/src/assets/hero-lifestyle.png";
import towers from "@/src/assets/growing-towers.png";
import salad from "@/src/assets/salad-bowl.png";

export default async function Home() {
  const { categories, products } = await getCatalogue();
  const featured = Object.keys(productImages).flatMap((slug) =>
    products.filter((p) => p.slug === slug),
  );
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
          <span className="eyebrow">GOOD GREENS. BRIGHTER DAYS.</span>
          <h1>
            Better Food.
            <br />A Healthier You.
            <br />
            <span>A Brighter Tomorrow.</span>
          </h1>
          <p>
            Fresh ideas. Real vegetables.
            <br />A little more goodness on your plate.
          </p>
          <Button asChild>
            <Link href="/products">
              Explore Fresh Greens <ArrowRight size={18} />
            </Link>
          </Button>
          <div className="hero-benefits">
            <span>
              <Leaf strokeWidth={1.2} />
              Fresh
              <br />
              possibilities
            </span>
            <span>
              <Droplets strokeWidth={1.2} />
              Soilless
              <br />
              growing
            </span>
            <span>
              <Heart strokeWidth={1.2} />
              Made for
              <br />
              your table
            </span>
          </div>
        </div>
        <span className="handwritten hero-handwriting">
          Good food,
          <br />
          brighter days.
        </span>
      </section>
      <section className="section page-width home-produce">
        <div className="section-heading">
          <div>
            <span className="eyebrow">FROM OUR GROWING LIST</span>
            <h2>Meet your everyday greens.</h2>
            <p>Familiar favourites. A fresh place to start.</p>
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
          Explore the crops we can plan for. Ask us to confirm the current
          harvest, pack sizes, and prices. Images are illustrative.
        </p>
      </section>
      <section className="photo-story page-width">
        <div className="photo-story-copy">
          <span className="eyebrow">HOW WE GROW</span>
          <h2>
            Clean thinking.
            <br />
            From the ground up.
            <br />
            <em>Without the soil.</em>
          </h2>
          <p>
            Water, nutrients, light, and care. Discover how hydroponic and
            aeroponic systems bring a different approach to growing vegetables.
          </p>
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
      <section className="section page-width nutrition-intro">
        <span className="eyebrow">SMALL CHANGES, EVERY DAY</span>
        <h2>Make room for more good food.</h2>
        <p>
          A mix of vegetables, grains, pulses, and other foods can make everyday
          meals both varied and satisfying. Start with what you enjoy.
        </p>
        <div className="simple-benefits">
          <div>
            <Leaf />
            <h3>More variety</h3>
            <p>Try a new leaf, colour, or flavour.</p>
          </div>
          <div>
            <Utensils />
            <h3>Simple meals</h3>
            <p>Small ideas for your everyday cooking.</p>
          </div>
          <div>
            <Sprout />
            <h3>A little curiosity</h3>
            <p>Get to know what goes on your plate.</p>
          </div>
        </div>
        <Link href="/health" className="text-link">
          Explore health & nutrition <ArrowRight size={17} />
        </Link>
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
          <span className="eyebrow">FRESH FROM THE KITCHEN</span>
          <h2>
            Real vegetables.
            <br />
            Simple meals.
            <br />
            Happier days.
          </h2>
          <p>
            A handful of greens. A few good ingredients.
            <br />
            Fresh ideas for the food you make every day.
          </p>
          <Button asChild>
            <Link href="/recipes">
              Explore Recipes <ArrowRight size={18} />
            </Link>
          </Button>
        </div>
      </section>
      <section className="section page-width business-invite">
        <div>
          <span className="eyebrow">FOR YOUR HOME. FOR YOUR BUSINESS.</span>
          <h2>Let’s grow something together.</h2>
          <p>
            From a family table to a busy restaurant kitchen.
            <br />
            Tell us what you need, and we’ll take it from there.
          </p>
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
