import type { Metadata } from "next";
import { getCatalogue } from "@/lib/catalogue";
import { WishlistPage } from "@/components/wishlist-page";
export const metadata: Metadata = {
  title: "Your wishlist",
  robots: { index: false, follow: true },
};
export default async function Wishlist() {
  const { products } = await getCatalogue();
  return <WishlistPage products={products} />;
}
