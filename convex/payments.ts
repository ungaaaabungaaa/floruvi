"use node";
import Razorpay from "razorpay";
import { randomInt } from "node:crypto";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { paymentMode, validSignature } from "../lib/razorpay";

// Razorpay calls, with the official Node SDK. Keys live only in Convex env:
// RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET. Amounts come from convex/orders.ts.

type Failure = { ok: false; reason: "off" | "invalid" | "limited" | "changed" | "retry" | "provider" | "signature" | "missing" };

function provider() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const secret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!keyId || !secret) return null;
  return { keyId, secret, api: new Razorpay({ key_id: keyId, key_secret: secret }) };
}

/** The SDK sets no timeout, so a slow provider cannot hold a checkout open. */
async function within<T>(promise: Promise<T>, ms = 15_000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("Razorpay timed out")), ms);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

// No 0/O or 1/I, so the reference is easy to read out on a phone call.
const LETTERS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const newReference = () =>
  `FL-${Array.from({ length: 8 }, () => LETTERS[randomInt(LETTERS.length)]).join("")}`;

export const createOrder = internalAction({
  args: { request: v.any(), ipHash: v.string(), contactHash: v.string() },
  handler: async (
    ctx,
    args,
  ): Promise<
    | Failure
    | { ok: true; keyId: string; razorpayOrderId: string; amountMinor: number; reference: string }
  > => {
    const razorpay = provider();
    if (!razorpay) return { ok: false, reason: "off" };
    let prepared;
    let reference = "";
    for (let attempt = 0; attempt < 3; attempt++) {
      reference = newReference();
      prepared = await ctx.runMutation(internal.orders.prepare, {
        ...args,
        reference,
        mode: paymentMode(razorpay.keyId),
      });
      if (prepared.ok || prepared.reason !== "retry") break;
    }
    if (!prepared?.ok) return prepared ?? { ok: false, reason: "retry" };
    try {
      const order = await within(
        razorpay.api.orders.create({
          amount: prepared.amountMinor,
          currency: "INR",
          receipt: reference,
          notes: { reference },
        }),
      );
      if (Number(order.amount) !== prepared.amountMinor || order.currency !== "INR")
        return { ok: false, reason: "provider" };
      await ctx.runMutation(internal.orders.attach, { id: prepared.id, razorpayOrderId: order.id });
      return {
        ok: true,
        keyId: razorpay.keyId,
        razorpayOrderId: order.id,
        amountMinor: prepared.amountMinor,
        reference,
      };
    } catch {
      return { ok: false, reason: "provider" };
    }
  },
});

/**
 * Confirms a checkout result: the signature must match, and Razorpay must report
 * the payment as captured for this order. Manual-capture accounts are captured here.
 */
export const confirm = internalAction({
  args: { razorpayOrderId: v.string(), razorpayPaymentId: v.string(), signature: v.string() },
  handler: async (
    ctx,
    { razorpayOrderId, razorpayPaymentId, signature },
  ): Promise<Failure | { ok: true; status: "created" | "paid" | "review"; reference: string }> => {
    const razorpay = provider();
    if (!razorpay) return { ok: false, reason: "off" };
    if (!(await validSignature(razorpay.secret, `${razorpayOrderId}|${razorpayPaymentId}`, signature)))
      return { ok: false, reason: "signature" };
    const order = await ctx.runQuery(internal.orders.byRazorpayOrder, { razorpayOrderId });
    if (!order) return { ok: false, reason: "missing" };
    if (order.payment?.id === razorpayPaymentId)
      return { ok: true, status: order.status, reference: order.reference };
    try {
      let payment = await within(razorpay.api.payments.fetch(razorpayPaymentId));
      if (payment.order_id !== razorpayOrderId) return { ok: false, reason: "signature" };
      if (
        payment.status === "authorized" &&
        Number(payment.amount) === order.amountMinor &&
        payment.currency === order.currency
      )
        payment = await within(
          razorpay.api.payments.capture(payment.id, order.amountMinor, order.currency),
        );
      const result = await ctx.runMutation(internal.orders.recordPayment, {
        payment: {
          id: payment.id,
          orderId: razorpayOrderId,
          status: payment.status,
          amount: Number(payment.amount),
          currency: payment.currency,
          method: String(payment.method ?? ""),
          error: payment.error_description ?? undefined,
        },
      });
      return result
        ? { ok: true, status: result.status, reference: result.reference }
        : { ok: false, reason: "missing" };
    } catch {
      return { ok: false, reason: "provider" };
    }
  },
});
