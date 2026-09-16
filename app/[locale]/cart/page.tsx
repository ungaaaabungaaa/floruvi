import type { Metadata } from "next";
import { BasketPage } from "@/components/basket";
import { getShop } from "@/lib/storefront";
import { getI18n } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getI18n();
  return pageMetadata({ path: "/cart", title: messages.meta.cart.title, noindex: true });
}

export default async function Cart() {
  const [{ messages }, { products }] = await Promise.all([getI18n(), getShop()]);
  return <BasketPage products={products} labels={messages.cart} />;
}
