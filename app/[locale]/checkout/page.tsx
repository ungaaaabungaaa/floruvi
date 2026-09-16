import type { Metadata } from "next";
import { Checkout } from "@/components/checkout";
import { getShop } from "@/lib/storefront";
import { getI18n } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getI18n();
  return pageMetadata({ path: "/checkout", title: messages.meta.checkout.title, noindex: true });
}

export default async function CheckoutPage() {
  const [{ messages }, { products }] = await Promise.all([getI18n(), getShop()]);
  return (
    <Checkout
      labels={messages.checkout}
      products={products.map(({ slug, name }) => ({ slug, name }))}
    />
  );
}
