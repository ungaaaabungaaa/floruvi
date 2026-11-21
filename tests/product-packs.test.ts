import test from "node:test";
import assert from "node:assert/strict";
import { packOptions, nextPackSize, validPackSize } from "../lib/product-packs";
import { honeyEggProducts } from "../lib/honey-eggs-data";
import { normalizeCart } from "../lib/cart";
import { basketLines, basketEnquiry } from "../lib/checkout";
import { reviewBasket } from "../lib/pricing";
const commerce = { currency: "INR", deliveryFeeMinor: 9900 };

test("all nine honey prices increase by 75%, rounded up to whole rupees", () => {
  const previous = [
    [199, 399, 749],
    [179, 379, 699],
    [229, 449, 849],
  ];
  honeyEggProducts.slice(0, 3).forEach((product, index) => {
    assert.deepEqual(
      packOptions(product.slug, product.price)?.map((p) => p.amountMinor),
      previous[index].map((price) => Math.ceil((price * 175) / 100) * 100),
    );
    assert.equal(nextPackSize(product.slug, 100, -1), 100);
    assert.equal(nextPackSize(product.slug, 100, 1), 250);
    assert.equal(nextPackSize(product.slug, 250, 1), 500);
    assert.equal(nextPackSize(product.slug, 500, 1), 500);
    assert.equal(nextPackSize(product.slug, 500, -1), 250);
  });
});
test("eggs step through one to four dozen and stop at 48", () => {
  const eggs = honeyEggProducts[3];
  assert.deepEqual(
    packOptions(eggs.slug, eggs.price)?.map((p) => [p.size, p.amountMinor]),
    [
      [12, 17800],
      [24, 35600],
      [36, 53400],
      [48, 71200],
    ],
  );
  assert.equal(nextPackSize(eggs.slug, 12, -1), 12);
  assert.equal(nextPackSize(eggs.slug, 12, 1), 24);
  assert.equal(nextPackSize(eggs.slug, 24, 1), 36);
  assert.equal(nextPackSize(eggs.slug, 36, 1), 48);
  assert.equal(nextPackSize(eggs.slug, 48, 1), 48);
  assert.equal(nextPackSize(eggs.slug, 48, -1), 36);
  assert.equal(validPackSize(eggs.slug, 6), false);
  assert.equal(validPackSize(eggs.slug, 60), false);
});
test("selected total survives storage; a second update replaces without adding", () => {
  const lines = normalizeCart([
    { slug: "raw-honey", quantity: 1, packSize: 100 },
    { slug: "raw-honey", quantity: 1, packSize: 500 },
    { slug: "farm-eggs", quantity: 1, packSize: 24 },
  ]);
  assert.deepEqual(lines, [
    { slug: "raw-honey", quantity: 1, packSize: 500 },
    { slug: "farm-eggs", quantity: 1, packSize: 24 },
  ]);
  assert.deepEqual(normalizeCart(JSON.parse(JSON.stringify(lines))), lines);
  assert.equal(basketLines.safeParse(lines).success, true);
});
test("invalid, mixed, multiplied, unpriced and export selected packs cannot be quoted", () => {
  const invalid = [
    { slug: "raw-honey", quantity: 1, packSize: 200 },
    { slug: "farm-eggs", quantity: 1, packSize: 18 },
    { slug: "raw-honey", quantity: 2, packSize: 250 },
    { slug: "raw-honey", quantity: 1, packSize: 250, weightGrams: 250 },
    { slug: "carrot", quantity: 1, packSize: 250 },
  ];
  for (const line of invalid) {
    assert.equal(basketLines.safeParse([line]).success, false);
    assert.deepEqual(normalizeCart([line]), []);
    assert.equal(
      reviewBasket([line], honeyEggProducts, commerce).subtotal,
      null,
    );
  }
  assert.equal(
    basketLines.safeParse([{ slug: "raw-honey", quantity: 1 }]).success,
    false,
  );
  assert.equal(packOptions("constructor", honeyEggProducts[0].price), null);
  assert.equal(validPackSize("constructor", 100), false);
  assert.equal(
    reviewBasket(
      [{ slug: "raw-honey", quantity: 1, packSize: 250 }],
      honeyEggProducts,
      commerce,
      "ae",
    ).subtotal,
    null,
  );
  assert.equal(
    reviewBasket(
      [{ slug: "raw-honey", quantity: 1, packSize: 250 }],
      [],
      commerce,
    ).subtotal,
    null,
  );
});
test("server uses its own price and selection; new packs are never payable", () => {
  const lines = [
    { slug: "raw-honey", quantity: 1, packSize: 250 },
    { slug: "farm-eggs", quantity: 1, packSize: 12 },
  ];
  const review = reviewBasket(lines, honeyEggProducts, commerce, "in", true);
  // ₹699 + ₹178 = ₹877, plus ₹99 delivery = ₹976, rounded down to ₹950.
  assert.equal(review.subtotal, 87700);
  assert.equal(review.total, 95000);
  assert.equal(review.items[0].packLabel, "250 ml · Glass jar");
  assert.equal(
    review.items[1].packLabel,
    "1 dozen · 12 eggs · Protective carton",
  );
  assert.equal(review.paymentEnabled, false);
  const changed = honeyEggProducts.map((p) =>
    p.slug === "raw-honey"
      ? { ...p, price: { ...p.price, amountMinor: p.price.amountMinor * 2 } }
      : p,
  );
  assert.equal(
    reviewBasket(lines, changed, commerce).items[0].lineTotal,
    139700,
  );
});
test("availability text preserves the selected size instead of saying quantity one", () => {
  const result = basketEnquiry(
    {
      name: "Test Owner",
      email: "test@example.com",
      phone: "9876543210",
      address: "12 Farm Road",
      city: "Bengaluru",
      region: "Karnataka",
      pincode: "560001",
      notes: "",
    },
    [{ slug: "farm-eggs", name: "Farm eggs", quantity: 1, packSize: 24 }],
    true,
  );
  assert.equal(result.success, true);
  if (result.success) assert.match(result.data.message, /24 eggs/);
});
