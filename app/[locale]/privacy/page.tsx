import type { Metadata } from "next";
import { EditorialBanner } from "@/components/editorial-banner";
import Link from "@/components/i18n/link";
import { Fragment } from "react";
import { getI18n } from "@/lib/i18n/server";
import { fill, formatDate } from "@/lib/i18n/format";
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
    <article className="page-width section privacy-page">
      <header className="privacy-intro">
        <span className="eyebrow">{t.eyebrow}</span>
        <h1>{t.title}</h1>
        <p>{t.intro}</p>
        <time dateTime={UPDATED}>
          {fill(t.updated, { date: formatDate(UPDATED, locale.tag) })}
        </time>
      </header>
      <nav className="privacy-contents" aria-label={t.contents}>
        <h2>{t.inThisNotice}</h2>
        <ol>
          {sections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`}>{section.title}</a>
            </li>
          ))}
        </ol>
      </nav>
      {sections.map((section, index) => {
        const position = banners.findIndex((item) => item.after === index);
        const banner = position >= 0 && {
          ...banners[position],
          ...t.banners[position],
        };
        return (
          <Fragment key={section.id}>
            <section
              className="privacy-section"
              id={section.id}
              aria-labelledby={`${section.id}-heading`}
            >
              <span className="privacy-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 id={`${section.id}-heading`}>{section.title}</h2>
                {section.paragraphs.map((paragraph, key) => (
                  <p key={key}>{paragraph}</p>
                ))}
              </div>
            </section>
            {banner && (
              <EditorialBanner
                image={banner.image}
                alt={banner.alt}
                title={banner.title}
                className={`privacy-banner ${banner.style}`}
              />
            )}
          </Fragment>
        );
      })}
      <div className="privacy-contact">
        <p>{t.question}</p>
        <Link className="text-link" href="/contact">
          {t.contactLink}
        </Link>
      </div>
    </article>
  );
}
