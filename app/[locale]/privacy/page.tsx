import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { getI18n } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";
import freshlyPicked from "@/src/assets/recipes/banners/freshly-picked.webp";
import colourfulTable from "@/src/assets/recipes/banners/colourful-table.webp";
import slowMornings from "@/src/assets/recipes/banners/slow-mornings.webp";

const UPDATED = "2026-09-16";

export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getI18n();
  return pageMetadata({
    path: "/privacy",
    title: messages.meta.privacy.title,
    description: messages.meta.privacy.description,
  });
}

const banners = [
  { after: 3, image: freshlyPicked, style: "right" },
  { after: 7, image: colourfulTable, style: "warm left" },
  { after: 10, image: slowMornings, style: "right" },
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
      locale={locale}
      t={{ ...t, sections }}
      updatedDate={UPDATED}
      bannerSpecs={banners}
    />
  );
}
