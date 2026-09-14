import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
export const metadata: Metadata = {
  title: "Real talk about everyday food",
  description:
    "Simple ways to make room for vegetables in your weekly meals, with less fuss and a clear plan.",
  alternates: { canonical: "/real-talk" },
};
export default function RealTalk() {
  return (
    <>
      <section className="editorial-hero page-width real-talk-hero">
        <div>
          <span className="eyebrow">REAL TALK</span>
          <h1>Plan your meals.</h1>
          <p>Choose a few meals before you shop.</p>
          <Link href="/recipes" className="button button-primary">
            Start in the Kitchen <ArrowRight size={17} />
          </Link>
        </div>
        <div className="kitchen-paper">
          <span className="eyebrow">THIS WEEK’S GOOD FOOD PLAN</span>
          <h2>This week.</h2>
          {[
            "Pick two meals you enjoy",
            "Choose a leafy green",
            "Add a herb for flavour",
            "Buy the amount you can use",
            "Make something. Share it.",
          ].map((s) => (
            <p key={s}>
              <Check size={18} />
              {s}
            </p>
          ))}
          <span className="handwritten">
            Small changes,
            <br />
            brighter days.
          </span>
        </div>
      </section>
      <section className="section page-width nutrition-intro">
        <span className="eyebrow">KEEP IT REAL</span>
        <h2>Start with food, not promises.</h2>
        <p>
          A varied diet is part of looking after yourself. No single food can
          guarantee health or replace medical care. We focus on ingredients and
          practical ways to enjoy them.
        </p>
        <Link href="/health" className="text-link">
          Read our nutrition guide <ArrowRight size={17} />
        </Link>
      </section>
      <section className="green-editorial page-width">
        <h2>Choose your vegetables.</h2>

        <Link href="/products" className="button button-light">
          Explore Fresh Greens <ArrowRight size={17} />
        </Link>
      </section>
    </>
  );
}
