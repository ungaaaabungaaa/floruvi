// Razorpay rules shared by Convex (both runtimes), the Next.js routes and tests.
// Web Crypto keeps the signature check identical everywhere.

/** Razorpay's smallest payment: ₹1. */
export const MIN_PAYMENT_MINOR = 100;

export const razorpayIds = {
  order: /^order_[A-Za-z0-9]{8,40}$/,
  payment: /^pay_[A-Za-z0-9]{8,40}$/,
  signature: /^[a-f0-9]{64}$/,
};

/** Test keys start with rzp_test_. Their payments move no money. */
export const paymentMode = (keyId: string) =>
  keyId.startsWith("rzp_live_") ? ("live" as const) : ("test" as const);

const encoder = new TextEncoder();

/** Hex HMAC-SHA256, the form Razorpay uses for checkout results and webhooks. */
export async function hmacSha256Hex(secret: string, message: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Constant-time signature check. Checkout signs `order_id|payment_id`; webhooks sign the raw body. */
export async function validSignature(secret: string, message: string, signature: string) {
  if (!secret || !razorpayIds.signature.test(signature)) return false;
  const expected = await hmacSha256Hex(secret, message);
  let difference = 0;
  for (let i = 0; i < expected.length; i++)
    difference |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return difference === 0;
}

export type PaymentReport = {
  id: string;
  orderId: string;
  status: string;
  amount: number;
  currency: string;
  method: string;
  error?: string;
};

export type OrderPaymentState = {
  status: "created" | "paid" | "review";
  amountMinor: number;
  currency: string;
  payment?: { id: string; method: string; capturedAt: number };
  extraPayments?: string[];
};

/**
 * The next state of an order after one payment report from checkout or a webhook.
 * Reports may repeat or arrive in any order: a paid order never goes back, one
 * payment is recorded once, and only the first capture sends the owner alert.
 */
export function applyPayment(order: OrderPaymentState, payment: PaymentReport, now: number) {
  if (payment.status === "failed")
    return order.status === "created" && !order.payment
      ? { patch: { lastFailure: (payment.error || "Payment failed").slice(0, 200) }, alert: false }
      : { patch: null, alert: false };
  if (payment.status !== "captured") return { patch: null, alert: false };
  if (order.payment) {
    if (order.payment.id === payment.id || order.extraPayments?.includes(payment.id))
      return { patch: null, alert: false };
    // A second capture for one order: keep it so the owner can refund it.
    return {
      patch: { extraPayments: [...(order.extraPayments ?? []), payment.id] },
      alert: false,
    };
  }
  const matches = payment.amount === order.amountMinor && payment.currency === order.currency;
  return {
    patch: {
      status: matches ? ("paid" as const) : ("review" as const),
      payment: { id: payment.id, method: payment.method, capturedAt: now },
    },
    alert: true,
  };
}
