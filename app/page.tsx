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
  Leaf,
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

const benefits = [
  {
    name: "Digestive health",
    nutrient: "FIBRE",
    icon: Sprout,
    text: "Fibre, with enough water, helps keep digestion regular.",
    source:
      "https://www.niddk.nih.gov/health-information/digestive-diseases/constipation/eating-diet-nutrition",
  },
  {
    name: "Healthy vision",
    nutrient: "VITAMIN A",
    icon: Eye,
    text: "Your body turns beta-carotene from vegetables into vitamin A for normal vision.",
    source: "https://ods.od.nih.gov/factsheets/VitaminA-Consumer/",
  },
  {
    name: "Everyday immunity",
    nutrient: "VITAMIN C",
    icon: ShieldCheck,
    text: "Vitamin C helps your immune system work properly & supports collagen formation.",
    source: "https://ods.od.nih.gov/factsheets/VitaminC-Consumer/",
  },
  {
    name: "Cell growth",
    nutrient: "FOLATE",
    icon: Fingerprint,
    text: "Folate helps your body make DNA & supports normal cell division.",
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
    "sweet-basil",
    "curly-kale",
    "spinach",
    "cherry-tomatoes",
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
          className="home-nutrition home-wrap"
          aria-labelledby="home-nutrition-title"
        >
          <div className="home-nutrition-top">
            <div className="home-nutrition-copy">
              <span className="eyebrow">01 / GOODNESS, EXPLAINED</span>
              <h2 id="home-nutrition-title">
                Good food.
                <br />
                <em>From the inside out.</em>
              </h2>
              <p>
                There’s more to a leaf than meets the eye. Everyday vegetables
                bring fibre, vitamins & variety to the way you eat.
              </p>
              <div className="home-daily-note">
                <span className="home-daily-number">
                  400<span>g</span>
                </span>
                <div>
                  <strong>A daily starting point.</strong>
                  <p>
                    WHO recommends at least 400 g of fruit & vegetables a day
                    for adults.
                  </p>
                  <a href="https://www.who.int/news-room/fact-sheets/detail/healthy-diet">
                    Read the guidance{" "}
                    <ArrowUpRight size={12} aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
            <div className="home-body-art">
              <Image
                src={body}
                alt="Botanical artwork of a human silhouette filled with green leaves."
                fill
                sizes="(max-width:700px) 100vw, 45vw"
              />
            </div>
          </div>
          <div className="home-benefit-grid">
            {benefits.map(({ name, nutrient, icon: Icon, text, source }) => (
              <article key={name}>
                <Icon size={28} strokeWidth={1.4} aria-hidden="true" />
                <span>{nutrient}</span>
                <h3>{name}</h3>
                <p>{text}</p>
                <a
                  href={source}
                  aria-label={`Read the nutrition source for ${name.toLowerCase()}`}
                >
                  The science <ArrowUpRight size={12} aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
          <p className="home-nutrition-note">
            Benefits come from a varied diet over time. The 400 g target
            excludes potatoes & other starchy roots.
          </p>
        </section>

        <section
          className="home-picks home-wrap"
          aria-labelledby="home-picks-title"
        >
          <div className="home-section-heading">
            <div>
              <span className="eyebrow">02 / FRESH FOR YOU</span>
              <h2 id="home-picks-title">Our fresh vegetables.</h2>
            </div>
            <Link href="/products" className="home-more">
              All vegetables <ArrowUpRight size={19} aria-hidden="true" />
            </Link>
          </div>
          <div className="home-fresh-grid">
            {featured.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </section>

        <section
          className="home-strength"
          aria-labelledby="home-strength-title"
        >
          <div className="home-strength-copy">
            <span className="eyebrow">03 / FEED YOUR EVERYDAY</span>
            <h2 id="home-strength-title">
              A stronger routine.
              <br />
              <em>
                One good choice
                <br />
                at a time.
              </em>
            </h2>
            <p>
              For the morning stretch. The long walk. The life you want to feel
              good in.
            </p>
            <p className="home-strength-detail">
              Build your plate with vegetables, protein & whole grains. Make
              room for movement & rest, too.
            </p>
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
            <div>
              <span className="eyebrow">04 / FIND YOUR GOODNESS</span>
              <h2 id="home-goodness-title">What will you add today?</h2>
            </div>
            <p>
              Small additions.
              <br />A more colourful plate.
            </p>
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
                  <span>{item.note}</span>
                  <h3>{item.name}</h3>
                  <div>
                    <span>{item.crop}</span>
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
              <span className="eyebrow">05 / MAKE IT A HABIT</span>
              <h2 id="home-meal-title">
                Your next good habit
                <br />
                <em>starts on a plate.</em>
              </h2>
              <p>
                A handful of leaves. A few bright colours.
                <br />
                Something you’ll want to make again.
              </p>
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
              <div>
                <span className="eyebrow">06 / MAKE FRESH YOUR ROUTINE</span>
                <h2 id="home-boxes-title">
                  Good food.
                  <br />
                  <em>Room for everyone.</em>
                </h2>
              </div>
              <div>
                <p>
                  One kitchen. Two plates. A full table.
                  <br />
                  Find the box that fits your household.
                </p>
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
            <p className="home-box-note">
              Choose a box & request availability. Recurring billing is not
              active.
            </p>
          </div>
        </section>

        <section
          className="home-invitation home-wrap"
          aria-labelledby="home-invitation-title"
        >
          <Leaf size={30} strokeWidth={1.2} aria-hidden="true" />
          <span className="eyebrow">FRESHNESS WORTH GROWING</span>
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
