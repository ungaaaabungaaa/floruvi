import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { getI18n } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";
import freshlyPicked from "@/src/assets/recipes/banners/freshly-picked.webp";
import slowMornings from "@/src/assets/recipes/banners/slow-mornings.webp";

const UPDATED = "2026-09-17";

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
      locale={locale}
      t={messages.terms}
      updatedDate={UPDATED}
      bannerSpecs={banners}
    />
  );
}
