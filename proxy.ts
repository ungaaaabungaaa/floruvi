import { NextResponse, type NextRequest } from "next/server";
import {
  LOCALE_COOKIE,
  defaultLocale,
  isLocale,
  languageForMarket,
  marketForCountry,
  type Locale,
} from "@/lib/i18n/config";

// Crawlers, AI assistants fetching for a user, and link previews always see the
// URL they requested. Their data-centre country is not the reader's country.
const AUTOMATED =
  /bot|crawl|spider|slurp|mediapartners|facebookexternalhit|embedly|whatsapp|telegram|discord|slack|skype|preview|lighthouse|pagespeed|headless|curl|wget|python-requests|go-http-client|chatgpt-user|claude-user|perplexity-user|mistralai-user|meta-external|cohere-ai|googleother/i;
const YEAR = 60 * 60 * 24 * 365;

/** A saved choice wins. Otherwise use the visitor's country on a first visit. */
export function preferredLocale(request: NextRequest): Locale | null {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(saved)) return saved;
  // Only a person's page load moves them: browsers mark it "navigate";
  // crawlers, AI fetchers and prefetches do not.
  if (request.headers.get("sec-fetch-mode") !== "navigate") return null;
  if (AUTOMATED.test(request.headers.get("user-agent") ?? "")) return null;
  const market = marketForCountry(request.headers.get("x-vercel-ip-country"));
  if (!market || market === "in") return null;
  const language = languageForMarket(request.headers.get("accept-language"), market);
  return `${language}-${market}`;
}

// Marks our own rewrite so the India rule below never redirects it back, even
// when a host name difference makes Next.js run this proxy on the rewrite again.
const REWRITTEN = "x-floruvi-locale";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // One address per page: /Products or /EN-GB/FAQ go to the lowercase URL in
  // one step. Percent escapes such as %C3 keep their case.
  const lower = pathname.replace(/%[0-9A-F]{2}|[A-Z]+/gi, (part) =>
    part.startsWith("%") ? part : part.toLowerCase(),
  );
  if (lower !== pathname) {
    const url = request.nextUrl.clone();
    const india = `/${defaultLocale}`;
    url.pathname =
      lower === india || lower.startsWith(`${india}/`) ? lower.slice(india.length) || "/" : lower;
    return NextResponse.redirect(url, 308);
  }
  const first = pathname.split("/")[1] ?? "";

  // India English lives at unprefixed URLs; keep a single canonical address.
  if (first === defaultLocale) {
    if (request.headers.get(REWRITTEN)) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(defaultLocale.length + 1) || "/";
    return NextResponse.redirect(url, 308);
  }
  if (isLocale(first)) return NextResponse.next();

  const url = request.nextUrl.clone();
  const preferred = preferredLocale(request);
  const readOnly = request.method === "GET" || request.method === "HEAD";
  if (preferred && preferred !== defaultLocale && readOnly) {
    url.pathname = `/${preferred}${pathname === "/" ? "" : pathname}`;
    const response = NextResponse.redirect(url, 307);
    response.cookies.set(LOCALE_COOKIE, preferred, {
      path: "/",
      maxAge: YEAR,
      sameSite: "lax",
    });
    return response;
  }
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  const headers = new Headers(request.headers);
  headers.set(REWRITTEN, defaultLocale);
  return NextResponse.rewrite(url, { request: { headers } });
}

export const config = {
  // Skip API routes, the owner's admin pages, Next.js internals and any file with an extension.
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
