import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Sprout,
  Droplets,
  Sun,
  Leaf,
  Utensils,
  ArrowRight,
} from "lucide-react";
import towers from "@/src/assets/growing-towers.png";
export const metadata: Metadata = {
  title: "How we grow",
  description:
    "From seeds to the kitchen: explore the principles behind hydroponic and aeroponic growing.",
  alternates: { canonical: "/how-we-grow" },
};
export default function HowWeGrow() {
  return (
    <>
      <section className="editorial-hero page-width">
        <div>
          <span className="eyebrow">HOW WE GROW</span>
          <h1>
            From the Ground Up.
            <br />
            <em>Without the Soil.</em>
          </h1>
          <p>Water and nutrients reach the roots directly.</p>
          <a href="#growing-steps" className="button button-primary">
            See the Process <ArrowRight size={17} />
          </a>
        </div>
        <div className="editorial-image">
          <Image
            src={towers}
            alt="hydroponic towers growing leafy vegetables"
            fill
            sizes="(max-width: 800px) 100vw, 55vw"
            preload
          />
        </div>
      </section>
      <section className="section page-width" id="growing-steps">
        <span className="eyebrow">FROM A SMALL BEGINNING</span>
        <h2>From seed to harvest.</h2>
        <div className="growing-steps">
          {[
            {
              icon: Sprout,
              title: "Seeds",
              body: "Choose the crop and a suitable propagation method.",
            },
            {
              icon: Droplets,
              title: "Grow",
              body: "Supply roots with nutrient solution or, in aeroponics, a nutrient mist.",
            },
            {
              icon: Sun,
              title: "Nourish",
              body: "Manage light, water, nutrients, and the growing environment.",
            },
            {
              icon: Leaf,
              title: "Harvest",
              body: "Check crop readiness and plan the harvest around its use.",
            },
            {
              icon: Utensils,
              title: "You enjoy",
              body: "Bring the ingredients into your everyday cooking.",
            },
          ].map(({ icon: Icon, title, body }, i) => (
            <article key={title}>
              <span className="process-icon">
                <Icon strokeWidth={1.2} size={32} />
              </span>
              <h3>
                <small>{i + 1}</small>
                {title}
              </h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
        <p className="source-note">
          This explains the growing approach. The image is a concept, not a
          photograph of Floruvi’s facilities. Each crop needs a suitable system
          and local growing checks.{" "}
          <a
            href="https://extension.umn.edu/how/small-scale-hydroponics"
            target="_blank"
            rel="noreferrer"
          >
            Read the University of Minnesota growing guide.
          </a>
        </p>
      </section>
      <section className="green-editorial page-width">
        <span className="eyebrow">THOUGHTFUL GROWING</span>
        <h2>Water, energy, and waste.</h2>

        <Link className="button button-light" href="/sustainability">
          Our Sustainability Approach <ArrowRight size={17} />
        </Link>
      </section>
    </>
  );
}
