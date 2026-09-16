import test from "node:test";
import assert from "node:assert/strict";
import { marketPrice, ceilToStep } from "../lib/markets/prices";
import table from "../lib/markets/price-table.json";
import { reviewBasket } from "../lib/pricing";
import { boxContents } from "../lib/boxes";
import { cropCatalogue } from "../convex/catalogueData";
import { pricingBenchmarks } from "../convex/pricingData";
import {
  isLocale,
  languageForMarket,
  localizePath,
  locales,
  marketCodes,
  marketForCountry,
  markets,
  stripLocale,
} from "../lib/i18n/config";
import { currencyExponent, formatCurrency, plural } from "../lib/i18n/format";
import { withCountry } from "../lib/i18n/country";

const seedProducts = cropCatalogue.map((crop) => {
  const benchmark = pricingBenchmarks.find((p) => p.slug === crop.slug)!;
  return {
    slug: crop.slug,
    name: crop.name,
    category: crop.category,
    price: {
      amountMinor: Math.round((benchmark.retailMinor * 140) / 100),
      currency: "INR",
      packLabel: benchmark.packLabel,
    },
  };
});

test("every export market prices every catalogue product in its own currency", () => {
  const exportMarkets = marketCodes.filter((m) => m !== "in");
  assert.deepEqual(Object.keys(table.markets).sort(), [...exportMarkets].sort());
  for (const market of exportMarkets) {
    const data = table.markets[market as keyof typeof table.markets];
    for (const product of seedProducts) {
      const price = marketPrice(product, market);
      assert.ok(price, `${market}: ${product.slug}`);
      assert.equal(price.currency, markets[market].currency);
      assert.ok(Number.isSafeInteger(price.amountMinor) && price.amountMinor > 0);
      assert.equal(price.amountMinor % data.stepMinor, 0, `${market} step`);
      assert.equal(price.packLabel, product.price.packLabel);
    }
  }
});

test("export prices are local retail estimates plus at least 40 percent, rounded up", () => {
  for (const market of marketCodes.filter((m) => m !== "in")) {
    const data = table.markets[market as keyof typeof table.markets];
    for (const product of seedProducts) {
      const rates = data.productRates as Record<string, number>;
      const rate = rates[product.slug] ?? data.categoryRates[product.category as keyof typeof data.categoryRates];
      const retail = pricingBenchmarks.find((p) => p.slug === product.slug)!.retailMinor * rate;
      const price = marketPrice(product, market)!.amountMinor;
      assert.ok(price >= Math.round(retail * 1.4) - 1, `${market}: ${product.slug}`);
      assert.ok(price - product.price.amountMinor * rate < data.stepMinor);
    }
  }
  assert.equal(ceilToStep(101, 25), 125);
  assert.equal(ceilToStep(100, 25), 100);
});

test("India keeps the Convex INR price and invalid prices never become export prices", () => {
  const basil = seedProducts.find((p) => p.slug === "sweet-basil")!;
  assert.deepEqual(marketPrice(basil, "in"), basil.price);
  assert.equal(marketPrice({ ...basil, price: null }, "ae"), null);
  assert.equal(
    marketPrice({ ...basil, price: { ...basil.price, currency: "USD" } }, "ae"),
    null,
  );
  assert.equal(marketPrice({ ...basil, slug: "new-crop", category: "unknown" }, "ae"), null);
  assert.equal(
    marketPrice({ ...basil, slug: "new-herb" }, "ae")?.currency,
    "AED",
    "a new product in a known category uses the category rate",
  );
});

