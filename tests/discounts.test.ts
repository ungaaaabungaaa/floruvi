import test from "node:test";
import assert from "node:assert/strict";
import {
  defaultDiscounts,
  deliveryFee,
  resolveDiscounts,
  roundDownDiscount,
  validDiscounts,
} from "../lib/discounts";
import { reviewBasket } from "../lib/pricing";
import { ceilToWhole } from "../lib/i18n/format";
import { priceInMarket, wholePrice } from "../lib/markets/pricing-core";

const item = (rupees: number) => ({
  slug: "item",
  name: "Item",
  price: { amountMinor: rupees * 100, currency: "INR", packLabel: "1 pack" },
});
const commerce = { currency: "INR", deliveryFeeMinor: 9900 };
const review = (rupees: number, settings: object = commerce) =>
  reviewBasket([{ slug: "item", quantity: 1 }], [item(rupees)], settings as typeof commerce);

test("prices round up to a whole unit in every currency and never down", () => {
  assert.equal(ceilToWhole(34825, "INR"), 34900);
  assert.equal(ceilToWhole(34900, "INR"), 34900);
  assert.equal(ceilToWhole(850, "KWD"), 1000);
  assert.equal(ceilToWhole(145, "EUR"), 200);
  assert.equal(ceilToWhole(1230, "JPY"), 1230);
  const price = { amountMinor: 13860, currency: "INR", packLabel: "100 g" };
  assert.equal(wholePrice(price)?.amountMinor, 13900);
  assert.equal(wholePrice(wholePrice(price))?.amountMinor, 13900);
  assert.equal(wholePrice(null), null);
  assert.equal(
    priceInMarket({ slug: "kale", category: "leafy", price }, "in", null)?.amountMinor,
    13900,
  );
});

test("delivery costs less from the first level and nothing from the second", () => {
  assert.equal(review(900).delivery, 9900);
  assert.equal(review(999).delivery, 9900);
  assert.equal(review(1000).delivery, 4900);
  assert.equal(review(1999).delivery, 4900);
  assert.equal(review(2000).delivery, 0);
  assert.equal(review(2000).standardDelivery, 9900);
  assert.deepEqual(review(900).nextDelivery, { addMinor: 10000, feeMinor: 4900 });
  assert.deepEqual(review(1500).nextDelivery, { addMinor: 50000, feeMinor: 0 });
  assert.equal(review(2500).nextDelivery, null);
  // A level never raises the standard fee.
  assert.equal(deliveryFee(150000, 3000, defaultDiscounts), 3000);
});

test("the total rounds down to the step and the discount equals the difference", () => {
  for (const rupees of [1, 49, 151, 333, 999, 1000, 1234, 2000, 2526]) {
    const r = review(rupees);
    assert.equal(r.total! % 5000 === 0 || r.discount === 0, true, String(rupees));
    assert.equal(r.subtotal! + r.delivery! - r.discount, r.total);
    assert.ok(r.discount >= 0 && r.discount < 5000);
    assert.ok(r.total! > 0);
  }
  // ₹2,526 is above the free-delivery level: ₹26 off.
  assert.equal(review(2526).total, 250000);
  assert.equal(review(2526).discount, 2600);
  // A total at or under one step is never reduced to nothing.
  assert.equal(roundDownDiscount(4900, defaultDiscounts), 0);
  assert.equal(roundDownDiscount(5000, defaultDiscounts), 0);
});

test("the owner can switch each rule off, and export baskets get no discount", () => {
  const off = {
    ...commerce,
    roundDownStepMinor: 0,
    reducedDeliveryFromMinor: 0,
    reducedDeliveryFeeMinor: 0,
    freeDeliveryFromMinor: 0,
  };
  const r = review(2526, off);
  assert.equal(r.delivery, 9900);
  assert.equal(r.discount, 0);
  assert.equal(r.total, 262500);
  assert.equal(r.nextDelivery, null);
  const exported = reviewBasket(
    [{ slug: "item", quantity: 1 }],
    [{ slug: "item", name: "Item", price: { amountMinor: 1230, currency: "AED", packLabel: "1 pack" } }],
    commerce,
    "ae",
  );
  assert.equal(exported.discount, 0);
  assert.equal(exported.total, 1300);
});

test("stored settings fall back to the starting values and reject unsafe input", () => {
  assert.deepEqual(resolveDiscounts(null), defaultDiscounts);
  assert.deepEqual(resolveDiscounts({ roundDownStepMinor: 1000 }), {
    ...defaultDiscounts,
    roundDownStepMinor: 1000,
  });
  assert.deepEqual(
    resolveDiscounts({ roundDownStepMinor: 777, freeDeliveryFromMinor: -5 }),
    defaultDiscounts,
  );
  assert.equal(validDiscounts(defaultDiscounts), true);
  for (const bad of [
    null,
    {},
    { ...defaultDiscounts, roundDownStepMinor: 2500 },
    { ...defaultDiscounts, freeDeliveryFromMinor: 150050 },
    { ...defaultDiscounts, reducedDeliveryFeeMinor: -100 },
    { ...defaultDiscounts, reducedDeliveryFromMinor: 1e12 },
    { ...defaultDiscounts, freeDeliveryFromMinor: "2000" },
  ])
    assert.equal(validDiscounts(bad), false);
});
