import type { Metadata } from "next";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { CatalogueBrowser } from "@/components/catalogue-browser";
export const metadata: Metadata = {
  title: "Our produce",
  description:
    "Browse Floruvi’s vegetables & herbs. Explore leafy greens, herbs, microgreens, fruiting crops, roots, & edible flowers.",
  alternates: { canonical: "/products" },
};
export default async function Products() {
  const preloaded = await preloadQuery(api.catalogue.browse, {});
  return (
    <div className="recipe-collection page-width shop-collection">
      <CatalogueBrowser preloaded={preloaded} />
    </div>
  );
}
