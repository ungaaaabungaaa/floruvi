import { publicImage } from "@/lib/public-images";
import { contactEmails } from "@/lib/site";
import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { getI18n } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";
const freshlyPicked = publicImage("flourvi/src/assets/recipes/banners/freshly-picked.b4e1462b2cdf8ca5.webp", 1800, 600);
const colourfulTable = publicImage("flourvi/src/assets/recipes/banners/colourful-table.27f7c6c458d62450.webp", 1800, 600);
const slowMornings = publicImage("flourvi/src/assets/recipes/banners/slow-mornings.07709f5522aa98d9.webp", 1800, 600);

const UPDATED = "2026-09-28";

export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getI18n();
  return pageMetadata({
    path: "/privacy",
    title: messages.meta.privacy.title,
    description: messages.meta.privacy.description,
  });
}

// Positions are section indexes: after "basket", "protection" and "requests".
const banners = [
  { after: 3, image: freshlyPicked, style: "right" },
  { after: 9, image: colourfulTable, style: "warm left" },
  { after: 12, image: slowMornings, style: "right" },
];

export default async function Privacy() {
  const { locale, messages } = await getI18n();
  const t = messages.privacy;
  // The locale cookie is described inside the browser-storage section.
  const sections = t.sections.map((section) =>
    section.id === "services"
      ? { ...section, paragraphs: [...section.paragraphs, t.localeNote] }
      : section,
  );
  return (
    <LegalPage
      contactEmail={contactEmails.legal}
      locale={locale}
      t={{ ...t, sections }}
      updatedDate={UPDATED}
      bannerSpecs={banners}
    />
  );
}
