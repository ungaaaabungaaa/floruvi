// Languages and export markets. A locale URL segment is `${language}-${market}`,
// for example /ar-ae/products. India English is the default and has no prefix.

export const languages = {
  en: { name: "English", dir: "ltr" },
  ar: { name: "العربية", dir: "rtl" },
  de: { name: "Deutsch", dir: "ltr" },
  ja: { name: "日本語", dir: "ltr" },
  nl: { name: "Nederlands", dir: "ltr" },
  ne: { name: "नेपाली", dir: "ltr" },
  bn: { name: "বাংলা", dir: "ltr" },
  ms: { name: "Bahasa Melayu", dir: "ltr" },
  si: { name: "සිංහල", dir: "ltr" },
  uz: { name: "Oʻzbekcha", dir: "ltr" },
} as const;
export type Language = keyof typeof languages;

// Order sets the country list in the locale picker. The first language is the
// local language. `postalCode` marks countries where addresses normally use one.
// `fallback` is the redirect language when the browser matches none of them;
// it defaults to the local language. English suits Gulf states with large expat populations.
export const markets = {
  in: { country: "IN", currency: "INR", languages: ["en"], dial: "+91", postalCode: true },
  ae: { country: "AE", currency: "AED", languages: ["ar", "en"], dial: "+971", postalCode: false, fallback: "en" },
  sa: { country: "SA", currency: "SAR", languages: ["ar", "en"], dial: "+966", postalCode: true },
  qa: { country: "QA", currency: "QAR", languages: ["ar", "en"], dial: "+974", postalCode: false, fallback: "en" },
  kw: { country: "KW", currency: "KWD", languages: ["ar", "en"], dial: "+965", postalCode: true, fallback: "en" },
  om: { country: "OM", currency: "OMR", languages: ["ar", "en"], dial: "+968", postalCode: true },
  bh: { country: "BH", currency: "BHD", languages: ["ar", "en"], dial: "+973", postalCode: true, fallback: "en" },
  iq: { country: "IQ", currency: "IQD", languages: ["ar", "en"], dial: "+964", postalCode: false },
  de: { country: "DE", currency: "EUR", languages: ["de", "en"], dial: "+49", postalCode: true },
  nl: { country: "NL", currency: "EUR", languages: ["nl", "en"], dial: "+31", postalCode: true },
  jp: { country: "JP", currency: "JPY", languages: ["ja", "en"], dial: "+81", postalCode: true },
  gb: { country: "GB", currency: "GBP", languages: ["en"], dial: "+44", postalCode: true },
  np: { country: "NP", currency: "NPR", languages: ["ne", "en"], dial: "+977", postalCode: false },
  bd: { country: "BD", currency: "BDT", languages: ["bn", "en"], dial: "+880", postalCode: true },
  my: { country: "MY", currency: "MYR", languages: ["ms", "en"], dial: "+60", postalCode: true },
  lk: { country: "LK", currency: "LKR", languages: ["si", "en"], dial: "+94", postalCode: true },
  uz: { country: "UZ", currency: "UZS", languages: ["uz", "en"], dial: "+998", postalCode: true },
} as const satisfies Record<
  string,
  {
    country: string;
    currency: string;
    languages: readonly Language[];
    dial: string;
    postalCode: boolean;
    fallback?: Language;
  }
>;
export type Market = keyof typeof markets;
export type Currency = (typeof markets)[Market]["currency"];
export type Locale = `${Language}-${Market}`;

export const defaultMarket: Market = "in";
export const defaultLocale = "en-in" satisfies Locale;
export const LOCALE_COOKIE = "floruvi-locale";

export const marketCodes = Object.keys(markets) as Market[];
export const locales = marketCodes.flatMap((market) =>
  markets[market].languages.map((language) => `${language}-${market}` as Locale),
);
const localeSet = new Set<string>(locales);

export function isMarket(value: unknown): value is Market {
  return typeof value === "string" && Object.hasOwn(markets, value);
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && localeSet.has(value);
}

export function parseLocale(locale: Locale) {
  const [language, market] = locale.split("-") as [Language, Market];
  const config = markets[market];
  return {
    locale,
    language,
    market,
    dir: languages[language].dir,
    currency: config.currency as Currency,
    country: config.country as string,
    // BCP 47 tag for html lang, hreflang and Intl, e.g. "ar-AE".
    tag: `${language}-${config.country}`,
    domestic: market === defaultMarket,
  };
}
export type LocaleInfo = ReturnType<typeof parseLocale>;

/** Prefix an internal path for a locale. India English keeps unprefixed URLs. */
export function localizePath(locale: Locale, path: string) {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  const bare = stripLocale(path);
  if (locale === defaultLocale) return bare;
  return bare === "/" ? `/${locale}` : `/${locale}${bare}`;
}

/** Remove a leading locale segment, keeping the query and hash. */
export function stripLocale(path: string) {
  const match = /^\/([a-z]{2}-[a-z]{2})(?=\/|\?|#|$)/.exec(path);
  if (!match || !isLocale(match[1])) return path;
  const rest = path.slice(match[0].length);
  return rest.startsWith("/") ? rest : `/${rest}`;
}

export function marketForCountry(country: string | null | undefined) {
  const code = country?.trim().toUpperCase();
  return marketCodes.find((market) => markets[market].country === code);
}

/** Pick the market language that best matches an Accept-Language header. */
export function languageForMarket(
  acceptLanguage: string | null | undefined,
  market: Market,
): Language {
  const config: { languages: readonly Language[]; fallback?: Language } = markets[market];
  const supported = config.languages;
  const ranked = (acceptLanguage ?? "")
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().toLowerCase().split(";");
      const q = Number(params.find((p) => p.trim().startsWith("q="))?.split("=")[1] ?? 1);
      return { language: tag.split("-")[0], q: Number.isFinite(q) ? q : 0, index };
    })
    .filter((item) => item.language && item.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index);
  const match = ranked.find((item) =>
    supported.includes(item.language as Language),
  );
  return (match?.language as Language | undefined) ?? config.fallback ?? supported[0];
}
