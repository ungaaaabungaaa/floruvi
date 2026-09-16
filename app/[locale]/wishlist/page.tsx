import type { Metadata } from "next";
import { WishlistPage } from "@/components/wishlist-page";
import { getShop } from "@/lib/storefront";
import { getI18n } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getI18n();
  return pageMetadata({ path: "/wishlist", title: messages.meta.wishlist.title, noindex: true });
}

export default async function Wishlist() {
  const [{ messages }, { products }] = await Promise.all([getI18n(), getShop()]);
  return <WishlistPage products={products} labels={messages.wishlist} />;
}
