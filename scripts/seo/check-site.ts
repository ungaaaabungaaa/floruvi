/**
 * Read-only HTTP checks against a running Floruvi site. No browser or provider login.
 * Usage: node --import tsx scripts/seo/check-site.ts BASE_URL [CANONICAL_ORIGIN]
 * CANONICAL_ORIGIN defaults to SEO_CANONICAL_ORIGIN, then BASE_URL.
 * Example: ... http://127.0.0.1:3100 https://floruvi.com
 * Extraction targets our server-rendered HTML/XML; this is not a general HTML validator.
 */
import assert from "node:assert/strict";
import { categorySlugs } from "../../lib/category-pages";
import {
  defaultLocale,
  locales,
  parseLocale,
  type Locale,
} from "../../lib/i18n/config";

type Data = Record<string, unknown>;
type Attributes = Record<string, string>;
type Page = { html: string; headers: Headers; status: number };
type Entry = {
  url: string;
  path: string;
  locale: Locale;
  alternates: Map<string, string>;
};

const usage =
  "Usage: node --import tsx scripts/seo/check-site.ts BASE_URL [CANONICAL_ORIGIN]";
const args = process.argv.slice(2);
if (args.includes("--help")) {
  console.log(usage);
  process.exit(0);
}
assert(args.length >= 1 && args.length <= 2, usage);
function origin(value: string) {
  const url = new URL(value);
  assert(
    ["http:", "https:"].includes(url.protocol),
    "Use an HTTP or HTTPS origin",
  );
  assert(
    !url.username &&
      !url.password &&
      !url.search &&
      !url.hash &&
      url.pathname === "/",
    "Use an origin without credentials, path, query or fragment",
  );
  return url.origin;
}
const base = origin(args[0]);
const canonicalOrigin = origin(
  args[1] ?? process.env.SEO_CANONICAL_ORIGIN ?? base,
);
const started = Date.now();
let requests = 0;
let failures = 0;
const errors: string[] = [];
const absolute = (path: string) => new URL(path, canonicalOrigin).href;
const localePath = (locale: Locale, path: string) =>
  locale === defaultLocale ? path : `/${locale}${path === "/" ? "" : path}`;
const tag = (locale: Locale) => parseLocale(locale).tag.toLowerCase();
const barePath = (path: string, locale: Locale) => {
  if (locale === defaultLocale) {
    assert(
      !/^\/[a-z]{2}-[a-z]{2}(?:\/|$)/.test(path),
      "India URL must not have a locale prefix",
    );
    return path;
  }
  assert(
    path === `/${locale}` || path.startsWith(`/${locale}/`),
    `URL does not belong to ${locale}: ${path}`,
  );
  return path.slice(locale.length + 1) || "/";
};

function decode(value: string) {
  const named: Record<string, string> = {
    amp: "&",
    quot: '"',
    apos: "'",
    lt: "<",
    gt: ">",
    nbsp: " ",
  };
  return value.replace(
    /&(#x[0-9a-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi,
    (whole, entity: string) => {
      if (!entity.startsWith("#")) return named[entity.toLowerCase()] ?? whole;
      const code =
        entity[1].toLowerCase() === "x"
          ? parseInt(entity.slice(2), 16)
          : Number(entity.slice(1));
      return code >= 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole;
    },
  );
}
function attributes(source: string): Attributes {
  return Object.fromEntries(
    [
      ...source.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g),
    ].map((match) => [
      match[1].toLowerCase(),
      decode(match[2] ?? match[3] ?? match[4]),
    ]),
  );
}
const tags = (html: string, name: string) =>
  [...html.matchAll(new RegExp(`<${name}\\b([^>]*)>`, "gi"))].map((match) =>
    attributes(match[1]),
  );
const blocks = (html: string, name: string) =>
  [
    ...html.matchAll(
      new RegExp(`<${name}\\b([^>]*)>([\\s\\S]*?)<\\/${name}\\s*>`, "gi"),
    ),
  ].map((match) => ({ attrs: attributes(match[1]), content: match[2] }));
