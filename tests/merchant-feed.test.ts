import test from "node:test";
import assert from "node:assert/strict";
import { convexTest } from "convex-test";
import {
  makeFunctionReference,
  type GenericDatabaseWriter,
  type SystemDataModel,
} from "convex/server";
import schema from "../convex/schema";
import {
  escapeMerchantXml,
  merchantItem,
  merchantSetupReady,
  merchantXml,
  merchantFeedResponse,
  type MerchantFeed,
} from "../lib/merchant-feed";

const product = {
  slug: "basil",
  name: "Basil",
  description: "Fresh basil leaves.",
  published: true,
  inStock: true,
  price: { amountMinor: 12345, currency: "INR" as const, packLabel: "250 g" },
};
const image = {
  url: "https://example.convex.cloud/api/storage/image",
  contentType: "image/webp",
  size: 1234,
};
const ready = {
  paymentsEnabled: true,
  liveKeyConfigured: true,
  secretConfigured: true,
  webhookConfigured: true,
  currency: "INR",
  deliveryFeeMinor: 9900,
};

test("Merchant setup requires enabled live payments, webhook and valid India shipping", () => {
  assert.equal(merchantSetupReady(ready), true);
  for (const key of [
    "paymentsEnabled",
    "liveKeyConfigured",
    "secretConfigured",
    "webhookConfigured",
  ] as const)
    assert.equal(merchantSetupReady({ ...ready, [key]: false }), false);
  for (const deliveryFeeMinor of [-1, 0.5, Infinity, NaN])
    assert.equal(merchantSetupReady({ ...ready, deliveryFeeMinor }), false);
  assert.equal(merchantSetupReady({ ...ready, currency: "USD" }), false);
  assert.equal(merchantSetupReady({ ...ready, deliveryFeeMinor: 0 }), true);
});

test("Merchant items exclude enquiries, exports, missing stock, invalid prices and fallback images", () => {
  assert.equal(merchantItem(product, image)?.priceMinor, 12345);
  assert.equal(
    merchantItem({ ...product, inStock: false }, image)?.inStock,
    false,
  );
  for (const update of [
    { published: false },
    { inStock: undefined },
    { slug: "box-single-weekly" },
    { price: null },
    { price: { ...product.price, currency: "USD" } },
    { price: { ...product.price, amountMinor: 0 } },
    { price: { ...product.price, amountMinor: 123.4 } },
    { price: { ...product.price, packLabel: "" } },
    { slug: "../hidden" },
    { description: "" },
  ])
    assert.equal(merchantItem({ ...product, ...update }, image), null);
  for (const update of [
    { url: null },
    { url: "/fallback.png" },
    { url: "http://localhost/photo.png" },
    { contentType: "text/html" },
    { size: 0 },
    { size: 16_000_001 },
  ])
    assert.equal(merchantItem(product, { ...image, ...update }), null);
});

test("Merchant XML escapes content and URLs, uses exact minor units, and adds no invented identifiers", () => {
  const item = merchantItem(
    {
      ...product,
      name: 'Basil & "leaves"',
      description: "<script>not executable</script> & herbs",
    },
    { ...image, url: "https://example.convex.cloud/api/storage/image?a=1&b=2" },
  )!;
  const xml = merchantXml(
    {
      status: "ready",
      items: [item, { ...item, id: "mint", slug: "mint", inStock: false }],
      deliveryFeeMinor: 9900,
    },
    "https://floruvi.com",
  );
  assert.match(xml, /xmlns:g="http:\/\/base.google.com\/ns\/1.0"/);
  assert.match(xml, /Basil &amp; &quot;leaves&quot;/);
  assert.match(xml, /&lt;script&gt;not executable&lt;\/script&gt;/);
  assert.match(xml, /a=1&amp;b=2/);
  assert.match(xml, /<g:price>123.45 INR<\/g:price>/);
  assert.match(xml, /<g:price>99.00 INR<\/g:price>/);
  assert.match(xml, /<g:link>https:\/\/floruvi.com\/products\/basil<\/g:link>/);
  assert.match(xml, /<g:availability>in_stock<\/g:availability>/);
  assert.match(xml, /<g:availability>out_of_stock<\/g:availability>/);
  assert.doesNotMatch(xml, /<g:(?:gtin|mpn|brand|identifier_exists)>/);
  assert.equal(escapeMerchantXml("a\u0000b\ud800c\ufffed\n🥬"), "abcd\n🥬");
});

