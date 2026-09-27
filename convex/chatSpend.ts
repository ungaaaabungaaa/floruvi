import type { QueryCtx } from "./_generated/server";
import {
  CHAT_DAILY_LIMIT_PER_CHAT_USD,
  CHAT_MONTHLY_BUDGET_USD,
  monthKey,
  toMicros,
} from "../lib/chat";

// Shared by the chat, admin and alert functions.

/** The spend limits in micros, from Convex env or the defaults in lib/chat.ts. */
export function spendLimits() {
  const usd = (name: string, fallback: number) => {
    const value = Number(process.env[name]);
    return Number.isFinite(value) && value >= 0 && process.env[name]?.trim() ? value : fallback;
  };
  return {
    monthMicros: toMicros(usd("CHAT_MONTHLY_BUDGET_USD", CHAT_MONTHLY_BUDGET_USD)),
    chatDayMicros: toMicros(usd("CHAT_DAILY_LIMIT_PER_CHAT_USD", CHAT_DAILY_LIMIT_PER_CHAT_USD)),
  };
}

export const monthUsage = (ctx: QueryCtx, time: number) =>
  ctx.db
    .query("chatUsage")
    .withIndex("by_month", (q) => q.eq("month", monthKey(time)))
    .unique();
