# Languages, countries and search

16 September 2026. Owner decisions: the markets are India plus 16 export countries, each export country also has English, and first-time visitors go to their country version automatically.

## Versions and URLs

Each version is a language and a country. India English keeps the existing URLs.

| Country | Currency | Versions |
| --- | --- | --- |
| India | INR | `/` (English) |
| United Arab Emirates | AED | `/ar-ae`, `/en-ae` |
| Saudi Arabia | SAR | `/ar-sa`, `/en-sa` |
| Qatar | QAR | `/ar-qa`, `/en-qa` |
| Kuwait | KWD | `/ar-kw`, `/en-kw` |
| Oman | OMR | `/ar-om`, `/en-om` |
| Bahrain | BHD | `/ar-bh`, `/en-bh` |
| Iraq | IQD | `/ar-iq`, `/en-iq` |
| Germany | EUR | `/de-de`, `/en-de` |
| Netherlands | EUR | `/nl-nl`, `/en-nl` |
| Japan | JPY | `/ja-jp`, `/en-jp` |
| United Kingdom | GBP | `/en-gb` |
| Nepal | NPR | `/ne-np`, `/en-np` |
| Bangladesh | BDT | `/bn-bd`, `/en-bd` |
| Malaysia | MYR | `/ms-my`, `/en-my` |
| Sri Lanka | LKR | `/si-lk`, `/en-lk` |
| Uzbekistan | UZS | `/uz-uz`, `/en-uz` |

The export countries follow [APEDA's main fresh fruit & vegetable destinations](https://apeda.gov.in/FreshFruitsAndVegetables), plus Germany, Japan and the other Gulf states. All pages exist in all 32 versions. Product and recipe URLs keep their English slugs.

`proxy.ts` handles routing:

- `/en-in/...` redirects to the unprefixed India URL.
- A saved choice (cookie `floruvi-locale`, one year) wins.
- Otherwise, a first visit to an unprefixed URL uses Vercel's visitor country. The browser language picks between the local language & English. If neither matches, the UAE, Qatar, Kuwait & Bahrain use English, and the other countries use the local language.
- Search crawlers, link previews, non-GET requests and URLs that already have a version are never redirected.
- The country & language picker saves the choice and opens the same page in the new version.

## Translations

- Interface text: `messages/<language>.json`. English is the source.
- Product & recipe text: `content/i18n/<language>/products.json` & `recipes.json`. The English snapshot is `content/i18n/en/`, exported from production Convex with `node --import tsx scripts/i18n/extract-content.ts`.
- Each record stores a fingerprint of its English source. If English text changes in Convex, that product or recipe shows English until it is translated again. Prices, pack sizes, stock rules and links never depend on the translation.
- Check all files with `node --import tsx scripts/i18n/check.ts`. `pnpm test` also checks keys, plurals & coverage.
- Arabic uses right-to-left layout. Photographs & fades are mirrored so text keeps its quiet side. Numbers use Western digits in every language.
- Translations were written by AI translators working to a style brief. Ask a native speaker to review each language before paid advertising in that country, starting with the privacy notice.
- Enquiries stay in English for the farm: the checkout message lists English item names, the basket total & the country. Contact enquiries add the country to the city field.

## Search

- Every public page has a unique title & description, a canonical URL and `hreflang` links to all 32 versions plus `x-default` (India English).
- `<html lang>` & `dir` match the version. Open Graph & Twitter tags use the page image and locale.
- Sitemap: `/sitemap.xml` is an index of 32 files at `/sitemaps/<version>.xml`. Each lists 188 pages with `hreflang` alternates.
- Structured data: Organization & WebSite on every page; Product with Offer & BreadcrumbList on product pages; Recipe & BreadcrumbList on recipes; ItemList on the shop & recipe lists; AggregateOffer for boxes; FAQPage on the FAQ. Offers show the visible local price and do not claim stock.
- Cart, checkout & wishlist are `noindex`. `robots.txt` blocks everything outside Vercel production and blocks `/api/` in production.
- `siteUrl` uses `NEXT_PUBLIC_SITE_URL`, then Vercel's production domain. Set `NEXT_PUBLIC_SITE_URL` when the custom domain is live.

## After deployment

1. Submit `/sitemap.xml` in Google Search Console & Bing Webmaster Tools.
2. Test a product, recipe & FAQ page in Google's Rich Results Test.
3. After indexing, use URL Inspection on sample pages in several versions to confirm the Google-selected canonical matches the page.
4. Confirm first-visit redirects on the live site through a VPN in a supported country, using a private window. Vercel sets the country header itself, so it cannot be faked in a request.
