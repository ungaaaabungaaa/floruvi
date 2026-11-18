import { publicImage } from "@/lib/public-images";
import { contactEmails } from "@/lib/site";
import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { getI18n } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";
const freshlyPicked = publicImage(
  "flourvi/src/assets/recipes/banners/freshly-picked.b4e1462b2cdf8ca5.webp",
  1800,
  600,
);
const colourfulTable = publicImage(
  "flourvi/src/assets/recipes/banners/colourful-table.27f7c6c458d62450.webp",
  1800,
  600,
);
const slowMornings = publicImage(
  "flourvi/src/assets/recipes/banners/slow-mornings.07709f5522aa98d9.webp",
  1800,
  600,
);

const UPDATED = "2026-11-18";

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
  sections.push({
    id: "optional-analytics",
    title: "Optional analytics",
    paragraphs: [
      "With your permission, we use PostHog in the United States to measure public page visits, product interest, basket actions, and site errors. We do not send your name, contact details, address, payment details, form values, or URL search parameters. Analytics saves a random identifier in your browser to recognize return visits. Your privacy choice is also saved in your browser. Withdrawal clears the analytics identifier.",
      "Session recordings need a separate choice. We record a 10% sample on public pages, hide text and input values, block forms and payment frames, and exclude basket, checkout, contact, account, and admin pages. We do not record network request bodies, headers, or console logs. Recordings expire after 30 days.",
      "Use Privacy choices below to decline or withdraw permission at any time. We respect Do Not Track and Global Privacy Control. Use Contact for private order support.",
    ],
  });
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
