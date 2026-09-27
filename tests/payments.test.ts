import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import {
  validatePaymentVerification,
  validateWebhookSignature,
} from "razorpay/dist/utils/razorpay-utils";
import { applyPayment, paymentMode, validSignature, type OrderPaymentState } from "../lib/razorpay";
import { paymentOrderRequest } from "../lib/checkout";
import { reviewBasket } from "../lib/pricing";
import { paidOrderAlert } from "../lib/order-notification";
import { POST as createOrder } from "../app/api/payments/order/route";
import { POST as confirmPayment } from "../app/api/payments/confirm/route";

const secret = "test_secret_for_signatures_only";
const hex = (message: string) => createHmac("sha256", secret).update(message).digest("hex");

test("signature check agrees with the official Razorpay SDK and rejects tampering", async () => {
  const orderId = "order_TESTabcdef1234";
  const paymentId = "pay_TESTabcdef1234";
  const good = hex(`${orderId}|${paymentId}`);
  assert.equal(
    validatePaymentVerification({ order_id: orderId, payment_id: paymentId }, good, secret),
    true,
  );
  assert.equal(await validSignature(secret, `${orderId}|${paymentId}`, good), true);
  const body = JSON.stringify({ event: "payment.captured", payload: {} });
  assert.equal(validateWebhookSignature(body, hex(body), secret), true);
  assert.equal(await validSignature(secret, body, hex(body)), true);
  for (const bad of [
    hex(`${orderId}|pay_OTHERabcdef123`),
    good.toUpperCase(),
    good.slice(0, 63),
    `${good}0`,
    "",
  ])
    assert.equal(await validSignature(secret, `${orderId}|${paymentId}`, bad), false);
  assert.equal(await validSignature("", `${orderId}|${paymentId}`, good), false);
  assert.equal(await validSignature(secret, `${body} `, hex(body)), false);
  assert.equal(paymentMode("rzp_test_abc"), "test");
  assert.equal(paymentMode("rzp_live_abc"), "live");
});

test("payment reports are safe to repeat and to receive in any order", () => {
  const order: OrderPaymentState = { status: "created", amountMinor: 43220, currency: "INR" };
  const captured = {
    id: "pay_A",
    orderId: "order_X",
    status: "captured",
    amount: 43220,
    currency: "INR",
    method: "upi",
  };
  const first = applyPayment(order, captured, 1);
  assert.equal(first.alert, true);
  assert.deepEqual(first.patch, {
    status: "paid",
    payment: { id: "pay_A", method: "upi", capturedAt: 1 },
  });
  const paid = { ...order, ...first.patch! } as OrderPaymentState;
  // The same capture again (checkout, then the webhook, then a Razorpay retry).
  assert.deepEqual(applyPayment(paid, captured, 2), { patch: null, alert: false });
  // A failure reported after the capture never undoes it.
  assert.deepEqual(applyPayment(paid, { ...captured, status: "failed" }, 3), {
    patch: null,
    alert: false,
  });
  // A second, different capture is kept for a refund and sends no second alert.
  const extra = applyPayment(paid, { ...captured, id: "pay_B" }, 4);
  assert.deepEqual(extra, { patch: { extraPayments: ["pay_B"] }, alert: false });
  assert.deepEqual(
    applyPayment({ ...paid, extraPayments: ["pay_B"] }, { ...captured, id: "pay_B" }, 5),
    { patch: null, alert: false },
  );
  // Failures before payment are noted; authorised-only payments change nothing.
  assert.deepEqual(applyPayment(order, { ...captured, status: "failed", error: "Bank declined" }, 6), {
    patch: { lastFailure: "Bank declined" },
    alert: false,
  });
  assert.deepEqual(applyPayment(order, { ...captured, status: "authorized" }, 7), {
    patch: null,
    alert: false,
  });
  // A capture for the wrong amount or currency is flagged, never marked paid.
  for (const wrong of [{ amount: 100 }, { currency: "USD" }]) {
    const result = applyPayment(order, { ...captured, ...wrong }, 8);
    assert.equal(result.patch && "status" in result.patch && result.patch.status, "review");
  }
});

