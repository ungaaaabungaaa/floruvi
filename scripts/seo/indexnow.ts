/**
 * Tells IndexNow search engines (Bing, Yandex, Seznam, Naver) about every public page.
 * The key is public by design: engines read it from https://floruvi.com/{key}.txt.
 * Usage: node --import tsx scripts/seo/indexnow.ts [SITE_URL] [--dry-run] [--match=REGEX]
 * --match submits only matching URLs, e.g. the pages a release changed.
 * Run after a production deployment that adds or changes public pages.
 */
const KEY = "5b1d2d545aceb671dfae98abd08c431d";
const BATCH = 10_000;

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const match = args.find((arg) => arg.startsWith("--match="))?.slice("--match=".length);
const filter = match ? new RegExp(match) : null;
const site = new URL(args.find((arg) => !arg.startsWith("--")) ?? "https://floruvi.com");

const pageLocs = (xml: string) =>
  [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => match[1].replace(/&amp;/g, "&"))
    .filter((url) => !/\.(webp|jpe?g|png|avif|gif)$/i.test(url));

async function text(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.text();
}

async function main() {
  const keyFile = new URL(`/${KEY}.txt`, site).toString();
  if ((await text(keyFile)).trim() !== KEY) throw new Error(`${keyFile} does not contain the key`);

  const sitemaps = pageLocs(await text(new URL("/sitemap.xml", site).toString()));
  const urls = new Set<string>();
  for (const sitemap of sitemaps) {
    for (const url of pageLocs(await text(sitemap))) {
      if (new URL(url).host === site.host && (!filter || filter.test(url))) urls.add(url);
    }
  }
  console.log(`IndexNow: ${urls.size} URLs from ${sitemaps.length} sitemaps on ${site.host}`);

  const list = [...urls];
  for (let start = 0; start < list.length; start += BATCH) {
    const urlList = list.slice(start, start + BATCH);
    if (dryRun) {
      console.log(`Dry run: would submit ${urlList.length} URLs`);
      continue;
    }
    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: site.host, key: KEY, keyLocation: keyFile, urlList }),
    });
    // 200 and 202 both mean the batch was accepted.
    console.log(`Batch ${start / BATCH + 1}: ${urlList.length} URLs → HTTP ${response.status}`);
    if (!response.ok) {
      console.error(await response.text());
      process.exitCode = 1;
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
