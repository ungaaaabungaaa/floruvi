import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import salad from "@/src/assets/salad-bowl.png";
import { RecipeBrowser } from "@/components/recipe-browser";
export const metadata: Metadata = {
  title: "Simple recipes",
  description:
    "Fresh ideas for everyday cooking. Explore salads, smoothies, vegetable bowls, and basil pasta with Floruvi.",
  alternates: { canonical: "/recipes" },
};
export default function Recipes() {
  return (
    <>
      <section className="editorial-hero page-width">
        <div>
          <span className="eyebrow">RECIPES</span>
          <h1>Simple recipes.</h1>
          <p>Salads, smoothies, bowls, and pasta.</p>
        </div>
        <div className="editorial-image">
          <Image
            src={salad}
            alt="Fresh vegetable salad in a ceramic bowl"
            fill
            sizes="(max-width: 800px) 100vw, 55vw"
            preload
          />
        </div>
      </section>
      <section className="section page-width recipe-list-section">
        <RecipeBrowser />
      </section>
      <section className="green-editorial page-width">
        <span className="eyebrow">START WITH SOMETHING FRESH</span>
        <h2>Find your ingredients.</h2>

        <Link className="button button-light" href="/products">
          Shop the ingredients <ArrowRight size={17} />
        </Link>
      </section>
    </>
  );
}
