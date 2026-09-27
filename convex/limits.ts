import type { MutationCtx } from "./_generated/server";
import { nextRate, RATE_WINDOW } from "../lib/enquiry";

/**
 * Counts one attempt against every rule, in the same transaction as the work it
 * guards. Returns false and changes nothing when any rule is already full.
 */
export async function takeRateLimits(
  ctx: MutationCtx,
  rules: { key: string; max: number }[],
) {
  const now = Date.now();
  const updates = [];
  for (const rule of rules) {
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
  const expired = await ctx.db
    .query("enquiryLimits")
    .withIndex("by_window", (q) => q.lt("windowStart", now - RATE_WINDOW))
    .take(20);
  for (const row of expired) await ctx.db.delete(row._id);
  return true;
}