const markup = (html: string) =>
  html.replace(
    /<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>|<!--[\s\S]*?-->/gi,
    "",
  );
const text = (html: string) =>
  decode(markup(html).replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
const hasClass = (attrs: Attributes, name: string) =>
  (attrs.class ?? "").split(/\s+/).includes(name);
function data(value: unknown, label: string): Data {
  assert(
    value && typeof value === "object" && !Array.isArray(value),
    `${label}: expected an object`,
  );
  return value as Data;
}
function array(value: unknown, label: string): unknown[] {
  assert(Array.isArray(value), `${label}: expected an array`);
  return value;
}
function url(value: unknown, label: string, relative = false) {
  assert(typeof value === "string" && value, `${label}: URL missing`);
  const parsed = relative ? new URL(value, canonicalOrigin) : new URL(value);
  assert.equal(parsed.origin, canonicalOrigin, `${label}: wrong origin`);
  assert(
    !parsed.username && !parsed.password && !parsed.search && !parsed.hash,
    `${label}: unexpected credentials, query or fragment`,
  );
  return parsed.href;
}
function sameSet(
  actual: Iterable<string>,
  expected: Iterable<string>,
  label: string,
) {
  assert.deepEqual(
    [...new Set(actual)].sort(),
    [...new Set(expected)].sort(),
    label,
  );
}
function schemas(html: string): Data[] {
  const result: Data[] = [];
  function visit(value: unknown) {
    if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === "object") {
      const node = value as Data;
      if (node["@type"]) result.push(node);
      Object.values(node).forEach(visit);
    }
  }
  for (const script of blocks(html, "script")) {
    if (script.attrs.type === "application/ld+json")
      visit(JSON.parse(script.content));
  }
  assert(result.length, "JSON-LD missing");
  return result;
}
function one(nodes: Data[], type: string) {
  const matches = nodes.filter((node) => node["@type"] === type);
  assert.equal(
    matches.length,
    1,
    `Expected one ${type}, found ${matches.length}`,
  );
  return matches[0];
}
function alternateMap(links: Attributes[], path: string) {
  assert.equal(
    links.length,
    locales.length + 1,
    `Expected ${locales.length + 1} language alternates`,
  );
  const result = new Map<string, string>();
  for (const link of links) {
    assert.equal(link.rel, "alternate", "Unexpected alternate relation");
    const language = link.hreflang?.toLowerCase();
    assert(
      language && !result.has(language),
      `Missing or duplicate hreflang: ${language}`,
    );
    result.set(language, url(link.href, `hreflang ${language}`));
  }
  for (const locale of locales)
    assert.equal(
      result.get(tag(locale)),
      absolute(localePath(locale, path)),
      `Wrong ${tag(locale)} alternate`,
    );
  assert.equal(
    result.get("x-default"),
    absolute(path),
    "Wrong x-default alternate",
  );
  return result;
}
async function get(path: string, expected = 200): Promise<Page> {
  requests++;
  const response = await fetch(new URL(path, base), {
    method: "GET",
    redirect: "manual",
    signal: AbortSignal.timeout(30_000),
    headers: {
      "User-Agent": "FloruviSEOCheck/1.0",
      Accept: "text/html,application/xml",
    },
  });
  assert.equal(
    response.status,
    expected,
    `${path}: expected HTTP ${expected}, got ${response.status}`,
  );
  return {
    html: await response.text(),
    headers: response.headers,
    status: response.status,
  };
}
async function inspect(label: string, task: () => void | Promise<void>) {
  try {
    await task();
  } catch (error) {
    failures++;
    const message = error instanceof Error ? error.message : String(error);
    // Assertion diffs can be long. Never print page bodies or complete responses.
    const concise = `${label}: ${message.split("\n").slice(0, 3).join(" ").slice(0, 360)}`;
    if (errors.length < 30) {
      errors.push(concise);
      console.error(`FAIL ${concise}`);
    }
  }
}
async function parallel<T>(items: T[], task: (item: T) => Promise<void>) {
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(4, items.length) }, async () => {
      while (next < items.length) await task(items[next++]);
    }),
  );
}
function pageBasics(page: Page, path: string, locale: Locale) {
  const clean = markup(page.html);
  const html = tags(clean, "html");
  assert.equal(html.length, 1, "Expected one html element");
  assert.equal(html[0].lang?.toLowerCase(), tag(locale), "Wrong html language");
  assert.equal(html[0].dir, parseLocale(locale).dir, "Wrong html direction");
  const h1 = blocks(clean, "h1");
  assert.equal(h1.length, 1, "Expected one h1");
  assert(text(h1[0].content), "Empty h1");
  const titles = blocks(clean, "title");
  assert.equal(titles.length, 1, "Expected one title");
  assert(text(titles[0].content), "Empty title");
  const meta = tags(clean, "meta");
  const description = meta.filter(
    (item) => item.name?.toLowerCase() === "description",
  );
  assert.equal(description.length, 1, "Expected one description");
  assert(description[0].content?.trim(), "Empty description");
  const robots = meta
    .filter((item) => /^(robots|googlebot|bingbot)$/i.test(item.name ?? ""))
    .map((item) => item.content)
    .join(" ");
  assert(
    !/\b(noindex|none)\b/i.test(
      `${robots} ${page.headers.get("x-robots-tag") ?? ""}`,
    ),
    "Public page has noindex",
  );
  const links = tags(clean, "link");
  const canonical = links.filter((item) => item.rel === "canonical");
  assert.equal(canonical.length, 1, "Expected one canonical");
  assert.equal(
    url(canonical[0].href, "canonical"),
    absolute(localePath(locale, path)),
    "Canonical is not self-referencing",
  );
  alternateMap(
    links.filter((item) => item.rel === "alternate" && item.hreflang),
    path,
  );
  return { clean, heading: text(h1[0].content), nodes: schemas(page.html) };
}
function productCards(html: string, locale: Locale) {
  return blocks(markup(html), "article")
    .filter((item) => hasClass(item.attrs, "product-card"))
    .map((card) => {
      const links = tags(card.content, "a")
        .filter((item) => item.href)
        .map((item) => url(item.href, "product card", true));
      const urls = [...new Set(links)];
      assert.equal(
        urls.length,
        1,
        "Each product card must link to one product",
      );
      const path = barePath(new URL(urls[0]).pathname, locale);
      assert(
        /^\/products\/[^/]+$/.test(path),
        `Invalid product card link: ${path}`,
      );
      const heading = blocks(card.content, "h3");
      assert.equal(heading.length, 1, "Product card heading missing");
      const art = tags(card.content, "div").find((item) =>
        hasClass(item, "product-art"),
      );
      const category = art?.class
        .split(/\s+/)
        .find((name) => name.startsWith("art-"))
        ?.slice(4);
      return { url: urls[0], path, name: text(heading[0].content), category };
    });
}