test("export baskets use market currency and leave delivery to be quoted", () => {
  const priced = seedProducts.map((product) => ({
    ...product,
    price: marketPrice(product, "de"),
  }));
  const box = reviewBasket(
    [
      { slug: "box-family-weekly", quantity: 1 },
      { slug: "sweet-basil", quantity: 2 },
    ],
    priced,
    { currency: "INR", deliveryFeeMinor: 9900 },
    "de",
  );
  const basil = priced.find((p) => p.slug === "sweet-basil")!.price!.amountMinor;
  const boxTotal =
    boxContents.reduce(
      (sum, item) =>
        sum + priced.find((p) => p.slug === item.slug)!.price!.amountMinor * item.quantity,
      0,
    ) * 4;
  assert.equal(box.currency, "EUR");
  assert.equal(box.delivery, null);
  assert.equal(box.deliveryQuoted, true);
  assert.equal(box.subtotal, boxTotal + basil * 2);
  assert.equal(box.total, box.subtotal);
  // INR prices sent to an export review are rejected rather than mixed.
  assert.equal(
    reviewBasket([{ slug: "sweet-basil", quantity: 1 }], seedProducts, null, "de").total,
    null,
  );
});

test("money uses ISO minor units and local formatting", () => {
  assert.equal(currencyExponent.KWD, 3);
  assert.equal(currencyExponent.JPY, 0);
  assert.equal(formatCurrency(13860, "INR", "en-IN"), "₹138.60");
  assert.equal(formatCurrency(10500, "INR", "en-IN"), "₹105");
  assert.match(formatCurrency(2350, "KWD", "en-KW"), /^KWD\s2\.350$/);
  assert.equal(formatCurrency(480, "JPY", "ja-JP"), "￥480");
  assert.match(formatCurrency(1250000, "IQD", "en-IQ"), /^IQD\s1,250$/);
  assert.match(formatCurrency(875, "AED", "ar-AE"), /8\.75/);
  assert.equal(formatCurrency(null, "EUR", "de-DE", "—"), "—");
  assert.equal(plural("ar-AE", 2, { two: "{count} منتجان", other: "{count} منتجات" }), "2 منتجان");
  assert.equal(plural("en-GB", 1, { one: "{count} item", other: "{count} items" }), "1 item");
});

test("locale URLs keep India unprefixed and every other version explicit", () => {
  assert.equal(locales.length, 32);
  assert.ok(locales.every(isLocale));
  assert.equal(isLocale("en-us"), false);
  assert.equal(localizePath("en-in", "/products?category=herbs"), "/products?category=herbs");
  assert.equal(localizePath("ar-ae", "/"), "/ar-ae");
  assert.equal(localizePath("ar-ae", "/de-de/products/spinach"), "/ar-ae/products/spinach");
  assert.equal(stripLocale("/ja-jp/faq#delivery"), "/faq#delivery");
  assert.equal(stripLocale("/en-in"), "/");
  assert.equal(stripLocale("/xx-yy/products"), "/xx-yy/products");
  assert.equal(localizePath("de-de", "https://example.com"), "https://example.com");
});

test("first-visit language follows the browser within the visitor's market", () => {
  assert.equal(marketForCountry("ae"), "ae");
  assert.equal(marketForCountry("US"), undefined);
  assert.equal(languageForMarket("en-US,en;q=0.9", "ae"), "en");
  assert.equal(languageForMarket("ar-AE,ar;q=0.9,en;q=0.8", "ae"), "ar");
  assert.equal(languageForMarket("hi-IN", "ae"), "en", "Gulf expat fallback");
  assert.equal(languageForMarket("hi-IN", "sa"), "ar");
  assert.equal(languageForMarket("fr;q=0.9,de;q=0.1", "de"), "de");
  assert.equal(languageForMarket("en;q=0.5,ja;q=0.9", "jp"), "ja");
  assert.equal(languageForMarket("", "gb"), "en");
});

test("export enquiries record the country without changing the stored shape", () => {
  assert.equal(withCountry("Dubai", "ae"), "Dubai, United Arab Emirates");
  assert.equal(withCountry("Dubai, United Arab Emirates", "ae"), "Dubai, United Arab Emirates");
  assert.equal(withCountry("Hyderabad", "in"), "Hyderabad");
  assert.equal(withCountry("Hyderabad", "zz"), "Hyderabad");
  assert.ok(withCountry("x".repeat(100), "de").length <= 100);
});
