// Load the reviewed market prices and catalogue translations into Convex.
// Usage: node --import tsx scripts/i18n/seed-convex.ts [--prod] [--languages ar,de]
// Development uses the deployment in .env.local. Seeds are repeatable.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { languages } from "../../lib/i18n/config";

const args = process.argv.slice(2);
const prod = args.includes("--prod");
const only = args
  .find((arg) => arg.startsWith("--languages="))
  ?.slice("--languages=".length)
  .split(",");
const CHUNK = 30;

function run(fn: string, payload: unknown) {
  const output = execFileSync(
    "pnpm",
    ["exec", "convex", "run", fn, JSON.stringify(payload), ...(prod ? ["--prod"] : [])],
    { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"], maxBuffer: 16 * 1024 * 1024 },
  );
  const json = output.slice(output.indexOf("{"));
  return JSON.parse(json) as Record<string, number | string>;
}

const target = prod ? "production" : "development";
const table = JSON.parse(readFileSync("lib/markets/price-table.json", "utf8"));
const pricing = run("seedI18n:marketPricing", {
  revision: table.revision,
  markets: Object.entries(table.markets).map(([market, data]) => ({
    market,
    ...(data as object),
  })),
});
console.log(`${target} marketPricing`, pricing);

for (const language of Object.keys(languages).filter((code) => code !== "en")) {
  if (only && !only.includes(language)) continue;
  for (const kind of ["products", "recipes"] as const) {
    const path = `content/i18n/${language}/${kind}.json`;
    if (!existsSync(path)) {
      console.log(`${target} ${language} ${kind}: no file yet`);
      continue;
    }
    const records = Object.entries(JSON.parse(readFileSync(path, "utf8"))).map(
      ([slug, record]) => ({ slug, ...(record as object) }),
    );
    const totals = { inserted: 0, replaced: 0, kept: 0, unknown: 0 };
    for (let i = 0; i < records.length; i += CHUNK) {
      const result = run(
        kind === "products" ? "seedI18n:productTranslations" : "seedI18n:recipeTranslations",
        { language, records: records.slice(i, i + CHUNK) },
      );
      for (const key of Object.keys(totals) as (keyof typeof totals)[])
        totals[key] += Number(result[key] ?? 0);
    }
    console.log(`${target} ${language} ${kind}`, totals);
  }
}
