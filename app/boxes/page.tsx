import { getCatalogue } from "@/lib/catalogue";
import { reviewBasket } from "@/lib/pricing";
import { boxSizes, boxContents } from "@/lib/boxes";
import type { Metadata } from "next";
import Image from "next/image";
import box from "@/src/assets/delivery-greens.png";
import { BoxSelector } from "@/components/box-selector";
export const metadata: Metadata = {
  title: "Vegetable box subscriptions",
  description:
    "Vegetable boxes for one, two, or a family. Choose daily, weekly, or every-two-weeks delivery. Request availability from Floruvi.",
  alternates: { canonical: "/boxes" },
};
export default async function Boxes() {
  const { products, commerce } = await getCatalogue();
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
  return (
    <section className="page-width section boxes-page">
      <div className="box-photo">
        <Image
          src={box}
          alt="Illustrative vegetable box with leafy greens, herbs, and tomatoes"
          fill
          sizes="(max-width:800px) 100vw, 48vw"
          preload
        />
        <span className="box-photo-note">Illustrative selection</span>
      </div>
      <div className="box-copy">
        <span className="eyebrow">VEGETABLE SUBSCRIPTIONS</span>
        <h1>
          Your box.
          <br />
          <em>Your routine.</em>
        </h1>
        <BoxSelector plans={plans} />
      </div>
    </section>
  );
}