test("online payment is offered only for complete, in-stock India baskets", () => {
  const products = [
    { slug: "kale", name: "Kale", price: { amountMinor: 13860, currency: "INR", packLabel: "100 g" } },
    {
      slug: "mint",
      name: "Mint",
      price: { amountMinor: 5600, currency: "INR", packLabel: "1 bunch" },
      inStock: false,
    },
  ];
  const commerce = { currency: "INR", deliveryFeeMinor: 9900 };
  const kale = [{ slug: "kale", quantity: 1 }];
  assert.equal(reviewBasket(kale, products, commerce, "in", true).paymentEnabled, true);
  assert.equal(reviewBasket(kale, products, commerce, "in", false).paymentEnabled, false);
  assert.equal(reviewBasket(kale, products, commerce, "ae", true).paymentEnabled, false);
  assert.equal(
    reviewBasket([...kale, { slug: "mint", quantity: 1 }], products, commerce, "in", true)
      .paymentEnabled,
    false,
  );
  assert.equal(
    reviewBasket([...kale, { slug: "gone", quantity: 1 }], products, commerce, "in", true)
      .paymentEnabled,
    false,
  );
  assert.equal(reviewBasket(kale, products, null, "in", true).paymentEnabled, false);
});

const details = {
  name: "Test Buyer",
  email: "Buyer@Example.com",
  phone: "+91 98765 43210",
  address: "",
  city: "Bengaluru",
  region: "Karnataka",
  pincode: "560001",
  notes: "",
};
const body = { items: [{ slug: "kale", quantity: 2 }], details, consent: true, website: "" };

test("payment requests carry no prices and need consent, a PIN code and unique lines", () => {
  const parsed = paymentOrderRequest.safeParse(body);
  assert.equal(parsed.success, true);
  assert.equal(parsed.data?.details.email, "buyer@example.com");
  for (const bad of [
    { ...body, consent: false },
    { ...body, website: "bot.example" },
    { ...body, total: 1 },
    { ...body, items: [{ slug: "kale", quantity: 1, price: 1 }] },
    { ...body, items: [{ slug: "kale", quantity: 1 }, { slug: "kale", quantity: 1 }] },
    { ...body, items: [] },
    { ...body, details: { ...details, pincode: "56001" } },
    { ...body, details: { ...details, pincode: "060001" } },
    { ...body, details: { ...details, phone: "" } },
    { ...body, details: { ...details, region: "" } },
  ])
    assert.equal(paymentOrderRequest.safeParse(bad).success, false, JSON.stringify(bad));
});

test("paid-order alerts escape customer text and mark test payments", () => {
  const alert = paidOrderAlert({
    reference: "FL-ABCD2345",
    status: "paid",
    mode: "test",
    amountMinor: 43220,
    deliveryMinor: 9900,
    items: [{ name: "Kale", quantity: 2, packLabel: "100 g", lineMinor: 27720 }],
    customer: { name: "<b>Eve</b>", email: "eve@example.com", phone: "+91 98765 43210" },
    delivery: { address: "", city: "Pune", region: "MH", pincode: "411001", notes: "Ring <twice>" },
    payment: { id: "pay_A", method: "upi" },
  });
  assert.match(alert, /^<b>TEST/);
  assert.match(alert, /Not given\. Call to confirm\./);
  assert.match(alert, /Kale × 2 \(100 g\): ₹277\.20/);
  assert.ok(!alert.includes("<b>Eve</b>"));
  assert.ok(alert.includes("&lt;b&gt;Eve&lt;/b&gt;"));
  assert.ok(alert.includes("Ring &lt;twice&gt;"));
});

