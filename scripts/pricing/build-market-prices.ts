// Build export-market price rates from the reviewed local retail study.
// Usage: node --import tsx scripts/pricing/build-market-prices.ts
//
// Method (owner decision, 16 September 2026: local retail price + 40%):
// 1. Each local observation becomes a local-to-India price ratio for the same
//    benchmark crop, per gram or per piece (local currency per rupee).
// 2. Per market, the produce rate is the median ratio of vegetables, fruiting
//    crops, roots and microgreens. Herbs get their own median rate when a market
//    has at least three herb observations, because herb prices differ most.
// 3. A crop that was observed directly uses the median ratio of its own
//    observations, limited to half to double its group rate so that one unusual
//    listing cannot distort the price. Other crops use the group rate.
// 4. A product's local retail estimate is its Indian retail benchmark × the
//    rate. The Floruvi price is that estimate × 1.40, rounded up to a clean step.
//    At runtime the stored INR price (already retail × 1.40) × rate gives the same.
import { readFileSync, writeFileSync } from "node:fs";
import { pricingBenchmarks } from "../../convex/pricingData";
import { cropCatalogue } from "../../convex/catalogueData";
import { markets, type Market } from "../../lib/i18n/config";
import { currencyExponent, type CurrencyCode } from "../../lib/i18n/format";

const REVISION = "2026-09-16-local-retail-plus-40-v1";
const MARKUP = 1.4;
const MIN_HERB_OBSERVATIONS = 3;
const CLAMP = { low: 0.5, high: 2 };

// Clean price steps in major units, rounded up so the markup is at least 40%.
const steps: Record<Exclude<Market, "in">, number> = {
  ae: 0.25, sa: 0.25, qa: 0.25, kw: 0.05, om: 0.05, bh: 0.05, iq: 250,
  de: 0.05, nl: 0.05, jp: 10, gb: 0.05, np: 5, bd: 5, my: 0.1, lk: 10, uz: 500,
};

type Observation = {
  benchmark: string;
  retailer: string;
  url: string;
  productTitle: string;
  packText: string;
  packGrams: number | null;
  packCount: number | null;
  price: number;
  tier: string;
  evidence: string;
};
type Research = { market: Market; currency: string; researchedOn: string; observations: Observation[] };
type Adjustments = {
  excluded: { market: string; index: number; reason: string }[];
  regularPrice: { market: string; index: number; price: number; reason: string }[];
};

// Benchmark → Indian retail product used for the comparison.
const benchmarkSource: Record<string, string> = {
  "microgreens-live-tray": "radish-microgreens-live-tray",
  "edible-flowers": "viola-flowers",
};
// Catalogue products that share a benchmark's Indian price basis.
const benchmarkProducts: Record<string, string[]> = {
  "microgreens-live-tray": cropCatalogue
    .filter((c) => c.slug.endsWith("-live-tray"))
    .map((c) => c.slug),
};
// Standard weights used only when a listing gives a count without a weight.
const pieceGrams: Record<string, number> = {
  "butterhead-lettuce": 185, cucumber: 300, "bell-peppers": 180, zucchini: 250,
};
const bunchGrams: Record<string, number> = {
  "sweet-basil": 75, mint: 75, coriander: 75, "flat-leaf-parsley": 75, spinach: 250, "curly-kale": 250,
};
const perPiece = new Set(["butterhead-lettuce", "bell-peppers", "microgreens-live-tray"]);

const benchmarkCategory = (benchmark: string) =>
  cropCatalogue.find((c) => c.slug === (benchmarkSource[benchmark] ?? benchmark))?.category;

/** Indian retail price per gram or per piece, in rupees. */
function indiaUnitPrice(benchmark: string) {
  const slug = benchmarkSource[benchmark] ?? benchmark;
  const row = pricingBenchmarks.find((p) => p.slug === slug);
  if (!row) throw new Error(`No Indian benchmark for ${benchmark}`);
  const rupees = row.retailMinor / 100;
  const label = row.packLabel;
  if (perPiece.has(benchmark)) {
    const count = Number(/^(\d+)\s/.exec(label)?.[1] ?? 1);
    return rupees / count;
  }
  const kg = /([\d.]+)\s*kg/.exec(label);
  if (kg) return rupees / (Number(kg[1]) * 1000);
  const range = /(\d+)[–-](\d+)\s*g/.exec(label);
  if (range) return rupees / ((Number(range[1]) + Number(range[2])) / 2);
  const grams = /(\d+)\s*g/.exec(label);
  if (grams) return rupees / Number(grams[1]);
  throw new Error(`Cannot read pack weight for ${slug}: ${label}`);
}

/** Local price per gram or per piece, or null when the listing cannot be compared. */
function localUnitPrice(o: Observation, price: number) {
  if (perPiece.has(o.benchmark)) {
    if (o.packCount) return price / o.packCount;
    if (o.packGrams) return (price / o.packGrams) * (pieceGrams[o.benchmark] ?? 185);
    return null;
  }
  if (o.packGrams) return price / o.packGrams;
  if (o.packCount && pieceGrams[o.benchmark]) return price / (o.packCount * pieceGrams[o.benchmark]);
  if (o.packCount && bunchGrams[o.benchmark]) return price / (o.packCount * bunchGrams[o.benchmark]);
  return null;
}

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

