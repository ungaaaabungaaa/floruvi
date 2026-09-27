import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { razorpayIds, validSignature } from "../lib/razorpay";
import { hasBearer, readObject, reply, text } from "./httpUtils";

// /payments/* are called by the Next.js server with LEAD_INGEST_SECRET.
// /razorpay/webhook is called by Razorpay and signed with RAZORPAY_WEBHOOK_SECRET.

// Business outcomes return 200 with `ok` and a reason: the proxy in front of
// Convex replaces 502 responses with its own page, which would hide the reason.
const HEX64 = /^[a-f0-9]{64}$/;

export const order = httpAction(async (ctx, request) => {
  if (!(await hasBearer(request, process.env.LEAD_INGEST_SECRET))) return reply(401);
  const body = await readObject(request, 12_000);
  const ipHash = text(body?.ipHash);
  const contactHash = text(body?.contactHash);
  if (!body || !HEX64.test(ipHash) || !HEX64.test(contactHash)) return reply(400);
  // convex/orders.ts validates the request again before anything is saved.
  const result = await ctx.runAction(internal.payments.createOrder, {
    request: body.request,
    ipHash,
    contactHash,
  });
  return reply(200, result);
});

export const confirm = httpAction(async (ctx, request) => {
  if (!(await hasBearer(request, process.env.LEAD_INGEST_SECRET))) return reply(401);
  const body = await readObject(request, 1000);
  const razorpayOrderId = text(body?.razorpayOrderId);
  const razorpayPaymentId = text(body?.razorpayPaymentId);
  const signature = text(body?.signature);
  if (
    !razorpayIds.order.test(razorpayOrderId) ||
    !razorpayIds.payment.test(razorpayPaymentId) ||
    !razorpayIds.signature.test(signature)
  )
    return reply(400);
  const result = await ctx.runAction(internal.payments.confirm, {
    razorpayOrderId,
    razorpayPaymentId,
    signature,
  });
  return reply(200, result);
});

type WebhookPayment = {
  id?: unknown;
  order_id?: unknown;
  status?: unknown;
  amount?: unknown;
  currency?: unknown;
  method?: unknown;
  error_description?: unknown;
};

/**
 * Razorpay webhook: payment.captured, payment.failed and order.paid. Razorpay
 * retries and may repeat or reorder events; convex/orders.ts is safe for both.
 */
export const webhook = httpAction(async (ctx, request) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return reply(503);
  const raw = await request.text();
  if (raw.length > 200_000) return reply(413);
  // The signature covers the exact raw body, so check it before parsing.
  if (!(await validSignature(secret, raw, request.headers.get("x-razorpay-signature") ?? "")))
    return reply(401);
  let event: { event?: unknown; payload?: { payment?: { entity?: WebhookPayment } } };
  try {
    event = JSON.parse(raw);
  } catch {
    return reply(400);
  }
  const payment = event.payload?.payment?.entity;
  if (
    ["payment.captured", "payment.failed", "order.paid"].includes(text(event.event)) &&
    payment &&
    razorpayIds.payment.test(text(payment.id)) &&
    razorpayIds.order.test(text(payment.order_id)) &&
    typeof payment.amount === "number"
  )
    await ctx.runMutation(internal.orders.recordPayment, {
      payment: {
        id: text(payment.id),
        orderId: text(payment.order_id),
        status: text(payment.status),
        amount: payment.amount,
        currency: text(payment.currency),
        method: text(payment.method),
        error: text(payment.error_description) || undefined,
      },
    });
  // Other events and orders from elsewhere are acknowledged, so Razorpay stops retrying.
  return reply(200);
});
