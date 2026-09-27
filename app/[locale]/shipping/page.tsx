import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { getI18n } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";
import { deliveryFeeLabel } from "@/lib/storefront";

// Owner decisions, 28 September 2026: every PIN code in India, within 2 days,
// a flat delivery fee, no cash on delivery. Razorpay's review needs this page.
const UPDATED = "2026-09-28";

export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getI18n();
  return pageMetadata({
    path: "/shipping",
    title: messages.meta.shipping.title,
    description: messages.meta.shipping.description,
  });
}

export default async function Shipping() {
  const { locale, messages } = await getI18n();
  return (
    <LegalPage
      locale={locale}
      t={messages.shipping}
      updatedDate={UPDATED}
      values={{ fee: await deliveryFeeLabel(locale.tag) }}
    />
  );
}