test("disabled, empty and invalid feeds return uncached 503 responses", async () => {
  const disabled = merchantFeedResponse(
    { status: "disabled", message: "The product feed is not enabled." },
    "https://floruvi.com",
  );
  assert.equal(disabled.status, 503);
  assert.equal(disabled.headers.get("cache-control"), "no-store");
  assert.equal(disabled.headers.get("retry-after"), "3600");
  assert.equal(await disabled.text(), "The product feed is not enabled.");
  assert.equal(
    merchantFeedResponse(
      { status: "ready", items: [], deliveryFeeMinor: 9900 },
      "https://floruvi.com",
    ).status,
    503,
  );
  const feed: MerchantFeed = {
    status: "ready",
    items: [merchantItem(product, image)!],
    deliveryFeeMinor: 9900,
  };
  assert.equal(merchantFeedResponse(feed, "http://localhost:3000").status, 503);
  const response = merchantFeedResponse(feed, "https://floruvi.com");
  assert.equal(response.status, 200);
  assert.equal(
    response.headers.get("content-type"),
    "application/xml; charset=utf-8",
  );
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("public Convex feed denies incomplete setup and projects only published commerce fields", async () => {
  const names = [
    "GROWTH_MERCHANT_FEED_ENABLED",
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
    "RAZORPAY_WEBHOOK_SECRET",
  ] as const;
  const saved = Object.fromEntries(
    names.map((name) => [name, process.env[name]]),
  );
  const t = convexTest(schema, {
    "../convex/merchant.ts": () => import("../convex/merchant"),
    "../convex/_generated/server.ts": () =>
      import("../convex/_generated/server"),
  });
  const query = makeFunctionReference<
    "query",
    Record<string, never>,
    MerchantFeed
  >("merchant:google");
  try {
    for (const name of names) delete process.env[name];
    assert.equal((await t.query(query, {})).status, "disabled");
    process.env.GROWTH_MERCHANT_FEED_ENABLED = "true";
    process.env.RAZORPAY_KEY_ID = "rzp_test_example";
    process.env.RAZORPAY_KEY_SECRET = "fake-secret";
    process.env.RAZORPAY_WEBHOOK_SECRET = "fake-webhook";
    await t.run(async (ctx) => {
      await ctx.db.insert("storeSettings", {
        key: "commerce",
        currency: "INR",
        deliveryFeeMinor: 9900,
        paymentsEnabled: true,
      });
      const imageId = await ctx.storage.store(
        new Blob(["fake image"], { type: "image/webp" }),
      );
      // convex-test 0.0.60 omits Blob.type from mock storage metadata. Add it
      // only to this test fixture; production reads the real system metadata.
      await (ctx.db as unknown as GenericDatabaseWriter<SystemDataModel>).patch(
        imageId,
        { contentType: "image/webp" },
      );
      const values = {
        ...product,
        imageId,
        category: "herbs",
        uses: ["Cooking"],
        growingNote: "Private growing note",
        suitability: "established" as const,
        methods: ["Field"],
        sourceUrl: "https://example.com/private-source",
        sourceNote: "Private supplier note",
        featured: false,
        status: "enquiry" as const,
        rank: 1,
      };
      await ctx.db.insert("products", values);
      await ctx.db.insert("products", {
        ...values,
        slug: "hidden",
        published: false,
      });
      await ctx.db.insert("products", {
        ...values,
        slug: "no-photo",
        imageId: undefined,
      });
      await ctx.db.insert("products", {
        ...values,
        slug: "unknown-stock",
        inStock: undefined,
      });
    });
    assert.equal((await t.query(query, {})).status, "not-ready");
    process.env.RAZORPAY_KEY_ID = "rzp_live_example";
    const feed = await t.query(query, {});
    assert.equal(feed.status, "ready", JSON.stringify(feed));
    if (feed.status !== "ready") throw new Error("Expected ready feed");
    assert.equal(feed.items.length, 1);
    assert.deepEqual(Object.keys(feed.items[0]).sort(), [
      "description",
      "id",
      "imageUrl",
      "inStock",
      "priceMinor",
      "slug",
      "title",
    ]);
    assert.doesNotMatch(
      JSON.stringify(feed),
      /fake-secret|fake-webhook|Private supplier|Private growing|sourceNote/,
    );
    await t.run(async (ctx) => {
      const commerce = await ctx.db.query("storeSettings").first();
      await ctx.db.patch(commerce!._id, { paymentsEnabled: false });
    });
    assert.equal((await t.query(query, {})).status, "not-ready");
  } finally {
    for (const name of names) {
      if (saved[name] === undefined) delete process.env[name];
      else process.env[name] = saved[name];
    }
  }
});
