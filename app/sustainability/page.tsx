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
            Good Food.
            <br />
            Thoughtful Choices.
          </h1>
          <p>
            Growing well means paying attention to the resources behind each
            leaf. Our approach is to measure, learn, and improve.
          </p>
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
              body: "Track water use and system losses. Use the results to guide changes to the growing process.",
            },
            {
              icon: Sun,
              title: "Count the energy",
              body: "Include pumps, lighting, and climate control when assessing a growing system. There is more to the picture than water alone.",
            },
            {
              icon: Leaf,
              title: "Plan the harvest",
              body: "Match crop plans to real demand and review handling, packaging, and waste along the way.",
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
        <h2>
          Better questions.
          <br />
          Better growing decisions.
        </h2>
        <p>Have a question about the farm or a supply requirement?</p>
        <Link className="button button-light" href="/contact">
          Talk to Floruvi <ArrowRight size={17} />
        </Link>
      </section>
    </>
  );
}
