import { v } from "convex/values";
import { internalMutation, internalQuery, type QueryCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { boxContents, getCartBox } from "../lib/boxes";
import { paymentOrderRequest } from "../lib/checkout";
import { priceInMarket } from "../lib/markets/pricing-core";
import { reviewBasket } from "../lib/pricing";
import { applyPayment } from "../lib/razorpay";
import { takeRateLimits } from "./limits";

// Paid online orders. Only convex/payments.ts and convex/paymentsHttp.ts call these.

export const razorpayConfigured = () =>
  !!process.env.RAZORPAY_KEY_ID?.trim() && !!process.env.RAZORPAY_KEY_SECRET?.trim();

export async function commerceSettings(ctx: QueryCtx) {
  return ctx.db
    .query("storeSettings")
    .withIndex("by_key", (q) => q.eq("key", "commerce"))
    .unique();
}

/** Online payment needs the owner's switch and the Razorpay keys. */
export async function paymentsOn(ctx: QueryCtx) {
  return razorpayConfigured() && (await commerceSettings(ctx))?.paymentsEnabled === true;
}

/** Prices a basket for India from stored products, as the public catalogue does. */
async function priceForIndia(ctx: QueryCtx, lines: { slug: string; quantity: number }[]) {
  const slugs = new Set(lines.map((line) => line.slug));
  if (lines.some((line) => getCartBox(line.slug)))
    for (const item of boxContents) slugs.add(item.slug);
  const products = [];
  for (const slug of slugs) {
    const product = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (product?.published)
      products.push({
        slug,
        name: product.name,
        price: priceInMarket(product, "in", null),
        inStock: product.inStock !== false,
      });
  }
  const settings = await commerceSettings(ctx);
  return reviewBasket(
    lines,
    products,
    settings && { currency: settings.currency, deliveryFeeMinor: settings.deliveryFeeMinor },
    "in",
    true,
  );
}

/** Checks limits, prices the basket on the server and saves an unpaid order. */
export const prepare = internalMutation({
  args: {
    request: v.any(),
    ipHash: v.string(),
    contactHash: v.string(),
    reference: v.string(),
    mode: v.union(v.literal("test"), v.literal("live")),
  },
  handler: async (ctx, args) => {
    const parsed = paymentOrderRequest.safeParse(args.request);
    if (!parsed.success) return { ok: false, reason: "invalid" } as const;
    if (!(await paymentsOn(ctx))) return { ok: false, reason: "off" } as const;
    const allowed = await takeRateLimits(ctx, [
      { key: `order-ip:${args.ipHash}`, max: 10 },
      { key: `order-contact:${args.contactHash}`, max: 6 },
      { key: "order-all", max: 300 },
    ]);
    if (!allowed) return { ok: false, reason: "limited" } as const;
    const review = await priceForIndia(ctx, parsed.data.items);
    if (!review.paymentEnabled || review.total === null || review.subtotal === null)
      return { ok: false, reason: "changed" } as const;
    const taken = await ctx.db
      .query("orders")
      .withIndex("by_reference", (q) => q.eq("reference", args.reference))
      .unique();
    if (taken) return { ok: false, reason: "retry" } as const;
    const { details } = parsed.data;
    const id = await ctx.db.insert("orders", {
      reference: args.reference,
      status: "created",
      mode: args.mode,
      currency: "INR",
      amountMinor: review.total,
      subtotalMinor: review.subtotal,
      deliveryMinor: review.delivery ?? 0,
      items: review.items.map((item) => ({
        slug: item.slug,
        name: item.name,
        quantity: item.quantity,
        packLabel: item.packLabel ?? "",
        lineMinor: item.lineTotal ?? 0,
      })),
      customer: { name: details.name, email: details.email, phone: details.phone },
      delivery: {
        address: details.address,
        city: details.city,
        region: details.region,
        pincode: details.pincode,
        notes: details.notes,
      },
      consentAt: Date.now(),
    });
    return { ok: true, id, amountMinor: review.total } as const;
  },
});

export const attach = internalMutation({
  args: { id: v.id("orders"), razorpayOrderId: v.string() },
  handler: async (ctx, { id, razorpayOrderId }) => {
    await ctx.db.patch(id, { razorpayOrderId });
  },
});

export const byRazorpayOrder = internalQuery({
  args: { razorpayOrderId: v.string() },
  handler: (ctx, { razorpayOrderId }) =>
    ctx.db
      .query("orders")
      .withIndex("by_razorpay_order", (q) => q.eq("razorpayOrderId", razorpayOrderId))
      .unique(),
});

/** Applies one payment report from checkout or a webhook. Safe to repeat, in any order. */
export const recordPayment = internalMutation({
  args: {
    payment: v.object({
      id: v.string(),
      orderId: v.string(),
      status: v.string(),
      amount: v.number(),
      currency: v.string(),
      method: v.string(),
      error: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { payment }) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_razorpay_order", (q) => q.eq("razorpayOrderId", payment.orderId))
      .unique();
    if (!order) return null;
    const { patch, alert } = applyPayment(order, payment, Date.now());
    if (patch)
      await ctx.db.patch(order._id, {
        ...patch,
        ...(alert && { notifications: { telegram: "pending", email: "pending", attempts: 0 } }),
      });
    if (alert) await ctx.scheduler.runAfter(0, internal.notifications.sendOrder, { id: order._id });
    return { status: patch?.status ?? order.status, reference: order.reference };
  },
});
