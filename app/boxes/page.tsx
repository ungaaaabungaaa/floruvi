import { getRecipes } from "@/lib/recipes";
import { getCatalogue } from "@/lib/catalogue";
import { reviewBasket } from "@/lib/pricing";
import { boxSizes, boxContents } from "@/lib/boxes";
import type { Metadata } from "next";
import { BoxSelector } from "@/components/box-selector";
export const metadata: Metadata = {
  title: "Vegetable box subscriptions",
  description:
    "Vegetable boxes for one, two, or a family. Choose daily, weekly, or every-two-weeks delivery. Request availability from Floruvi.",
  alternates: { canonical: "/boxes" },
};
export default async function Boxes() {
  const [{ products, commerce }, recipes] = await Promise.all([
    getCatalogue(),
    getRecipes(),
  ]);
  const meals = recipes
    .filter((recipe) =>
      recipe.crops.some((slug) =>
        boxContents.some((item) => item.slug === slug),
      ),
    )
    .slice(0, 5);
  const plans = boxSizes.map((box, index) => ({
    ...box,
    ...reviewBasket(
      boxContents.map((line) => ({
        ...line,
        quantity: line.quantity * [1, 2, 4][index],
      })),
      products,
      commerce,
    ),
  }));
  return <BoxSelector plans={plans} recipes={meals} />;
}
