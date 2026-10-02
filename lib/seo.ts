import type { Metadata } from "next";
import { siteUrl } from "./site";
import { getI18n } from "./i18n/server";
import { localizePath, parseLocale, type Locale } from "./i18n/config";
import { languageAlternates } from "./i18n/alternates";
import hero from "@/src/assets/home-hero/harvest.webp";
import { clampText } from "./meta-description";

export { DESCRIPTION_LIMIT, clampText, fitDescription } from "./meta-description";

export const absoluteUrl = (path: string) => new URL(path, siteUrl).toString();
const ogLocale = (locale: Locale) => parseLocale(locale).tag.replace("-", "_");

type Image = { url: string; width?: number; height?: number; alt: string };

/** Complete page metadata. Next merges metadata shallowly, so pages set it all. */
export async function pageMetadata({
  path,
  title,
  description,
  image,
  noindex = false,
  type = "website",
}: {
  path: string;
  title?: string;
  description?: string;
  image?: Image;
  noindex?: boolean;
  type?: "website" | "article";
}): Promise<Metadata> {
  const { locale, messages } = await getI18n();
  const url = localizePath(locale.locale, path);
  if (description) description = clampText(description);
  const images = [
    image ?? {
      url: hero.src,
      width: hero.width,
      height: hero.height,
      alt: messages.meta.ogAlt,
    },
  ];
  return {
    ...(title ? { title } : {}),
    description,
    alternates: noindex
      ? { canonical: url }
      : { canonical: url, languages: languageAlternates(path) },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type,
      url,
      siteName: messages.meta.siteName,
      locale: ogLocale(locale.locale),
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      images,
    },
    twitter: {
      card: "summary_large_image",
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      images: images.map((item) => item.url),
    },
  };
}

/** An optimised copy (at most 1200 px wide) of a local image for share cards and structured data. */
export function shareImage(image: { src: string; width: number; height: number }) {
  if (!image.src.startsWith("/")) return { url: image.src };
  // The optimiser never enlarges, so a narrower source keeps its own size.
  const width = Math.min(1200, image.width);
  return {
    url: `/_next/image?url=${encodeURIComponent(image.src)}&w=1200&q=75`,
    width,
    height: Math.round((width * image.height) / image.width),
  };
}

/** Serialise JSON-LD safely inside a script tag. */
export function jsonLd(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
