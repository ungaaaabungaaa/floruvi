import { publicImage } from "@/lib/public-images";
import { contactEmails } from "@/lib/site";
import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { getI18n } from "@/lib/i18n/server";
import { deliveryFeeLabel } from "@/lib/storefront";
import { pageMetadata } from "@/lib/seo";
const freshlyPicked = publicImage("flourvi/src/assets/recipes/banners/freshly-picked.b4e1462b2cdf8ca5.webp", 1800, 600);
const slowMornings = publicImage("flourvi/src/assets/recipes/banners/slow-mornings.07709f5522aa98d9.webp", 1800, 600);

const UPDATED = "2026-09-28";

export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getI18n();
  return pageMetadata({
    path: "/terms",
    title: messages.meta.terms.title,
    description: messages.meta.terms.description,
  });
}

const banners = [
  { after: 2, image: freshlyPicked, style: "right" },
  { after: 6, image: slowMornings, style: "warm left" },
];

export default async function Terms() {
  const { locale, messages } = await getI18n();
  return (
    <LegalPage
      contactEmail={contactEmails.legal}
      locale={locale}
      t={messages.terms}
      updatedDate={UPDATED}
      bannerSpecs={banners}
      values={{ fee: await deliveryFeeLabel(locale.tag) }}
    />
  );
}
