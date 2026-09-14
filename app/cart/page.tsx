import type { Metadata } from "next";
import { getCatalogue } from "@/lib/catalogue";
import { BasketPage } from "@/components/basket";
export const metadata: Metadata = {
  title: "Your basket",
  robots: { index: false, follow: true },
  alternates: { canonical: "/cart" },
};
export default async function Cart() {
  const { products } = await getCatalogue();
  return <BasketPage products={products} />;
}
