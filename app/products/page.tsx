import type { Metadata } from "next";
import Image from "next/image";
import towers from "@/src/assets/growing-towers.png";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { CatalogueBrowser } from "@/components/catalogue-browser";
export const metadata: Metadata = {
  title: "Our produce",
  description:
    "Browse Floruvi’s growing list. Explore leafy greens, herbs, microgreens, fruiting crops, roots, and edible flowers.",
  alternates: { canonical: "/products" },
};
export default async function Products() {
  const preloaded = await preloadQuery(api.catalogue.browse, {});
  return (
    <div className="page-width section">
      <div className="page-heading catalogue-hero">
        <Image src={towers} alt="" fill sizes="100vw" preload />
        <div>
          <span className="eyebrow">THE FLORUVI GROWING LIST</span>
          <h1>Vegetables & herbs.</h1>
          <p>Availability on request.</p>
        </div>
      </div>
      <CatalogueBrowser preloaded={preloaded} />
      <p className="catalogue-note">
        Crop listings are for planning, not live stock.
      </p>
    </div>
  );
}
