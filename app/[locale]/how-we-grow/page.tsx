import { publicImage } from "@/lib/public-images";
import type { Metadata } from "next";
import Image from "next/image";
import {
  Sprout,
  Droplets,
  Sun,
  Leaf,
  Utensils,
  Wind,
  ArrowDownRight,
} from "lucide-react";
import { TowerExplainer } from "@/components/tower-explainer";
import { Lines } from "@/components/i18n/lines";
import { getI18n } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";
const hero = publicImage("flourvi/src/assets/aeroponic-harvest.2bd9d6e7d482c125.webp", 1024, 1536);
const roots = publicImage("flourvi/src/assets/tower-roots.37f4e98855e6dffc.webp", 1300, 867);
const lettuce = publicImage("flourvi/src/assets/crop-lettuce.179cd80f3944b659.webp", 1254, 1254);
const basil = publicImage("flourvi/src/assets/crop-basil.ccc4520a1ff48c7f.webp", 1254, 1254);
const kale = publicImage("flourvi/src/assets/crop-kale.a31c8a7d6eb92c45.webp", 1254, 1254);
import { GrowingNotebook } from "@/components/growing-notebook";
import { ProductCard } from "@/components/product-card";
import { getShop } from "@/lib/storefront";
const waterCare = publicImage("flourvi/src/assets/hydroponics/water-care.bf5dc928ffa51873.webp", 1536, 1024);
const seedlingCare = publicImage("flourvi/src/assets/hydroponics/seedling-care.5fe14c5cb954c429.webp", 1536, 1024);
import "@/components/growing-additions.css";
export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getI18n();
  return pageMetadata({
    path: "/how-we-grow",
    title: messages.meta.howWeGrow.title,
    description: messages.meta.howWeGrow.description,
    image: {
      url: hero.src,
      width: hero.width,
      height: hero.height,
      alt: messages.howWeGrow.heroAlt,
    },
  });
}
export default async function HowWeGrow() {
  const [{ messages }, { products }] = await Promise.all([
    getI18n(),
    getShop(),
  ]);
  const t = messages.howWeGrow;
  const growProducts = ["butterhead-lettuce", "sweet-basil", "curly-kale", "arugula"].flatMap((slug) =>
    products.filter((p) => p.slug === slug),
  );
  return (
    <div className="tower-page">
      <section className="tower-hero">
        <div className="tower-hero-art">
          <Image src={hero} alt={t.heroAlt} fill sizes="100vw" preload />
        </div>
        <div className="page-width tower-hero-inner">
          <span className="eyebrow">{t.eyebrow}</span>
          <h1>
            {t.title}
            <br />
            <em>{t.accent}</em>
          </h1>
          <p>
            <Lines text={t.intro} />
          </p>
          <div className="tower-hero-crops" aria-label={t.cropsLabel}>
            <div>
              {[lettuce, basil, kale].map((image, index) => (
                <Image
                  key={index}
                  src={image}
                  alt={t.cropAlts[index]}
                  width={64}
                  height={64}
                />
              ))}
            </div>
            <span>
              <Lines text={t.crops} />
            </span>
          </div>
          <span className="tower-scroll">
            {t.scroll} <ArrowDownRight size={20} />
          </span>
        </div>
      </section>
      <div className="page-width tower-content">
        <section className="tower-principles" aria-label={t.principlesLabel}>
          {[Droplets, Sprout, Leaf, Sun]
            .map((Icon, index) => ({
              Icon,
              label: t.principles[index],
            }))
            .map(({ Icon, label }) => (
              <div key={label}>
                <Icon size={29} strokeWidth={1.3} />
                <span>{label}</span>
              </div>
            ))}
        </section>
        <section className="tower-inside" aria-labelledby="inside-title">
          <div className="tower-section-heading">
            <span className="eyebrow">{t.insideEyebrow}</span>
            <h2 id="inside-title">
              {t.insideTitle}
              <br />
              <em>{t.insideAccent}</em>
            </h2>
            <p>{t.insideText}</p>
          </div>
          <TowerExplainer labels={t.tower} />
        </section>
        <section className="tower-journey" aria-labelledby="journey-title">
          <div className="tower-section-heading">
            <span className="eyebrow">{t.journeyEyebrow}</span>
            <h2 id="journey-title">{t.journeyTitle}</h2>
          </div>
          <div className="tower-stages">
            {[Sprout, Droplets, Leaf, Utensils]
              .map((Icon, index) => ({
                Icon,
                ...t.stages[index],
              }))
              .map(({ Icon, title, text }, index) => (
                <article key={title}>
                  <div className="tower-stage-top">
                    <Icon size={42} strokeWidth={1.2} />
                    <span>0{index + 1}</span>
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
          </div>
        </section>
        <section className="tower-root-story" aria-labelledby="root-title">
          <div className="tower-root-image">
            <Image
              src={roots}
              alt={t.rootAlt}
              fill
              sizes="(max-width: 800px) 100vw, 650px"
            />
          </div>
          <div>
            <span className="eyebrow">{t.rootEyebrow}</span>
            <h2 id="root-title">
              {t.rootTitle}
              <br />
              <em>{t.rootAccent}</em>
            </h2>
            <p>
              <Lines text={t.rootText} />
            </p>
            <div className="tower-root-tags">
              {[Droplets, Sprout, Wind].map((Icon, index) => (
                <span key={index}>
                  <Icon size={18} />
                  {t.rootTags[index]}
                </span>
              ))}
            </div>
          </div>
        </section>
        {t.hydroLessons.map((lesson, index) => (
          <section
            className="hydro-lesson"
            key={lesson.title}
            aria-labelledby={`hydro-lesson-${index}`}
          >
            <Image
              src={[waterCare, seedlingCare][index]}
              alt={lesson.alt}
              sizes="(max-width: 800px) 100vw, 650px"
            />
            <div>
              <span className="eyebrow">{lesson.eyebrow}</span>
              <h2 id={`hydro-lesson-${index}`}>{lesson.title}</h2>
              <p>{lesson.text}</p>
            </div>
          </section>
        ))}
        <GrowingNotebook labels={t} />
        <section className="tower-closing">
          <Leaf size={36} strokeWidth={1} />
          <h2>
            {t.closingTitle}
            <br />
            <em>{t.closingAccent}</em>
          </h2>
          <p>{t.closingText}</p>
        </section>
        <details className="tower-references">
          <summary>{t.references}</summary>
          <div>
            <a
              href="https://spinoff.nasa.gov/Spinoff2006/er_2.html"
              target="_blank"
              rel="noreferrer"
            >
              {t.referenceNasa}
            </a>
            <a
              href="https://extension.okstate.edu/fact-sheets/electrical-conductivity-and-ph-guide-for-hydroponics"
              target="_blank"
              rel="noreferrer"
            >
              {t.referenceOsu}
            </a>
            <a
              href="https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/small-scale-hydroponics"
              target="_blank"
              rel="noreferrer"
            >
              University of Minnesota Extension — Hydroponics
            </a>
          </div>
        </details>
        <section
          className="grow-products"
          aria-labelledby="grow-products-title"
        >
          <div className="tower-section-heading">
            <h2 id="grow-products-title">{t.productsTitle}</h2>
          </div>
          <div
            className="grow-product-row"
            tabIndex={0}
            role="region"
            aria-label={t.productsTitle}
          >
            {growProducts.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