test("payment routes check origin and input, hash the caller and never trust the browser", async (t) => {
  const original = {
    secret: process.env.LEAD_INGEST_SECRET,
    site: process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
    fetch: globalThis.fetch,
  };
  t.after(() => {
    for (const [key, value] of [
      ["LEAD_INGEST_SECRET", original.secret],
      ["NEXT_PUBLIC_CONVEX_SITE_URL", original.site],
    ] as const) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    globalThis.fetch = original.fetch;
  });
  process.env.LEAD_INGEST_SECRET = "test-only-secret-0123456789";
  process.env.NEXT_PUBLIC_CONVEX_SITE_URL = "https://example.convex.site";
  const request = (path: string, payload: unknown, origin = "https://farm.example") =>
    new Request(`https://farm.example/api/payments/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", origin },
      body: typeof payload === "string" ? payload : JSON.stringify(payload),
    });
  globalThis.fetch = async () => {
    throw new Error("No network call allowed");
  };
  assert.equal((await createOrder(request("order", body, "https://attacker.invalid"))).status, 403);
  assert.equal((await createOrder(request("order", { ...body, total: 1 }))).status, 400);
  assert.equal((await createOrder(request("order", "x".repeat(12_001)))).status, 413);
  assert.equal((await createOrder(request("order", body))).status, 503);

  let sent: Record<string, unknown> = {};
  const reply = (status: number, data: object) => async (_url: unknown, init?: RequestInit) => {
    sent = JSON.parse(String(init?.body));
    assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer test-only-secret-0123456789");
    return Response.json(data, { status });
  };
  globalThis.fetch = reply(200, {
    ok: true,
    keyId: "rzp_test_abc",
    razorpayOrderId: "order_TESTabcdef1234",
    amountMinor: 37620,
    reference: "FL-ABCD2345",
  });
  const created = await createOrder(request("order", body));
  assert.equal(created.status, 201);
  assert.deepEqual(await created.json(), {
    keyId: "rzp_test_abc",
    razorpayOrderId: "order_TESTabcdef1234",
    amountMinor: 37620,
    currency: "INR",
    reference: "FL-ABCD2345",
  });
  assert.match(String(sent.ipHash), /^[a-f0-9]{64}$/);
  assert.match(String(sent.contactHash), /^[a-f0-9]{64}$/);
  assert.equal(JSON.stringify(sent).includes("price"), false);
  for (const [status, data, expected] of [
    [200, { ok: false, reason: "changed" }, 409],
    [200, { ok: false, reason: "limited" }, 429],
    [200, { ok: false, reason: "invalid" }, 400],
    [200, { ok: false, reason: "provider" }, 503],
    [200, { ok: false, reason: "off" }, 503],
    [404, {}, 503],
    [401, {}, 503],
  ] as const) {
    globalThis.fetch = reply(status, data);
    assert.equal((await createOrder(request("order", body))).status, expected);
  }

  const checkout = {
    razorpay_order_id: "order_TESTabcdef1234",
    razorpay_payment_id: "pay_TESTabcdef1234",
    razorpay_signature: "a".repeat(64),
  };
  globalThis.fetch = async () => {
    throw new Error("No network call allowed");
  };
  assert.equal((await confirmPayment(request("confirm", checkout, "https://attacker.invalid"))).status, 403);
  assert.equal(
    (await confirmPayment(request("confirm", { ...checkout, razorpay_signature: "zz" }))).status,
    400,
  );
  assert.equal(
    (await confirmPayment(request("confirm", { ...checkout, status: "captured" }))).status,
    400,
  );
  globalThis.fetch = reply(200, { ok: true, status: "paid", reference: "FL-ABCD2345" });
  const confirmed = await confirmPayment(request("confirm", checkout));
  assert.equal(confirmed.status, 200);
  assert.deepEqual(await confirmed.json(), { status: "paid", reference: "FL-ABCD2345" });
  assert.deepEqual(sent, {
    razorpayOrderId: "order_TESTabcdef1234",
    razorpayPaymentId: "pay_TESTabcdef1234",
    signature: "a".repeat(64),
  });
  globalThis.fetch = reply(200, { ok: false, reason: "signature" });
  assert.equal((await confirmPayment(request("confirm", checkout))).status, 502);
});
