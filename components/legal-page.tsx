import { Fragment } from "react";
import type { StaticImageData } from "next/image";
import { EditorialBanner } from "@/components/editorial-banner";
import Link from "@/components/i18n/link";
import { fill, formatDate } from "@/lib/i18n/format";

type Section = { id: string; title: string; paragraphs: string[] };
type BannerContent = { title: string; alt: string };
export type BannerSpec = { after: number; image: StaticImageData; style: string };

type Labels = {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  contents: string;
  inThisNotice: string;
  question: string;
  contactLink: string;
  sections: Section[];
  banners: BannerContent[];
};

/** Shared layout for long-form policy pages: table of contents, numbered
 *  sections with optional editorial banners, and a closing contact link. */
export function LegalPage({
  locale,
  t,
  updatedDate,
  bannerSpecs = [],
}: {
  locale: { tag: string };
  t: Labels;
  updatedDate: string;
  bannerSpecs?: BannerSpec[];
}) {
  return (
    <article className="page-width section privacy-page">
      <header className="privacy-intro">
        <span className="eyebrow">{t.eyebrow}</span>
        <h1>{t.title}</h1>
        <p>{t.intro}</p>
        <time dateTime={updatedDate}>
          {fill(t.updated, { date: formatDate(updatedDate, locale.tag) })}
        </time>
      </header>
      <nav className="privacy-contents" aria-label={t.contents}>
        <h2>{t.inThisNotice}</h2>
        <ol>
          {t.sections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`}>{section.title}</a>
            </li>
          ))}
        </ol>
      </nav>
      {t.sections.map((section, index) => {
        const position = bannerSpecs.findIndex((item) => item.after === index);
        const banner = position >= 0 && {
          ...bannerSpecs[position],
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
