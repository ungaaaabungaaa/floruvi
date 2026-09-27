import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { enquirySchema } from "../lib/enquiry";
import { takeRateLimits } from "./limits";

export const save = internalMutation({
  args: { payload: v.any(), ipHash: v.string(), contactHash: v.string() },
  handler: async (ctx, args) => {
    const parsed = enquirySchema.safeParse(args.payload);
    if (!parsed.success) return { ok: false, reason: "invalid" } as const;
    const allowed = await takeRateLimits(ctx, [
      { key: `ip:${args.ipHash}`, max: 5 },
      { key: `contact:${args.contactHash}`, max: 3 },
      { key: "global", max: 100 },
    ]);
    if (!allowed) return { ok: false, reason: "limited" } as const;
    const { consent, website, ...data } = parsed.data;
    void consent;
    void website;
    const id = await ctx.db.insert("enquiries", {
      ...data,
      consentAt: Date.now(),
      status: "new",
      notifications: { telegram: "pending", email: "pending", attempts: 0 },
    });
    // Runs only if this save commits; owner alerts never block the visitor.
    await ctx.scheduler.runAfter(0, internal.notifications.sendEnquiry, { id });
    return { ok: true } as const;
  },
});
