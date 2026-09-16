import type { Metadata } from "next";
import { siteUrl } from "./site";
import { getI18n } from "./i18n/server";
import { localizePath, parseLocale, type Locale } from "./i18n/config";
import { languageAlternates } from "./i18n/alternates";
import hero from "@/src/assets/home-hero/harvest.webp";

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

/** Serialise JSON-LD safely inside a script tag. */
export function jsonLd(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