function categoryLinks(html: string, paths: string[], locale: Locale) {
  const anchors = blocks(markup(html), "a").filter(
    (anchor) => anchor.attrs.href,
  );
  for (const path of paths) {
    const expected = absolute(localePath(locale, path));
    assert(
      anchors.some(
        (anchor) =>
          new URL(anchor.attrs.href, canonicalOrigin).href === expected &&
          text(anchor.content),
      ),
      `Missing crawlable category link: ${localePath(locale, path)}`,
    );
  }
}

async function main() {
  console.log(
    `SEO HTTP check: ${base}; canonical origin: ${canonicalOrigin}; concurrency: 4`,
  );
  assert.equal(
    locales.length,
    32,
    "Update the expected locale contract before running this check",
  );
  const index = await get("/sitemap.xml");
  assert(/<sitemapindex\b/.test(index.html), "Sitemap index root missing");
  const files = blocks(index.html, "loc").map((item) =>
    url(decode(item.content.trim()), "sitemap index"),
  );
  assert.equal(files.length, locales.length, "Wrong sitemap file count");
  assert.equal(new Set(files).size, files.length, "Duplicate sitemap files");
  sameSet(
    files,
    locales.map((locale) => absolute(`/sitemaps/${locale}.xml`)),
    "Sitemap locale files differ",
  );

  const shop = await get("/products");
  pageBasics(shop, "/products", defaultLocale);
  const catalogue = productCards(shop.html, defaultLocale);
  assert(catalogue.length > 0, "The public catalogue is empty");
  assert.equal(
    new Set(catalogue.map((item) => item.url)).size,
    catalogue.length,
    "Duplicate catalogue product cards",
  );
  for (const product of catalogue)
    assert(
      categorySlugs.some((slug) => slug === product.category),
      `Unknown product category: ${product.category}`,
    );
  const populated = categorySlugs.filter((slug) =>
    catalogue.some((product) => product.category === slug),
  );
  const categoryPaths = populated.map((slug) => `/products/category/${slug}`);
  categoryLinks(shop.html, categoryPaths, defaultLocale);
  const byUrl = new Map<string, Entry>();
  const entriesByLocale = new Map<Locale, Entry[]>();
  await parallel(locales, async (locale) =>
    inspect(`/sitemaps/${locale}.xml`, async () => {
      const page = await get(`/sitemaps/${locale}.xml`);
      assert(
        /<urlset\b/.test(page.html) &&
          /xmlns:xhtml=["']http:\/\/www\.w3\.org\/1999\/xhtml["']/.test(
            page.html,
          ),
        "Sitemap namespaces missing",
      );
      const entries: Entry[] = [];
      for (const block of blocks(page.html, "url")) {
        const locations = blocks(block.content, "loc");
        assert.equal(locations.length, 1, "Sitemap entry needs one loc");
        const href = url(decode(locations[0].content.trim()), "sitemap loc");
        const path = barePath(new URL(href).pathname, locale);
        assert(
          !/^\/(admin|api|cart|checkout|wishlist)(\/|$)/.test(path),
          `Private or transactional URL in sitemap: ${path}`,
        );
        assert(!byUrl.has(href), `Duplicate sitemap loc: ${href}`);
        const entry = {
          url: href,
          path,
          locale,
          alternates: alternateMap(tags(block.content, "xhtml:link"), path),
        };
        byUrl.set(href, entry);
        entries.push(entry);
      }
      assert(entries.length, "Sitemap has no URLs");
      sameSet(
        entries
          .filter((entry) => entry.path.startsWith("/products/category/"))
          .map((entry) => entry.path),
        categoryPaths,
        "Published category sitemap URLs differ from the live catalogue",
      );
      sameSet(
        entries
          .filter((entry) => /^\/products\/[^/]+$/.test(entry.path))
          .map((entry) => entry.path),
        catalogue.map((product) => product.path),
        "Sitemap product URLs differ from the live catalogue",
      );
      entriesByLocale.set(locale, entries);
    }),
  );
  for (const [locale, entries] of entriesByLocale)
    await inspect(`${locale} sitemap reciprocity`, () => {
      sameSet(
        entries.map((entry) => entry.path),
        entriesByLocale.get(defaultLocale)?.map((entry) => entry.path) ?? [],
        "Locale sitemap paths differ",
      );
      for (const entry of entries)
        for (const [language, href] of entry.alternates) {
          const target = byUrl.get(href);
          assert(
            target,
            `${entry.path}: ${language} alternate is absent from sitemaps`,
          );
          assert.equal(
            target.alternates.get(tag(locale)),
            entry.url,
            `${entry.path}: ${language} alternate is not reciprocal`,
          );
        }
    });
  console.log(
    `Sitemaps checked: ${entriesByLocale.size}/${locales.length}; URLs: ${byUrl.size}; products: ${catalogue.length}; populated categories: ${populated.length}/${categorySlugs.length}`,
  );

  let checked = 0;
  const categories = locales.flatMap((locale) =>
    populated.map((slug) => ({ locale, slug })),
  );
  await parallel(categories, async ({ locale, slug }) => {
    const path = `/products/category/${slug}`;
    await inspect(localePath(locale, path), async () => {
      const page = await get(localePath(locale, path));
      const { clean, heading, nodes } = pageBasics(page, path, locale);
      const collection = one(nodes, "CollectionPage");
      assert.equal(
        collection.url,
        absolute(localePath(locale, path)),
        "CollectionPage URL differs",
      );
      assert.equal(
        collection.name,
        heading,
        "CollectionPage name differs from h1",
      );
      assert.equal(
        String(collection.inLanguage).toLowerCase(),
        tag(locale),
        "CollectionPage language differs",
      );
      const list = data(collection.mainEntity, "CollectionPage mainEntity");
      assert.equal(
        list["@type"],
        "ItemList",
        "CollectionPage needs an ItemList",
      );
      const items = array(list.itemListElement, "ItemList entries").map(
        (item) => data(item, "ListItem"),
      );
      const cards = productCards(clean, locale);
      assert(cards.length > 0, "Category has no visible product cards");
      assert.equal(
        list.numberOfItems,
        cards.length,
        "ItemList count differs from visible cards",
      );
      assert.equal(
        items.length,
        cards.length,
        "ItemList entries differ from visible card count",
      );
      const expected = catalogue
        .filter((product) => product.category === slug)
        .map((product) => absolute(localePath(locale, product.path)));
      sameSet(
        cards.map((card) => card.url),
        expected,
        "Category cards differ from the live catalogue",
      );
      items.forEach((item, index) => {
        assert.equal(
          item.position,
          index + 1,
          "ItemList positions must be sequential",
        );
        assert.equal(
          item.url,
          cards[index].url,
          "ItemList URL differs from visible card",
        );
        assert.equal(
          item.name,
          cards[index].name,
          "ItemList name differs from visible card",
        );
      });
      const breadcrumb = array(
        one(nodes, "BreadcrumbList").itemListElement,
        "Breadcrumb entries",
      ).map((item) => data(item, "Breadcrumb item"));
      assert.deepEqual(
        breadcrumb.map((item) => item.item),
        ["/", "/products", path].map((part) =>
          absolute(localePath(locale, part)),
        ),
        "Breadcrumb URLs differ",
      );
      breadcrumb.forEach((item, index) =>
        assert.equal(item.position, index + 1, "Breadcrumb positions differ"),
      );
      const nav = blocks(clean, "nav").find((item) =>
        hasClass(item.attrs, "breadcrumb"),
      );
      assert(nav, "Visible breadcrumb missing");
      const anchors = blocks(nav.content, "a");
      assert.equal(
        anchors.length,
        2,
        "Visible breadcrumb must link home and shop",
      );
      anchors.forEach((anchor, index) => {
        assert.equal(
          url(anchor.attrs.href, "breadcrumb link", true),
          breadcrumb[index].item,
          "Breadcrumb schema/link mismatch",
        );
        assert.equal(
          text(anchor.content),
          breadcrumb[index].name,
          "Breadcrumb schema/text mismatch",
        );
      });
      assert.equal(
        breadcrumb.at(-1)?.name,
        heading,
        "Breadcrumb page name differs from h1",
      );
    });
    checked++;
    if (checked % 24 === 0 || checked === categories.length)
      console.log(`Category HTML checked: ${checked}/${categories.length}`);
  });

  const sample = catalogue[0].path;
  for (const locale of [defaultLocale, "en-gb"] as Locale[])
    await inspect(`${locale} product and delivery policies`, async () => {
      const product = pageBasics(
        await get(localePath(locale, sample)),
        sample,
        locale,
      );
      const sampleCategory = catalogue[0].category;
      assert(sampleCategory, "Sample product category missing");
      categoryLinks(
        product.clean,
        [`/products/category/${sampleCategory}`],
        locale,
      );
      const home = pageBasics(await get(localePath(locale, "/")), "/", locale);
      categoryLinks(home.clean, categoryPaths, locale);
      if (locale !== defaultLocale) {
        const localShop = pageBasics(
          await get(localePath(locale, "/products")),
          "/products",
          locale,
        );
        categoryLinks(localShop.clean, categoryPaths, locale);
      }
      const offer = data(one(product.nodes, "Product").offers, "Product offer");
      const shipping = pageBasics(
        await get(localePath(locale, "/shipping")),
        "/shipping",
        locale,
      );
      pageBasics(await get(localePath(locale, "/refunds")), "/refunds", locale);
      const boxes = pageBasics(
        await get(localePath(locale, "/boxes")),
        "/boxes",
        locale,
      );
      for (const [name, page] of [
        ["product", product],
        ["shipping", shipping],
        ["boxes", boxes],
      ] as const) {
        assert(
          !page.nodes.some(
            (node) =>
              node["@type"] === "Organization" && "hasShippingService" in node,
          ),
          `${name}: organization shipping service could apply the produce fee to free boxes`,
        );
      }
      assert(
        !shipping.nodes.some((node) => node["@type"] === "ShippingService"),
        "Shipping policy must not publish a global produce shipping service",
      );
      if (locale === defaultLocale) {
        assert.equal(
          offer.priceCurrency,
          "INR",
          "India product currency differs",
        );
        const returns = data(
          offer.hasMerchantReturnPolicy,
          "India return policy",
        );
        assert.equal(
          returns.applicableCountry,
          "IN",
          "Return policy country differs",
        );
        assert.equal(
          returns.returnPolicyCategory,
          "https://schema.org/MerchantReturnNotPermitted",
          "Return policy differs from confirmed terms",
        );
        const details = data(offer.shippingDetails, "Offer shipping details");
        assert.equal(
          details["@type"],
          "OfferShippingDetails",
          "Offer shipping details type differs",
        );
        const service = data(
          details.hasShippingService,
          "Inline offer shipping service",
        );
        assert.equal(
          service["@type"],
          "ShippingService",
          "Product offer needs a full inline shipping service",
        );
        const conditions = data(
          service.shippingConditions,
          "Shipping conditions",
        );
        assert.equal(
          data(conditions.shippingDestination, "Shipping destination")
            .addressCountry,
          "IN",
          "Shipping country differs",
        );
        const rate = data(conditions.shippingRate, "Shipping rate");
        assert.equal(rate.currency, "INR", "Shipping currency differs");
        assert(
          typeof rate.value === "number" &&
            Number.isFinite(rate.value) &&
            rate.value >= 0,
          "Shipping rate invalid",
        );
        const rupees = [
          ...text(shipping.clean).matchAll(/₹\s*([\d,]+(?:\.\d+)?)/g),
        ].map((match) => Number(match[1].replaceAll(",", "")));
        assert(
          rupees.includes(rate.value),
          "Shipping schema fee is absent from visible policy text",
        );
      } else {
        assert(
          !offer.shippingDetails && !offer.hasMerchantReturnPolicy,
          "India delivery/return policies leaked onto an export offer",
        );
      }
    });
  await parallel(
    [
      "/products/category/not-a-real-category",
      "/ar-ae/products/category/not-a-real-category",
    ],
    async (path) =>
      inspect(path, async () => {
        await get(path, 404);
      }),
  );
  await parallel([defaultLocale, "de-de"] as Locale[], async (locale) =>
    inspect(`${locale} old category redirect`, async () => {
      const response = await get(localePath(locale, "/categories/herbs"), 308);
      const location = response.headers.get("location");
      assert(location, "Category redirect has no Location header");
      const target = new URL(location, base);
      assert(
        [base, canonicalOrigin].includes(target.origin),
        "Category redirect leaves the site",
      );
      assert.equal(
        target.pathname,
        localePath(locale, "/products/category/herbs"),
        "Old category redirects to the wrong page",
      );
      assert(
        !target.search && !target.hash,
        "Old category redirect contains a query or fragment",
      );
    }),
  );
  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  console.log(
    `${failures ? "FAIL" : "PASS"}: ${requests} GET requests; ${checked} category pages; ${byUrl.size} sitemap URLs; ${failures} failed checks; ${elapsed}s.`,
  );
  if (failures > errors.length)
    console.error(`${failures - errors.length} more failures omitted.`);
  if (failures) process.exitCode = 1;
}
main().catch((error: unknown) => {
  console.error(
    `FAIL: ${error instanceof Error ? error.message.split("\n")[0] : String(error)}`,
  );
  process.exitCode = 1;
});
