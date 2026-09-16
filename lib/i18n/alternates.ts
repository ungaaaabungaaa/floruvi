import { defaultLocale, localizePath, locales, parseLocale } from "./config";

/** hreflang alternates for every country & language version of a path. */
export function languageAlternates(path: string) {
  const languages: Record<string, string> = {};
  for (const locale of locales) languages[parseLocale(locale).tag] = localizePath(locale, path);
  languages["x-default"] = localizePath(defaultLocale, path);
  return languages;
}
