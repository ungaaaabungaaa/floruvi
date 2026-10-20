import test from "node:test";
import assert from "node:assert/strict";
import {
  nextWeight,
  pantryPrices,
  weightPrice,
  MAX_WEIGHT_GRAMS,
} from "../lib/pantry-weights";
import { normalizeCart } from "../lib/cart";
import { basketLines, basketEnquiry } from "../lib/checkout";
import { reviewBasket } from "../lib/pricing";
import { dehydratedProducts } from "../convex/dehydratedData";
const products = dehydratedProducts.map((p) => ({
  ...p,
  ...pantryPrices(p.slug, p.price, "in"),
}));
const commerce = { currency: "INR", deliveryFeeMinor: 9900 };

test("weight steps reverse exactly and stop at the supported bound", () => {
  const steps = [250, 500, 1000, 1500, 2000, 2500, 3000, 4000, 5000];
  for (let i = 1; i < steps.length; i++) {
    assert.equal(nextWeight(steps[i - 1], 1), steps[i]);
    assert.equal(nextWeight(steps[i], -1), steps[i - 1]);
  }
  assert.equal(nextWeight(250, -1), 250);
  assert.equal(nextWeight(MAX_WEIGHT_GRAMS, 1), MAX_WEIGHT_GRAMS);
});
test("server quotes include taxes once, round only the selected weight and preserve old carts", () => {
  const lines = [
    { slug: "green-banana-flour", quantity: 1, weightGrams: 250 },
    { slug: "onion-flakes", quantity: 1, weightGrams: 1500 },
  ];
  const quote = reviewBasket(lines, products, commerce, "in", true);
  assert.equal(quote.items[0].lineTotal, 39323);
  assert.equal(quote.items[1].lineTotal, 197400);
  assert.equal(quote.items[1].packLabel, "1.5 kg · Bulk");
  assert.equal(quote.total, 246623);
  const banana = products[0].weightPricing!;
  assert.equal(weightPrice(banana, 500), 78645);
  assert.equal(weightPrice(banana, 1000), 157290);
  assert.equal(weightPrice(banana, 25000), 3932250);
  assert.equal(weightPrice(banana, 26000), 3894800);
  assert.equal(
    reviewBasket([{ slug: "garlic-powder", quantity: 2 }], products, commerce)
      .subtotal,
    69800,
  );
  assert.equal(
    reviewBasket(
      [{ slug: "garlic-powder", quantity: 1, weightGrams: 250 }],
      products,
      commerce,
    ).subtotal,
    43625,
  );
});
test("weight is preserved in storage and invalid or forged lines cannot be priced", () => {
  const valid = { slug: "onion-flakes", quantity: 1, weightGrams: 500 };
  assert.deepEqual(normalizeCart([valid]), [valid]);
  for (const line of [
    { ...valid, weightGrams: 750 },
    { ...valid, quantity: 2 },
    { ...valid, slug: "mint" },
    { ...valid, weightGrams: -250 },
    { ...valid, weightGrams: Number.MAX_SAFE_INTEGER },
  ]) {
    assert.equal(basketLines.safeParse([line]).success, false);
    assert.deepEqual(normalizeCart([line]), []);
    assert.equal(
      reviewBasket([line], products, commerce, "in", true).paymentEnabled,
      false,
    );
  }
  assert.equal(
    basketLines.safeParse([{ ...valid, amountMinor: 1 }]).success,
    false,
  );
  assert.equal(
    reviewBasket([valid], products, commerce, "ae", true).items[0]
      .availableToEnquire,
    false,
  );
  assert.equal(weightPrice({ baseGrams: 0, baseMinor: 100 }, 500), null);
});
test("availability requests retain selected weight and packaging", () => {
  const result = basketEnquiry(
    {
      name: "Test Buyer",
      email: "test@example.com",
      phone: "9876543210",
      address: "12 Garden Road",
      city: "Bengaluru",
      region: "Karnataka",
      pincode: "560001",
      notes: "",
    },
    [{ name: "Onion flakes", quantity: 1, weightGrams: 1500 }],
    true,
  );
  assert.equal(result.success, true);
  if (result.success)
    assert.match(result.data.message, /Onion flakes · 1.5 kg · Bulk/);
});
