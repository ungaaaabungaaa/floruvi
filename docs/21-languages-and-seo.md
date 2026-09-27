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
- Only a real browser page load (`Sec-Fetch-Mode: navigate`) is redirected. Search crawlers, AI assistants, link previews, prefetches, non-GET requests and URLs that already have a version are never redirected.
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
- Sitemap: `/sitemap.xml` is an index of 32 files at `/sitemaps/<version>.xml`. Each lists 190 pages with `hreflang` alternates.
- Structured data: Organization (with the 17 countries served) & WebSite on every page; Product with Offer & BreadcrumbList on product pages; Recipe (with crop keywords) & BreadcrumbList on recipes; ItemList on the shop & recipe lists; AggregateOffer for boxes; FAQPage on the FAQ. Offers show the visible local price and do not claim stock.
- Product titles: India reads "Order {name} online in India"; export versions read "{name} from India – {country}", so the country is not mistaken for the origin. Product pages show the India delivery fee next to the price.
- Recipe descriptions add the name, time, servings & crops, because many recipes share an intro.
- Shop search and the chat assistant accept local names in English letters and Hindi script (palak, kheera, muli, पालक), common spelling variants, and extra words such as "chahiye". The list is in `lib/search-aliases.ts`; see [shipping & languages research](28-shipping-and-languages-research.md).
- FAQ & box answers are in the page HTML (native `<details>`), so search engines & AI assistants can read them. The shop & home product grids render in place in the first HTML.
- `/llms.txt` gives AI assistants the main pages, every product with its India price, the FAQ answers & all recipes, from live data.
- Cart, checkout & wishlist are `noindex`. `robots.txt` blocks everything outside Vercel production and blocks `/api/` in production. AI search crawlers are allowed.
- `proxy.ts` never redirects search crawlers or AI assistants that fetch a page for a user (ChatGPT, Claude, Perplexity). Their server's country is not the reader's country.
- Mixed-case URLs redirect to lowercase in one step (308); percent escapes keep their case. Removed pages redirect to their replacement (`next.config.ts`); `/wholesale` is temporary (307) because a wholesale page may return.
- `siteUrl` uses `NEXT_PUBLIC_SITE_URL`, then Vercel's production domain. Production uses `https://floruvi.com` (28 September 2026); `floruvi.vercel.app` and `www.floruvi.com` redirect to it with 308 (`next.config.ts`).

## Open search decisions (owner)

Checked 27 September 2026 with the ai-seo, site-architecture, programmatic-seo, seo-audit & schema skills. These need the owner:

1. **Homepage testimonials & claims.** The six quotes use stock portraits while no orders are live, and "No harmful chemicals" & "Locally grown" have no evidence (and "locally grown" shows on export versions). Replace them with real, consented quotes & proven facts, or remove them. Never mark them up as reviews.
2. **"Organic" or "pesticide-free".** Do not use these words until there is NPOP or PGS-India certification (organic) or a lab residue report (pesticide-free). Then show the certificate or report.
3. **Category pages.** The shop has no indexable page for head terms such as "microgreens" (22 products) or "leafy greens" (24). Proposal: six `/products/category/{slug}` pages, each with 100–150 words of real copy.
4. **Duplicate language versions.** The 17 English & 7 Arabic versions of FAQ, recipes, privacy & how-we-grow are identical apart from the country. Proposal: point those export copies' canonical to the main version and keep product, shop & box pages localized. Otherwise, watch Search Console for "Duplicate, Google chose different canonical".
5. **Product page content.** One storage text is shared by 81 products and appears twice per page; 72 of 88 recipes share 12 descriptions. Write crop-specific storage text & unique recipe intros.
6. **Homepage title.** It has the tagline but no product words, e.g. "Fresh greens, herbs & microgreens | Floruvi".
7. **Visible product breadcrumb** (schema has one, the page does not), a Contact link in the mobile menu, and banner slogans rendered as `<h2>` (32 on the shop page).
8. **Merchant data.** The owner confirmed these on 28 September 2026: delivery within 2 days to every PIN code in India, a flat ₹99 per basket with individual produce, and no returns except for our mistakes (see `/shipping` and `/refunds`). Next step (proposal): add `shippingDetails` and `hasMerchantReturnPolicy` to product offers. Real farm photos and a Google Business Profile (only with a real location or service area) will help most.

## After deployment

1. Submit `/sitemap.xml` in Google Search Console & Bing Webmaster Tools.
2. Test a product, recipe & FAQ page in Google's Rich Results Test.
3. After indexing, use URL Inspection on sample pages in several versions to confirm the Google-selected canonical matches the page.
4. Confirm first-visit redirects on the live site through a VPN in a supported country, using a private window. Vercel sets the country header itself, so it cannot be faked in a request.
