import { internalMutation, internalQuery, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { nextRate } from "../lib/enquiry";

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
  handler: async (ctx, { ipHash }) => {
    const now = Date.now();
    const updates = [];
    for (const rule of [
      { key: `admin-ip:${ipHash}`, max: 10 },
      { key: "admin-all", max: 30 },
    ]) {
      const old = await ctx.db
        .query("enquiryLimits")
        .withIndex("by_key", (q) => q.eq("key", rule.key))
        .unique();
      const rate = nextRate(old, now, rule.max);
      if (!rate.allowed) return false;
      updates.push({ old, key: rule.key, count: rate.count, windowStart: rate.windowStart });
    }
    for (const { old, ...data } of updates) {
      if (old) await ctx.db.patch(old._id, data);
      else await ctx.db.insert("enquiryLimits", data);
    }
    return true;
  },
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
    const [orders, products, settings] = await Promise.all([
      ctx.db.query("enquiries").order("desc").take(200),
      ctx.db.query("products").collect(),
      ctx.db
        .query("storeSettings")
        .withIndex("by_key", (q) => q.eq("key", "commerce"))
        .unique(),
    ]);
    return {
      expiresAt: session.expiresAt,
      chatEnabled: settings?.chatEnabled === true,
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
