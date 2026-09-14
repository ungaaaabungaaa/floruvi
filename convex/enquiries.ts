import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { enquirySchema, nextRate, RATE_WINDOW } from "../lib/enquiry";

export const save = internalMutation({
  args: { payload: v.any(), ipHash: v.string(), contactHash: v.string() },
  handler: async (ctx, args) => {
    const parsed = enquirySchema.safeParse(args.payload);
    if (!parsed.success) return { ok: false, reason: "invalid" } as const;
    const now = Date.now();
    const limits = [
      { key: `ip:${args.ipHash}`, max: 5 },
      { key: `contact:${args.contactHash}`, max: 3 },
      { key: "global", max: 100 },
    ];
    const updates = [];
    for (const rule of limits) {
      const old = await ctx.db
        .query("enquiryLimits")
        .withIndex("by_key", (q) => q.eq("key", rule.key))
        .unique();
      const rate = nextRate(old, now, rule.max);
      if (!rate.allowed) return { ok: false, reason: "limited" } as const;
      updates.push({
        old,
        key: rule.key,
        count: rate.count,
        windowStart: rate.windowStart,
      });
    }
    for (const { old, ...data } of updates) {
      if (old) await ctx.db.patch(old._id, data);
      else await ctx.db.insert("enquiryLimits", data);
    }
    const expired = await ctx.db
      .query("enquiryLimits")
      .withIndex("by_window", (q) => q.lt("windowStart", now - RATE_WINDOW))
      .take(20);
    for (const row of expired) await ctx.db.delete(row._id);
    const { consent, website, ...data } = parsed.data;
    void consent;
    void website;
    await ctx.db.insert("enquiries", {
      ...data,
      consentAt: now,
      status: "new",
    });
    return { ok: true } as const;
  },
});
