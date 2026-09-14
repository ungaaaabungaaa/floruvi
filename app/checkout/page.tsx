import type { Metadata } from "next";
import { Checkout } from "@/components/checkout";
export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: true },
  alternates: { canonical: "/checkout" },
};
export default function CheckoutPage() {
  return <Checkout />;
}
