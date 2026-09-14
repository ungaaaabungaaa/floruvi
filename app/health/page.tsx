import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Heart, Leaf, Sprout, Utensils } from "lucide-react";
import spinach from "@/src/assets/nutrition-botanical.png";
export const metadata: Metadata = {
  title: "Health & nutrition",
  description:
    "Simple, sourced ideas for bringing more variety and vegetables to everyday meals.",
  alternates: { canonical: "/health" },
};
export default function Health() {
  return (
    <>
      <section className="editorial-hero page-width health-hero">
        <div>
          <span className="eyebrow">HEALTH & NUTRITION</span>
          <h1>
            Small Changes.
            <br />A Healthier You.
          </h1>
          <p>Add vegetables to meals you already enjoy.</p>
          <Link href="#everyday-goodness" className="button button-primary">
            Explore the Goodness <ArrowRight size={17} />
          </Link>
        </div>
        <div className="editorial-image health-image">
          <Image
            src={spinach}
            alt="A botanical illustration of green leaves beside a paper human silhouette"
            fill
            sizes="(max-width: 800px) 100vw, 50vw"
            preload
          />
          <span className="handwritten">
            Real food.
            <br />
            Every day.
          </span>
        </div>
      </section>
      <section className="section page-width" id="everyday-goodness">
        <div className="section-heading">
          <div>
            <span className="eyebrow">NOURISH YOUR EVERYDAY</span>
            <h2>A little more variety on your plate.</h2>
          </div>
        </div>
        <div className="health-grid">
          {[
            {
              icon: Heart,
              title: "Make it a pattern",
              body: "Include vegetables, fruits, pulses, wholegrains, and protein sources.",
            },
            {
              icon: Leaf,
              title: "Make room for fibre",
              body: "Vegetables and fruits provide fibre, vitamins, and minerals.",
            },
            {
              icon: Sprout,
              title: "Try different colours",
              body: "Mix leafy greens with other vegetables.",
            },
            {
              icon: Utensils,
              title: "Keep meals practical",
              body: "Add greens to a familiar meal or try a simple side.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <article key={title}>
              <Icon size={34} strokeWidth={1.3} />
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
        <p className="source-note">
          Nutrition sources:{" "}
          <a
            href="https://www.who.int/news-room/fact-sheets/detail/healthy-diet"
            target="_blank"
            rel="noreferrer"
          >
            WHO: Healthy diet
          </a>{" "}
          and{" "}
          <a
            href="https://www.niddk.nih.gov/health-information/weight-management/healthy-eating-physical-activity-for-life/health-tips-for-adults"
            target="_blank"
            rel="noreferrer"
          >
            NIDDK: Health tips for adults
          </a>
          . General food information. Individual dietary needs can differ.
        </p>
      </section>
      <section className="green-editorial page-width">
        <span className="eyebrow">FOOD FOR EVERYDAY LIVING</span>
        <h2>Try a recipe.</h2>

        <Link href="/recipes" className="button button-light">
          Find Your Next Recipe <ArrowRight size={17} />
        </Link>
      </section>
    </>
  );
}
