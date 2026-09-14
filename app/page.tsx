import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Eye,
  ShieldCheck,
  Sprout,
  Fingerprint,
  Clock,
  Plus,
} from "lucide-react";
import { getCatalogue } from "@/lib/catalogue";
import { getRecipes } from "@/lib/recipes";
import { ProductCard } from "@/components/product-card";
import { HomeHero } from "@/components/home-hero";
import { boxSizes } from "@/lib/boxes";
import body from "@/src/assets/home-story/botanical-body.webp";
import strength from "@/src/assets/home-story/everyday-strength.webp";
import bowl from "@/src/assets/home-story/everyday-bowl.webp";
import carrots from "@/src/assets/products/gallery/carrot.webp";
import peppers from "@/src/assets/products/gallery/bell-peppers.webp";
import spinach from "@/src/assets/products/gallery/spinach.webp";
import kale from "@/src/assets/products/gallery/curly-kale.webp";
import singleBox from "@/src/assets/boxes/single.webp";
import dualBox from "@/src/assets/boxes/dual.webp";
import familyBox from "@/src/assets/boxes/family.webp";
import mark from "@/src/assets/floruvi-mark.png";

const benefits = [
  {
    name: "Digestive health",
    nutrient: "FIBRE",
    icon: Sprout,
    source:
      "https://www.niddk.nih.gov/health-information/digestive-diseases/constipation/eating-diet-nutrition",
  },
  {
    name: "Healthy vision",
    nutrient: "VITAMIN A",
    icon: Eye,
    source: "https://ods.od.nih.gov/factsheets/VitaminA-Consumer/",
  },
  {
    name: "Everyday immunity",
    nutrient: "VITAMIN C",
    icon: ShieldCheck,
    source: "https://ods.od.nih.gov/factsheets/VitaminC-Consumer/",
  },
  {
    name: "Cell growth",
    nutrient: "FOLATE",
    icon: Fingerprint,
    source: "https://ods.od.nih.gov/factsheets/Folate-Consumer/",
  },
];

const goodness = [
  {
    name: "Love your gut.",
    note: "Add fibre to your plate",
    crop: "Carrots",
    image: carrots,
    href: "/products/carrot",
  },
  {
    name: "Look after your eyes.",
    note: "Make room for vitamin A",
    crop: "Spinach",
    image: spinach,
    href: "/products/spinach",
  },
  {
    name: "Support your defences.",
    note: "Get to know vitamin C",
    crop: "Bell peppers",
    image: peppers,
    href: "/products/bell-peppers",
  },
  {
    name: "Keep it varied.",
    note: "A little more leafy goodness",
    crop: "Leafy greens",
    image: kale,
    href: "/products?category=leafy-greens",
  },
];
const boxImages = { single: singleBox, dual: dualBox, family: familyBox };

