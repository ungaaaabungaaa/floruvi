import test from "node:test";
import assert from "node:assert/strict";
import { boxSizes, boxSchedules, getBoxRequest } from "../lib/boxes";
import { enquirySchema } from "../lib/enquiry";
test("all nine box choices preserve household and cadence in a valid enquiry", () => {
  for (const size of boxSizes)
    for (const schedule of boxSchedules) {
      const request = getBoxRequest(size.id, schedule.id)!;
      assert.ok(request.interest.includes(size.people));
      assert.ok(request.interest.includes(schedule.name));
      assert.equal(
        enquirySchema.safeParse({
          kind: "personal",
          name: "Test Buyer",
          business: "",
          email: "box@example.com",
          phone: "",
          city: "Test City",
          quantity: "",
          consent: true,
          website: "",
          ...request,
        }).success,
        true,
      );
    }
  assert.equal(getBoxRequest("unknown", "once"), undefined);
  assert.equal(getBoxRequest("single", ["once"]), undefined);
});

test("cart boxes use current produce prices and retain the delivery frequency", async () => {
  const { reviewBasket } = await import("../lib/pricing");
  const { boxContents } = await import("../lib/boxes");
  const products = boxContents.map((item) => ({
    slug: item.slug,
    name: item.slug,
    price: { amountMinor: 10000, currency: "INR", packLabel: "1 pack" },
  }));
  for (const [index, size] of boxSizes.entries()) {
    for (const schedule of boxSchedules) {
      const review = reviewBasket(
        [{ slug: `box-${size.id}-${schedule.id}`, quantity: 2 }],
        products,
        { currency: "INR", deliveryFeeMinor: 9900 },
      );
      assert.equal(review.total, 60000 * [1, 2, 4][index] * 2);
      assert.equal(review.delivery, 0);
      assert.ok(review.items[0].name.includes(schedule.name));
      assert.equal(review.items[0].availableToEnquire, true);
    }
  }
  const mixed = reviewBasket([{ slug: "box-single-monthly", quantity: 1 }, { slug: products[0].slug, quantity: 1 }], products, { currency: "INR", deliveryFeeMinor: 9900 });
  assert.equal(mixed.delivery, 9900);
  assert.equal(mixed.total, 79900);
  assert.equal(
    reviewBasket(
      [{ slug: "box-dual-weekly", quantity: 1 }],
      products.slice(1),
      { currency: "INR", deliveryFeeMinor: 9900 },
    ).total,
    null,
  );
  assert.equal(
    reviewBasket([{ slug: "box-dual-invalid", quantity: 1 }], products, {
      currency: "INR",
      deliveryFeeMinor: 9900,
    }).total,
    null,
  );
});