const adjustments: Adjustments = JSON.parse(readFileSync("docs/market-pricing/adjustments.json", "utf8"));
const table: Record<string, unknown> = {};
const csv = [
  "market,currency,slug,category,packLabel,indiaRetailInr,indiaFloruviInr,rate,localRetailEstimate,floruviPrice,basis",
];
const summary: string[] = [];

for (const market of Object.keys(steps) as Exclude<Market, "in">[]) {
  const research: Research = JSON.parse(
    readFileSync(`docs/market-pricing/research/${market}.json`, "utf8"),
  );
  const currency = markets[market].currency as CurrencyCode;
  if (research.currency !== currency) throw new Error(`${market}: currency mismatch`);
  const produce: number[] = [];
  const herbs: number[] = [];
  const byBenchmark: Record<string, number[]> = {};
  let used = 0;
  research.observations.forEach((o, index) => {
    if (adjustments.excluded.some((e) => e.market === market && e.index === index)) return;
    const price =
      adjustments.regularPrice.find((r) => r.market === market && r.index === index)?.price ?? o.price;
    const local = localUnitPrice(o, price);
    if (local === null) return;
    const ratio = local / indiaUnitPrice(o.benchmark);
    const category = benchmarkCategory(o.benchmark);
    if (category === "herbs") herbs.push(ratio);
    else if (category !== "edible-flowers") produce.push(ratio);
    (byBenchmark[o.benchmark] ??= []).push(ratio);
    used++;
  });
  if (produce.length < 5) throw new Error(`${market}: too few produce observations`);
  const produceRate = median(produce);
  const herbRate = herbs.length >= MIN_HERB_OBSERVATIONS ? median(herbs) : produceRate;
  const exponent = currencyExponent[currency];
  // Rates convert INR minor units into local minor units.
  const toMinor = (rate: number) => rate * 10 ** (exponent - 2);
  const rates = Object.fromEntries(
    [...new Set(cropCatalogue.map((c) => c.category))].map((category) => [
      category,
      Number(toMinor(category === "herbs" ? herbRate : produceRate).toPrecision(8)),
    ]),
  );
  const stepMinor = Math.round(steps[market] * 10 ** exponent);
  const productRates: Record<string, number> = {};
  const basis: Record<string, string> = {};
  for (const [benchmark, ratios] of Object.entries(byBenchmark)) {
    const group = benchmarkCategory(benchmark) === "herbs" ? herbRate : produceRate;
    const limited = Math.min(group * CLAMP.high, Math.max(group * CLAMP.low, median(ratios)));
    for (const slug of benchmarkProducts[benchmark] ?? [benchmark]) {
      productRates[slug] = Number(toMinor(limited).toPrecision(8));
      basis[slug] = `own median of ${ratios.length}${limited === median(ratios) ? "" : ", limited"}`;
    }
  }
  table[market] = {
    currency,
    stepMinor,
    researchedOn: research.researchedOn,
    observationsUsed: used,
    categoryRates: rates,
    productRates,
  };
  for (const product of cropCatalogue) {
    const benchmark = pricingBenchmarks.find((p) => p.slug === product.slug)!;
    const floruviInr = Math.round(benchmark.retailMinor * MARKUP);
    const rate = productRates[product.slug] ?? rates[product.category];
    const price = Math.ceil((floruviInr * rate) / stepMinor) * stepMinor;
    csv.push(
      [
        market,
        currency,
        product.slug,
        product.category,
        `"${benchmark.packLabel}"`,
        (benchmark.retailMinor / 100).toFixed(2),
        (floruviInr / 100).toFixed(2),
        rate,
        ((benchmark.retailMinor * rate) / 10 ** exponent).toFixed(exponent),
        (price / 10 ** exponent).toFixed(exponent),
        `"${
          basis[product.slug] ??
          (product.category === "herbs" && herbs.length >= MIN_HERB_OBSERVATIONS
            ? "herb median"
            : "produce median")
        }"`,
      ].join(","),
    );
  }
  summary.push(
    `| ${market} | ${currency} | ${used} | ${produce.length} | ${produceRate.toFixed(4)} | ${herbs.length} | ${herbRate.toFixed(4)}${herbs.length < MIN_HERB_OBSERVATIONS ? " (produce)" : ""} |`,
  );
}

writeFileSync(
  "lib/markets/price-table.json",
  `${JSON.stringify({ revision: REVISION, markup: MARKUP, markets: table }, null, 2)}\n`,
);
writeFileSync("docs/market-pricing/prices.csv", `${csv.join("\n")}\n`);
console.log("| market | currency | used | produce n | produce rate | herb n | herb rate |");
console.log("| --- | --- | --- | --- | --- | --- | --- |");
console.log(summary.join("\n"));