export default async function Home() {
  const [{ products }, recipes] = await Promise.all([
    getCatalogue(),
    getRecipes(),
  ]);
  const featured = [
    "butterhead-lettuce",
    "spinach",
    "cherry-tomatoes",
    "cucumber",
    "carrot",
  ].flatMap((slug) => products.filter((product) => product.slug === slug));
  const moreVegetables = [
    "sweet-basil",
    "curly-kale",
    "bell-peppers",
    "radish-microgreens",
    "arugula",
    "beetroot",
    "mint",
    "zucchini",
  ].flatMap((slug) => products.filter((product) => product.slug === slug));
  const everydayRecipes = [
    "everyday-green-salad",
    "roasted-vegetable-bowl",
    "fresh-basil-pasta",
  ].flatMap((slug) => recipes.filter((recipe) => recipe.slug === slug));

  return (
    <>
      <HomeHero />
      <div className="home-chapters">
        <section
          className="home-picks home-wrap"
          aria-labelledby="home-picks-title"
        >
          <div className="home-section-heading">
            <h2 id="home-picks-title">Fresh today.</h2>
            <Link href="/products" className="home-more">
              Shop all <ArrowUpRight size={19} aria-hidden="true" />
            </Link>
          </div>
          <nav className="home-category-links" aria-label="Shop categories">
            <Link href="/products?category=leafy-greens">Leafy greens</Link>
            <Link href="/products?category=herbs">Fresh herbs</Link>
            <Link href="/products?category=microgreens">Microgreens</Link>
            <Link href="/products?category=fruiting-crops">Colourful crops</Link>
          </nav>
          <div className="home-fresh-grid">
            {featured.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </section>

        <section
          className="home-nutrition home-wrap"
          aria-labelledby="home-nutrition-title"
        >
          <div className="home-body-art">
            <Image
              src={body}
              alt="Botanical artwork of a human silhouette filled with green leaves."
              fill
              sizes="(max-width:700px) 100vw, 42vw"
            />
          </div>
          <div className="home-nutrition-copy">
            <h2 id="home-nutrition-title">
              Eat your colours.
              <br />
              <em>Feel the difference.</em>
            </h2>
            <div className="home-benefit-grid">
              {benefits.map(({ name, nutrient, icon: Icon, source }) => (
                <a href={source} key={name} aria-label={`${name}: ${nutrient}`}>
                  <Icon size={25} strokeWidth={1.4} aria-hidden="true" />
                  <span>{nutrient}</span>
                  <h3>{name}</h3>
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </section>

        <section
          className="home-strength"
          aria-labelledby="home-strength-title"
        >
          <div className="home-strength-copy">
            <h2 id="home-strength-title">
              A stronger routine.
              <br />
              <em>
                One good choice
                <br />
                at a time.
              </em>
            </h2>
            <div
              className="home-strength-words"
              aria-label="Food, movement and rest"
            >
              <span>Eat well</span>
              <Plus size={13} aria-hidden="true" />
              <span>Move often</span>
              <Plus size={13} aria-hidden="true" />
              <span>Rest well</span>
            </div>
          </div>
          <div className="home-strength-photo">
            <Image
              src={strength}
              alt="An adult athlete in green sportswear stretches after a workout, with her face outside the frame."
              fill
              sizes="(max-width:700px) 100vw, 55vw"
            />
          </div>
        </section>

        <section
          className="home-goodness home-wrap"
          aria-labelledby="home-goodness-title"
        >
          <div className="home-section-heading">
            <h2 id="home-goodness-title">Shop by how you want to feel.</h2>
          </div>
          <div className="home-goodness-grid">
            {goodness.map((item) => (
              <Link
                className="home-goodness-card"
                href={item.href}
                key={item.name}
              >
                <div className="home-goodness-photo">
                  <Image
                    src={item.image}
                    alt={item.crop}
                    fill
                    sizes="(max-width:700px) 50vw, 25vw"
                  />
                </div>
                <div className="home-goodness-copy">
                  <h3>{item.name}</h3>
                  <div>
                    <span>{item.note}</span>
                    <ArrowUpRight size={19} aria-hidden="true" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section
          className="home-meal home-wrap"
          aria-labelledby="home-meal-title"
        >
          <div className="home-meal-banner">
            <Image
              src={bowl}
              alt="A bowl of vegetables, chickpeas and quinoa on a linen-covered table."
              fill
              sizes="(max-width:700px) 100vw, 90vw"
            />
            <div>
              <h2 id="home-meal-title">
                Your next good habit
                <br />
                <em>starts on a plate.</em>
              </h2>
            </div>
          </div>
          <div className="home-section-heading home-recipe-heading">
            <h3>Less wondering. More cooking.</h3>
            <Link href="/recipes" className="home-more">
              All recipes <ArrowUpRight size={19} aria-hidden="true" />
            </Link>
          </div>
          <div className="home-kitchen-grid">
            {everydayRecipes.map((recipe) => (
              <Link
                href={`/recipes/${recipe.slug}`}
                className="home-kitchen-card"
                key={recipe.slug}
              >
                <div className="home-kitchen-photo">
                  <Image
                    src={recipe.image}
                    alt={recipe.name}
                    fill
                    sizes="(max-width: 700px) 100vw, 440px"
                  />
                </div>
                <div>
                  <span>
                    <Clock size={13} aria-hidden="true" />
                    {recipe.minutes} min
                  </span>
                  <h3>
                    {recipe.name}
                    <ArrowUpRight size={20} aria-hidden="true" />
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="home-boxes" aria-labelledby="home-boxes-title">
          <div className="home-wrap">
            <div className="home-section-heading">
              <h2 id="home-boxes-title">
                Good food.
                <br />
                <em>Room for everyone.</em>
              </h2>
              <div>
                <Link href="/boxes" className="home-more">
                  Explore the boxes{" "}
                  <ArrowUpRight size={19} aria-hidden="true" />
                </Link>
              </div>
            </div>
            <div className="home-box-grid">
              {boxSizes.map((box, index) => (
                <Link
                  href="/boxes"
                  className="home-box-card"
                  key={box.id}
                  aria-label={`Explore the ${box.name} box for ${box.people}`}
                >
                  <div className="home-box-photo">
                    <Image
                      src={boxImages[box.id]}
                      alt={`${box.name} box with lettuce, spinach, tomatoes, cucumber, carrots and mint`}
                      fill
                      sizes="(max-width: 700px) 100vw, 440px"
                    />
                  </div>
                  <div>
                    <span>0{index + 1}</span>
                    <h3>
                      {box.name}
                      <small>{box.people}</small>
                    </h3>
                    <ArrowUpRight size={22} aria-hidden="true" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section
          className="home-more-produce home-wrap"
          aria-labelledby="home-more-produce-title"
        >
          <div className="home-section-heading">
            <h2 id="home-more-produce-title">More vegetables to love.</h2>
            <Link href="/products" className="home-more">
              See everything <ArrowUpRight size={19} aria-hidden="true" />
            </Link>
          </div>
          <div className="home-more-grid">
            {moreVegetables.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </section>

        <section
          className="home-invitation home-wrap"
          aria-labelledby="home-invitation-title"
        >
          <Image
            src={mark}
            alt=""
            width={58}
            height={58}
            className="home-invitation-mark"
          />
          <h2 id="home-invitation-title">
            A little more green.
            <br />
            <em>A good place to begin.</em>
          </h2>
          <div>
            <Link href="/products" className="home-shop-link">
              Find your fresh favourites{" "}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link href="/contact" className="home-business-link">
              Buying for your business? Let’s talk{" "}
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
