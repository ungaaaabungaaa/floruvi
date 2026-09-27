import { internalMutation, internalQuery, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { takeRateLimits } from "./limits";
import { commerceSettings, razorpayConfigured } from "./orders";
import { paymentMode } from "../lib/razorpay";

// Owner-only functions. They are internal: only convex/http.ts calls them, after
// checking the server secret. Each one then checks the session itself.

const HOUR = 60 * 60 * 1000;
export const SESSION_HOURS = { remembered: 14 * 24, browser: 12 };

async function activeSession(ctx: QueryCtx, tokenHash: string) {
  const session = await ctx.db
    .query("adminSessions")
    .withIndex("by_token", (q) => q.eq("tokenHash", tokenHash))
    .unique();
  return session && session.expiresAt > Date.now() ? session : null;
}

/** Counts each sign-in attempt before the details are checked, so parallel guesses cannot slip past. */
export const reserveLoginAttempt = internalMutation({
  args: { ipHash: v.string() },
  handler: (ctx, { ipHash }) =>
    takeRateLimits(ctx, [
      { key: `admin-ip:${ipHash}`, max: 10 },
      { key: "admin-all", max: 30 },
    ]),
});

export const startSession = internalMutation({
  args: { tokenHash: v.string(), remember: v.boolean(), ipHash: v.string() },
  handler: async (ctx, { tokenHash, remember, ipHash }) => {
    const now = Date.now();
    const hours = remember ? SESSION_HOURS.remembered : SESSION_HOURS.browser;
    await ctx.db.insert("adminSessions", { tokenHash, expiresAt: now + hours * HOUR });
    // A successful sign-in clears this address's failed attempts.
    const attempts = await ctx.db
      .query("enquiryLimits")
      .withIndex("by_key", (q) => q.eq("key", `admin-ip:${ipHash}`))
      .unique();
    if (attempts) await ctx.db.delete(attempts._id);
    const expired = await ctx.db
      .query("adminSessions")
      .withIndex("by_expiry", (q) => q.lt("expiresAt", now))
      .take(20);
    for (const row of expired) await ctx.db.delete(row._id);
    return { maxAgeSeconds: hours * 60 * 60 };
  },
});

export const endSession = internalMutation({
  args: { tokenHash: v.string() },
  handler: async (ctx, { tokenHash }) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("tokenHash", tokenHash))
      .unique();
    if (session) await ctx.db.delete(session._id);
  },
});

export const dashboard = internalQuery({
  args: { tokenHash: v.string() },
  handler: async (ctx, { tokenHash }) => {
    const session = await activeSession(ctx, tokenHash);
    if (!session) return null;
    const [orders, onlineOrders, products, settings] = await Promise.all([
      ctx.db.query("enquiries").order("desc").take(200),
      ctx.db.query("orders").order("desc").take(200),
      ctx.db.query("products").collect(),
      commerceSettings(ctx),
    ]);
    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    return {
      expiresAt: session.expiresAt,
      chatEnabled: settings?.chatEnabled === true,
      payments: {
        enabled: settings?.paymentsEnabled === true,
        keys: razorpayConfigured(),
        webhook: !!process.env.RAZORPAY_WEBHOOK_SECRET,
        mode: keyId ? paymentMode(keyId) : null,
      },
      onlineOrders: onlineOrders
        // Checkouts that never reached Razorpay have nothing to act on.
        .filter((order) => order.razorpayOrderId)
        .map((order) => ({
          id: order._id,
          createdAt: order._creationTime,
          reference: order.reference,
          status: order.status,
          mode: order.mode,
          amountMinor: order.amountMinor,
          subtotalMinor: order.subtotalMinor,
          deliveryMinor: order.deliveryMinor,
          items: order.items,
          customer: order.customer,
          delivery: order.delivery,
          razorpayOrderId: order.razorpayOrderId ?? null,
          payment: order.payment ?? null,
          extraPayments: order.extraPayments ?? [],
          lastFailure: order.lastFailure ?? null,
          notifications: order.notifications ?? null,
        })),
      orders: orders.map((order) => ({
        id: order._id,
        receivedAt: order._creationTime,
        kind: order.kind,
        name: order.name,
        business: order.business,
        email: order.email,
        phone: order.phone,
        city: order.city,
        interest: order.interest,
        quantity: order.quantity,
        message: order.message,
        notifications: order.notifications ?? null,
      })),
      products: products
        .sort((a, b) => a.rank - b.rank)
        .map((p) => ({
          slug: p.slug,
          name: p.name,
          category: p.category,
          published: p.published,
          inStock: p.inStock !== false,
          price: p.price ?? null,
        })),
    };
  },
});

export const setChat = internalMutation({
  args: { tokenHash: v.string(), enabled: v.boolean() },
  handler: async (ctx, { tokenHash, enabled }) => {
    if (!(await activeSession(ctx, tokenHash))) return "unauthorized" as const;
    const settings = await ctx.db
      .query("storeSettings")
      .withIndex("by_key", (q) => q.eq("key", "commerce"))
      .unique();
    if (!settings) return "missing" as const;
    await ctx.db.patch(settings._id, { chatEnabled: enabled });
    return "ok" as const;
  },
});

export const setPayments = internalMutation({
  args: { tokenHash: v.string(), enabled: v.boolean() },
  handler: async (ctx, { tokenHash, enabled }) => {
    if (!(await activeSession(ctx, tokenHash))) return "unauthorized" as const;
    if (enabled && !razorpayConfigured()) return "keys" as const;
    const settings = await commerceSettings(ctx);
    if (!settings) return "missing" as const;
    await ctx.db.patch(settings._id, { paymentsEnabled: enabled });
    return "ok" as const;
  },
});

export const setStock = internalMutation({
  args: { tokenHash: v.string(), slug: v.string(), inStock: v.boolean() },
  handler: async (ctx, { tokenHash, slug, inStock }) => {
    if (!(await activeSession(ctx, tokenHash))) return "unauthorized" as const;
    const product = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!product) return "missing" as const;
    await ctx.db.patch(product._id, { inStock });
    return "ok" as const;
  },
});
