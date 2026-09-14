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
import hero from "@/src/assets/aeroponic-harvest.webp";
import roots from "@/src/assets/tower-roots.webp";
import lettuce from "@/src/assets/crop-lettuce.png";
import basil from "@/src/assets/crop-basil.png";
import kale from "@/src/assets/crop-kale.png";
import notebook from "@/src/assets/growing-notebook.webp";
export const metadata: Metadata = {
  title: "Inside an aeroponic tower",
  description:
    "Follow the water, explore the roots & see how a recirculating aeroponic tower grows fresh greens.",
  alternates: { canonical: "/how-we-grow" },
};
export default function HowWeGrow() {
  return (
    <div className="tower-page">
      <section className="tower-hero">
        <div className="tower-hero-art">
          <Image
            src={hero}
            alt="Hands harvesting fresh lettuce from an aeroponic tower"
            fill
            sizes="100vw"
            preload
          />
        </div>
        <div className="page-width tower-hero-inner">
          <span className="eyebrow">ROOTED IN A DIFFERENT WAY</span>
          <h1>
            More green.
            <br />
            <em>Less ground.</em>
          </h1>
          <p>
            Air. Water. Fresh possibilities.
            <br />A whole new way to grow.
          </p>
          <div
            className="tower-hero-crops"
            aria-label="Leafy greens & fresh herbs"
          >
            <div>
              {[lettuce, basil, kale].map((image, index) => (
                <Image
                  key={index}
                  src={image}
                  alt={["Lettuce", "Basil", "Kale"][index]}
                  width={64}
                  height={64}
                />
              ))}
            </div>
            <span>
              Leafy greens.
              <br />
              Fresh herbs.
            </span>
          </div>
          <span className="tower-scroll">
            Inside the tower <ArrowDownRight size={20} />
          </span>
        </div>
      </section>
      <div className="page-width tower-content">
        <section
          className="tower-principles"
          aria-label="The growing essentials"
        >
          {[
            { icon: Droplets, label: "Water recirculates" },
            { icon: Sprout, label: "Roots without soil" },
            { icon: Leaf, label: "Grow vertically" },
            { icon: Sun, label: "Light fuels growth" },
          ].map(({ icon: Icon, label }) => (
            <div key={label}>
              <Icon size={29} strokeWidth={1.3} />
              <span>{label}</span>
            </div>
          ))}
        </section>
        <section className="tower-inside" aria-labelledby="inside-title">
          <div className="tower-section-heading">
            <span className="eyebrow">LOOK A LITTLE CLOSER</span>
            <h2 id="inside-title">
              A lot happens
              <br />
              <em>beneath the leaves.</em>
            </h2>
            <p>
              Roots hang in air. A nutrient spray feeds them. Tap a number to
              explore.
            </p>
          </div>
          <TowerExplainer />
        </section>
        <section className="tower-journey" aria-labelledby="journey-title">
          <div className="tower-section-heading">
            <span className="eyebrow">
              SMALL BEGINNINGS. FRESH POSSIBILITIES.
            </span>
            <h2 id="journey-title">Seed. Grow. Harvest. Enjoy.</h2>
          </div>
          <div className="tower-stages">
            {[
              {
                icon: Sprout,
                title: "Start small",
                text: "Seeds begin in a growing plug.",
              },
              {
                icon: Droplets,
                title: "Find a home",
                text: "Young plants move into tower pockets.",
              },
              {
                icon: Leaf,
                title: "Pick at readiness",
                text: "Each crop has its own harvest time.",
              },
              {
                icon: Utensils,
                title: "Make it yours",
                text: "Fresh ingredients for everyday meals.",
              },
            ].map(({ icon: Icon, title, text }, index) => (
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
              alt="Fine pale roots hanging below a seedling growing cup"
              fill
              sizes="(max-width: 800px) 100vw, 650px"
            />
          </div>
          <div>
            <span className="eyebrow">GIVE ROOTS WHAT THEY NEED</span>
            <h2 id="root-title">
              No soil.
              <br />
              <em>Still full of life.</em>
            </h2>
            <p>
              Roots need water, nutrients & oxygen.
              <br />A fine spray delivers water & nutrients while the roots stay
              suspended in air.
            </p>
            <div className="tower-root-tags">
              <span>
                <Droplets size={18} />
                Water
              </span>
              <span>
                <Sprout size={18} />
                Nutrients
              </span>
              <span>
                <Wind size={18} />
                Oxygen
              </span>
            </div>
          </div>
        </section>
        <section className="tower-notebook" aria-labelledby="notebook-title">
          <div className="tower-section-heading">
            <span className="eyebrow">A FEW NOTES FROM INSIDE</span>
            <h2 id="notebook-title">
              Small roots.
              <br />
              <em>A clever growing loop.</em>
            </h2>
          </div>
          <Image
            src={notebook}
            alt="Hand-drawn studies of a seedling cup, roots receiving nutrient spray & an aeroponic tower water loop"
            sizes="(max-width: 800px) 100vw, 1168px"
          />
          <div className="tower-notes">
            <article>
              <span>01 / A place to begin</span>
              <h3>The cup holds the plant.</h3>
              <p>
                A growing plug supports the seedling. Roots extend through the
                net cup into the tower.
              </p>
            </article>
            <article>
              <span>02 / A little spray</span>
              <h3>The roots stay in air.</h3>
              <p>
                Nozzles deliver water & nutrients directly to the roots. Timing
                keeps them supplied.
              </p>
            </article>
            <article>
              <span>03 / Back to the start</span>
              <h3>The water comes around.</h3>
              <p>
                Unused solution drains into the base. The pump sends it through
                the system again.
              </p>
            </article>
          </div>
        </section>
        <section className="tower-closing">
          <Leaf size={36} strokeWidth={1} />
          <h2>
            A small footprint.
            <br />
            <em>A fresh perspective.</em>
          </h2>
          <p>Growing upwards opens up new possibilities.</p>
        </section>
        <details className="tower-references">
          <summary>Explore the growing science</summary>
          <div>
            <a
              href="https://spinoff.nasa.gov/Spinoff2006/er_2.html"
              target="_blank"
              rel="noreferrer"
            >
              Aeroponic growing — NASA Spinoff ↗
            </a>
            <a
              href="https://extension.okstate.edu/fact-sheets/electrical-conductivity-and-ph-guide-for-hydroponics"
              target="_blank"
              rel="noreferrer"
            >
              Water & nutrient checks — Oklahoma State University ↗
            </a>
          </div>
        </details>
      </div>
    </div>
  );
}
