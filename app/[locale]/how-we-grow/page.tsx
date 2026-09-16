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
import hero from "@/src/assets/aeroponic-harvest.webp";
import roots from "@/src/assets/tower-roots.webp";
import lettuce from "@/src/assets/crop-lettuce.png";
import basil from "@/src/assets/crop-basil.png";
import kale from "@/src/assets/crop-kale.png";
import notebook from "@/src/assets/growing-notebook.webp";
export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getI18n();
  return pageMetadata({
    path: "/how-we-grow",
    title: messages.meta.howWeGrow.title,
    description: messages.meta.howWeGrow.description,
    image: { url: hero.src, width: hero.width, height: hero.height, alt: messages.howWeGrow.heroAlt },
  });
}
export default async function HowWeGrow() {
  const { messages } = await getI18n();
  const t = messages.howWeGrow;
  return (
    <div className="tower-page">
      <section className="tower-hero">
        <div className="tower-hero-art">
          <Image
            src={hero}
            alt={t.heroAlt}
            fill
            sizes="100vw"
            preload
          />
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
          <div
            className="tower-hero-crops"
            aria-label={t.cropsLabel}
          >
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
        <section
          className="tower-principles"
          aria-label={t.principlesLabel}
        >
          {[Droplets, Sprout, Leaf, Sun].map((Icon, index) => ({
            Icon,
            label: t.principles[index],
          })).map(({ Icon, label }) => (
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
            {[Sprout, Droplets, Leaf, Utensils].map((Icon, index) => ({
              Icon,
              ...t.stages[index],
            })).map(({ Icon, title, text }, index) => (
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
        <section className="tower-notebook" aria-labelledby="notebook-title">
          <div className="tower-section-heading">
            <span className="eyebrow">{t.notebookEyebrow}</span>
            <h2 id="notebook-title">
              {t.notebookTitle}
              <br />
              <em>{t.notebookAccent}</em>
            </h2>
          </div>
          <Image
            src={notebook}
            alt={t.notebookAlt}
            sizes="(max-width: 800px) 100vw, 1168px"
          />
          <div className="tower-notes">
            {t.notes.map((note) => (
              <article key={note.label}>
                <span>{note.label}</span>
                <h3>{note.title}</h3>
                <p>{note.text}</p>
              </article>
            ))}
          </div>
        </section>
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
          </div>
        </details>
      </div>
    </div>
  );
}
