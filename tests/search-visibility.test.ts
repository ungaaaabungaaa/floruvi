import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { NextRequest } from "next/server";
import { preferredLocale, proxy } from "../proxy";
import { llmsText } from "../lib/llms";
import type { Messages } from "../lib/i18n/messages";

const messages = JSON.parse(readFileSync("messages/en.json", "utf8")) as Messages;

function visit(userAgent: string, { country = "DE", mode = "navigate" } = {}) {
  return new NextRequest("https://floruvi.vercel.app/products/spinach", {
    headers: {
      "user-agent": userAgent,
      "x-vercel-ip-country": country,
      "accept-language": "de-DE,de;q=0.9",
      ...(mode ? { "sec-fetch-mode": mode } : {}),
    },
  });
}

test("AI assistants and crawlers keep the URL they asked for; people get their country", () => {
  for (const agent of [
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ChatGPT-User/1.0; +https://openai.com/bot)",
    "Mozilla/5.0 (compatible; Claude-User/1.0; +Claude-User@anthropic.com)",
    "Mozilla/5.0 (compatible; Perplexity-User/1.0; +https://perplexity.ai/perplexity-user)",
    "Mozilla/5.0 (compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)",
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)",
  ])
    assert.equal(preferredLocale(visit(agent)), null, agent);
  const person = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36";
  assert.equal(preferredLocale(visit(person)), "de-de");
  // A fetcher that copies a browser user agent is still not a page load.
  assert.equal(preferredLocale(visit(person, { mode: "" })), null);
  assert.equal(preferredLocale(visit(person, { mode: "cors" })), null);
});

test("mixed-case addresses redirect once to the lowercase URL", () => {
  const redirect = (path: string) => {
    const response = proxy(new NextRequest(`https://floruvi.vercel.app${path}`));
    return [response.status, response.headers.get("location")];
  };
  assert.deepEqual(redirect("/EN-GB/Products?q=Basil"), [308, "https://floruvi.vercel.app/en-gb/products?q=Basil"]);
  assert.deepEqual(redirect("/EN-IN/Products"), [308, "https://floruvi.vercel.app/products"]);
  // Percent escapes are case-insensitive, so they never cause a redirect.
  assert.notEqual(redirect("/recipes/caf%C3%A9")[0], 308);
});

test("llms.txt lists every product and recipe once with absolute links and filled facts", () => {
  const text = llmsText({
    site: "https://floruvi.vercel.app",
    messages,
    categories: [
      { slug: "leafy-greens", name: "Leafy greens" },
      { slug: "herbs", name: "Herbs" },
    ],
    products: [
      {
        slug: "spinach",
        category: "leafy-greens",
        name: "Spinach",
        description: "Leaves for bowls and quick cooking.",
        price: { amountMinor: 10500, currency: "INR", packLabel: "250 g" },
      },
      { slug: "basil", category: "herbs", name: "Basil", description: "Sweet leaves.", price: null },
    ],
    recipes: [{ slug: "green-salad", name: "Green salad", description: "Crisp leaves.", minutes: 10 }],
    deliveryFeeMinor: 9900,
  });
  assert.equal(text.match(/\(https:\/\/floruvi\.vercel\.app\/products\/spinach\)/g)?.length, 1);
  assert.match(text, /- \[Spinach\]\(https:\/\/floruvi\.vercel\.app\/products\/spinach\): Leaves for bowls & quick cooking\. 250 g: ₹105\./);
  assert.match(text, /- \[Basil\]\(https:\/\/floruvi\.vercel\.app\/products\/basil\): Sweet leaves\.$/m);
  assert.match(text, /\/recipes\/green-salad\): Crisp leaves\. \(10 min\)/);
  assert.match(text, /₹99 per delivery/);
  assert.doesNotMatch(text, /\{\w+\}|undefined|null|NaN/);
});

test("meta descriptions fit search results and keep the price complete", async () => {
  const { clampText, fitDescription, DESCRIPTION_LIMIT } = await import("../lib/meta-description");
  const long = "Versatile green leaves for fresh bowls or quick, gentle cooking. ".repeat(5);
  const clamped = clampText(long);
  assert.ok(clamped.length <= DESCRIPTION_LIMIT);
  assert.ok(clamped.endsWith("…"));
  assert.equal(clampText("Short text."), "Short text.");
  const fitted = fitDescription((text) => `${text} 1 bunch: ₹105.`, long);
  assert.ok(fitted.length <= DESCRIPTION_LIMIT);
  assert.ok(fitted.endsWith("1 bunch: ₹105."));
  assert.ok(clampText("あ".repeat(300)).length <= DESCRIPTION_LIMIT);
});
