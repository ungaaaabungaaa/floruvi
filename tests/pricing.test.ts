import test from "node:test";
import assert from "node:assert/strict";
import { reviewBasket, formatMoney } from "../lib/pricing";
import { pricingBenchmarks } from "../convex/pricingData";
import { cropCatalogue } from "../convex/catalogueData";
const products = [
  {
    slug: "kale",
    name: "Kale",
    price: { amountMinor: 13860, currency: "INR", packLabel: "100 g" },
  },
  {
    slug: "mint",
    name: "Mint",
    price: { amountMinor: 5600, currency: "INR", packLabel: "1 bunch" },
  },
];
const commerce = { currency: "INR", deliveryFeeMinor: 9900 };
test("review uses integer pack prices and charges delivery once, with no threshold", () => {
  const result = reviewBasket(
    [
      { slug: "kale", quantity: 2 },
      { slug: "mint", quantity: 1 },
    ],
    products,
    commerce,
  );
  assert.equal(result.subtotal, 33320);
  assert.equal(result.delivery, 9900);
  assert.equal(result.total, 43220);
  assert.equal(result.paymentEnabled, false);
  assert.equal(
    reviewBasket([{ slug: "kale", quantity: 99 }], products, commerce).delivery,
    9900,
  );
  assert.equal(reviewBasket([], products, commerce).total, 0);
  assert.equal(formatMoney(13860), "₹138.60");
});
test("unknown, unpriced, invalid prices or missing delivery config cannot produce a complete total", () => {
  for (const extra of [
    [],
    [{ slug: "unknown", name: "Unknown" }],
    [
      {
        slug: "unknown",
        name: "Unknown",
        price: { amountMinor: 1.5, currency: "INR", packLabel: "100 g" },
      },
    ],
    [
      {
        slug: "unknown",
        name: "Unknown",
        price: { amountMinor: 100, currency: "USD", packLabel: "100 g" },
      },
    ],
  ]) {
    const result = reviewBasket(
      [
        { slug: "kale", quantity: 1 },
        { slug: "unknown", quantity: 1 },
      ],
      [...products, ...extra],
      commerce,
    );
    assert.equal(result.subtotal, null);
    assert.equal(result.total, null);
    assert.equal(result.delivery, 9900);
  }
  assert.equal(
    reviewBasket([{ slug: "kale", quantity: 1 }], products, null).total,
    null,
  );
});
test("reviewed seed prices have unique catalogue matches, pack evidence and a 40 percent markup", () => {
  assert.equal(
    new Set(pricingBenchmarks.map((p) => p.slug)).size,
    pricingBenchmarks.length,
  );
  for (const p of pricingBenchmarks) {
    assert.ok(
      cropCatalogue.some((c) => c.slug === p.slug),
      p.slug,
    );
    assert.ok(
      p.packLabel && p.sourcePack && p.sourceUrl.startsWith("https://"),
    );
    assert.ok(Number.isSafeInteger(p.retailMinor) && p.retailMinor > 0);
  }
  const kale = pricingBenchmarks.find((p) => p.slug === "curly-kale")!;
  assert.equal(Math.round((kale.retailMinor * 140) / 100), 13860);
});
