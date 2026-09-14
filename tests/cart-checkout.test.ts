import test from "node:test";
import assert from "node:assert/strict";
import { normalizeCart, updateCart } from "../lib/cart";
import { basketEnquiry, checkoutContact } from "../lib/checkout";
import { POST } from "../app/api/checkout-review/route";

test("basket storage keeps only valid crop identifiers and bounded quantities", () => {
  assert.deepEqual(normalizeCart({ email: "private@example.com" }), []);
  assert.deepEqual(
    normalizeCart([
      { slug: "basil", quantity: 70, email: "private@example.com", price: 1 },
      { slug: "basil", quantity: 70 },
      { slug: "../bad", quantity: 1 },
      { slug: "mint", quantity: 1.5 },
    ]),
    [{ slug: "basil", quantity: 99 }],
  );
  assert.equal(
    normalizeCart(
      Array.from({ length: 30 }, (_, i) => ({
        slug: `crop-${i}`,
        quantity: 1,
      })),
    ).length,
    20,
  );
  assert.deepEqual(
    updateCart([{ slug: "basil", quantity: 2 }], "basil", 0),
    [],
  );
  assert.deepEqual(updateCart([{ slug: "basil", quantity: 2 }], "basil", 4), [
    { slug: "basil", quantity: 4 },
  ]);
});
test("checkout enquiry is valid at basket limits and excludes street address", () => {
  const details = {
    name: "Test Grower",
    email: "test@example.com",
    phone: "+919876543210",
    address: "PRIVATE STREET",
    city: "Test City",
    region: "Test Region",
    pincode: "500001",
    notes: "a".repeat(800),
  };
  assert.equal(
    checkoutContact.safeParse({ ...details, phone: "invalid" }).success,
    false,
  );
  const parsed = basketEnquiry(
    details,
    Array.from({ length: 20 }, (_, i) => ({
      name: `Test crop ${i}`,
      quantity: 99,
    })),
    true,
  );
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(JSON.stringify(parsed.data).includes(details.address), false);
    assert.ok(parsed.data.message.length < 2000);
  }
  assert.equal(
    basketEnquiry(details, [{ name: "Basil", quantity: 1 }], false).success,
    false,
  );
});
test("basket review rejects altered totals and fails closed without catalogue access", async (t) => {
  const original = {
    fetch: globalThis.fetch,
    url: process.env.NEXT_PUBLIC_CONVEX_URL,
  };
  t.after(() => {
    globalThis.fetch = original.fetch;
    if (original.url === undefined) delete process.env.NEXT_PUBLIC_CONVEX_URL;
    else process.env.NEXT_PUBLIC_CONVEX_URL = original.url;
  });
  process.env.NEXT_PUBLIC_CONVEX_URL = "https://example.convex.cloud";
  const request = (body: unknown, origin = "https://farm.example") =>
    new Request("https://farm.example/api/checkout-review", {
      method: "POST",
      headers: { origin, "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    });
  globalThis.fetch = async () => {
    throw new Error("offline");
  };
  assert.equal(
    (await POST(request({ items: [{ slug: "basil", quantity: 1, price: 1 }] })))
      .status,
    400,
  );
  assert.equal(
    (await POST(request({ items: [{ slug: "basil", quantity: 0 }] }))).status,
    400,
  );
  assert.equal(
    (
      await POST(
        request({
          items: [
            { slug: "basil", quantity: 1 },
            { slug: "basil", quantity: 1 },
          ],
        }),
      )
    ).status,
    400,
  );
  assert.equal(
    (await POST(request({}, "https://attacker.invalid"))).status,
    403,
  );
  assert.equal((await POST(request("x".repeat(6001)))).status, 413);
  assert.equal(
    (await POST(request({ items: [{ slug: "basil", quantity: 1 }] }))).status,
    503,
  );
  globalThis.fetch = async () =>
    Response.json({
      status: "success",
      value: { products: [{ slug: "basil", name: "Basil" }], categories: [] },
    });
  const response = await POST(
    request({
      items: [
        { slug: "basil", quantity: 2 },
        { slug: "missing", quantity: 1 },
      ],
    }),
  );
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.total, null);
  assert.equal(result.paymentEnabled, false);
  assert.equal(result.verificationEnabled, false);
  assert.equal(result.items[0].availableToEnquire, true);
  assert.equal(result.items[1].availableToEnquire, false);
});
