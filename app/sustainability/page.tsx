import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Droplets, Sun, Leaf } from "lucide-react";
import towers from "@/src/assets/growing-towers.png";
export const metadata: Metadata = {
  title: "Our sustainability approach",
  description:
    "Floruvi’s approach to water, energy, and crop planning. Measure first and improve with evidence.",
  alternates: { canonical: "/sustainability" },
};
export default function Sustainability() {
  return (
    <>
      <section className="editorial-hero page-width">
        <div>
          <span className="eyebrow">OUR SUSTAINABILITY APPROACH</span>
          <h1>
            Water, energy,
            <br />
            and waste.
          </h1>
          <p>Our priorities for the farm.</p>
          <Link href="/how-we-grow" className="text-link">
            Explore how it works <ArrowRight size={17} />
          </Link>
        </div>
        <div className="editorial-image">
          <Image
            src={towers}
            alt="A concept of plants in a hydroponic growing system"
            fill
            sizes="(max-width: 800px) 100vw, 55vw"
            preload
          />
        </div>
      </section>
      <section className="section page-width">
        <div className="approach-grid">
          {[
            {
              icon: Droplets,
              title: "Follow the water",
              body: "Track water use and system losses.",
            },
            {
              icon: Sun,
              title: "Count the energy",
              body: "Measure pumps, lighting, and climate control.",
            },
            {
              icon: Leaf,
              title: "Plan the harvest",
              body: "Match the harvest to demand. Review packaging and waste.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <article key={title}>
              <Icon size={30} />
              <h2>{title}</h2>
              <p>{body}</p>
            </article>
          ))}
        </div>
        <p className="source-note">
          These are operating priorities. Floruvi has not published measured
          water, energy, or emissions savings. We will use farm records before
          making performance claims.
        </p>
      </section>
      <section className="green-editorial page-width">
        <h2>Ask about our approach.</h2>

        <Link className="button button-light" href="/contact">
          Talk to Floruvi <ArrowRight size={17} />
        </Link>
      </section>
    </>
  );
}
