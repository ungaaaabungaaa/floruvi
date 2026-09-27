import { v } from "convex/values";
import { internalMutation, internalQuery, type QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { takeRateLimits } from "./limits";
import { commerceSettings } from "./orders";
import { activeSession } from "./admin";
import {
  CHAT_RETENTION_DAYS,
  MAX_CHAT_TEXT,
  chatSpend,
  dayKey,
  monthKey,
  needsPerson,
} from "../lib/chat";
import { monthUsage, spendLimits } from "./chatSpend";

// Website chat storage. Only convex/chatHttp.ts calls these: the public routes
// with the site's server secret, the owner routes with an admin session.

const HISTORY = 12;
const DAY = 24 * 60 * 60 * 1000;
const pending = { telegram: "pending", attempts: 0 } as const;
const mode = v.union(v.literal("bot"), v.literal("owner"), v.literal("closed"));
const products = v.optional(
  v.array(v.object({ slug: v.string(), name: v.string(), quantity: v.optional(v.number()) })),
);

const threadByToken = (ctx: QueryCtx, tokenHash: string) =>
  ctx.db
    .query("chatThreads")
    .withIndex("by_token", (q) => q.eq("tokenHash", tokenHash))
    .unique();

const shown = (message: Doc<"chatMessages">) => ({
  id: message._id,
  author: message.author,
  text: message.text,
  products: message.products,
  at: message._creationTime,
});

async function latest(ctx: QueryCtx, threadId: Id<"chatThreads">, count: number) {
  const recent = await ctx.db
    .query("chatMessages")
    .withIndex("by_thread", (q) => q.eq("threadId", threadId))
    .order("desc")
    .take(count);
  return recent.reverse();
}

/** Saves a customer message and decides who answers it. */
export const customerTurn = internalMutation({
  args: {
    tokenHash: v.string(),
    ipHash: v.string(),
    text: v.string(),
    language: v.string(),
    market: v.string(),
  },
  handler: async (ctx, args) => {
    const text = args.text.trim().slice(0, MAX_CHAT_TEXT);
    if (!text) return { ok: false, reason: "invalid" } as const;
    if ((await commerceSettings(ctx))?.chatEnabled !== true)
      return { ok: false, reason: "off" } as const;
    const allowed = await takeRateLimits(ctx, [
      { key: `chat-ip:${args.ipHash}`, max: 30 },
      { key: `chat-thread:${args.tokenHash}`, max: 30 },
      { key: "chat-all", max: 600 },
    ]);
    if (!allowed) return { ok: false, reason: "limited" } as const;
    const now = Date.now();
    let thread = await threadByToken(ctx, args.tokenHash);
    if (!thread) {
      const id = await ctx.db.insert("chatThreads", {
        tokenHash: args.tokenHash,
        mode: "bot",
        language: args.language,
        market: args.market,
        lastMessageAt: now,
        preview: "",
        unread: false,
      });
      thread = (await ctx.db.get(id))!;
    }
    await ctx.db.insert("chatMessages", { threadId: thread._id, author: "customer", text });
    // A closed chat reopens with the assistant. Code, not the model, hands off here.
    let reason = thread.mode === "owner" ? null : needsPerson(text);
    let next = reason ? "owner" : thread.mode === "closed" ? "bot" : thread.mode;
    // Spend guards: a chat over today's limit goes to the owner; when the monthly
    // budget is spent, the assistant pauses for everyone and the owner is told once.
    let paused = false;
    if (next === "bot") {
      const usage = await monthUsage(ctx, now);
      const spend = chatSpend(
        {
          monthMicros: usage?.costMicros ?? 0,
          chatTodayMicros: thread.costDay === dayKey(now) ? (thread.costDayMicros ?? 0) : 0,
        },
        spendLimits(),
      );
      if (spend === "chat") {
        reason = "Long chat: today's assistant limit for this chat is used up";
        next = "owner";
      } else if (spend === "month") {
        paused = true;
        if (usage && !usage.pausedAt) {
          await ctx.db.patch(usage._id, { pausedAt: now, notifications: pending });
          await ctx.scheduler.runAfter(0, internal.notifications.sendBudget, { id: usage._id });
        }
      } else if (usage?.pausedAt) {
        // The owner raised the budget: resume, and alert again if it runs out.
        await ctx.db.patch(usage._id, { pausedAt: undefined });
      }
    }
    await ctx.db.patch(thread._id, {
      mode: next,
      language: args.language,
      market: args.market,
      lastMessageAt: now,
      preview: text.slice(0, 140),
      unread: next === "owner",
      ...(reason && { handOffReason: reason, notifications: pending }),
    });
    if (reason) await ctx.scheduler.runAfter(0, internal.notifications.sendChat, { id: thread._id });
    if (next !== "bot" || paused)
      return { ok: true, mode: next, handedOff: !!reason, paused, history: [] } as const;
    const history = await latest(ctx, thread._id, HISTORY);
    return {
      ok: true,
      mode: next,
      handedOff: false,
      paused,
      history: history.map((m) => ({ author: m.author, text: m.text })),
    } as const;
  },
});

/** Saves the assistant's reply. A hand-off from the model gives the chat to the owner. */
export const botReply = internalMutation({
  args: {
    tokenHash: v.string(),
    text: v.string(),
    products,
    handOff: v.optional(v.string()),
    // What the reply cost, from OpenRouter's usage report.
    costMicros: v.optional(v.number()),
    tokensIn: v.optional(v.number()),
    tokensOut: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const thread = await threadByToken(ctx, args.tokenHash);
    if (!thread) return;
    const now = Date.now();
    const cost = args.costMicros ?? 0;
    const today = dayKey(now);
    const text = args.text.trim().slice(0, 4000);
    const replied = text || args.products?.length ? 1 : 0;
    const usage = await monthUsage(ctx, now);
    if (usage)
      await ctx.db.patch(usage._id, {
        costMicros: usage.costMicros + cost,
        aiReplies: usage.aiReplies + replied,
      });
    else
      await ctx.db.insert("chatUsage", { month: monthKey(now), costMicros: cost, aiReplies: replied });
    if (text || args.products?.length)
      await ctx.db.insert("chatMessages", {
        threadId: thread._id,
        author: "bot",
        text,
        ...(args.products?.length && { products: args.products.slice(0, 10) }),
      });
    const handOff = args.handOff && thread.mode === "bot" ? args.handOff.slice(0, 200) : null;
    await ctx.db.patch(thread._id, {
      lastMessageAt: now,
      costMicros: (thread.costMicros ?? 0) + cost,
      tokensIn: (thread.tokensIn ?? 0) + (args.tokensIn ?? 0),
      tokensOut: (thread.tokensOut ?? 0) + (args.tokensOut ?? 0),
      aiReplies: (thread.aiReplies ?? 0) + replied,
      costDay: today,
      costDayMicros: (thread.costDay === today ? (thread.costDayMicros ?? 0) : 0) + cost,
      ...(handOff && { mode: "owner", unread: true, handOffReason: handOff, notifications: pending }),
    });
    if (handOff) await ctx.scheduler.runAfter(0, internal.notifications.sendChat, { id: thread._id });
  },
});

/** The customer's own chat, found by the cookie's hash. */
export const customerThread = internalQuery({
  args: { tokenHash: v.string() },
  handler: async (ctx, { tokenHash }) => {
    const thread = await threadByToken(ctx, tokenHash);
    if (!thread) return null;
    return { mode: thread.mode, messages: (await latest(ctx, thread._id, 50)).map(shown) };
  },
});

/** Owner inbox: chats waiting for the owner first, then the newest. */
export const inbox = internalQuery({
  args: {
    tokenHash: v.string(),
    threadId: v.optional(v.string()),
    sort: v.optional(v.literal("cost")),
  },
  handler: async (ctx, args) => {
    if (!(await activeSession(ctx, args.tokenHash))) return null;
    const [waiting, recent, usage] = await Promise.all([
      ctx.db
        .query("chatThreads")
        .withIndex("by_mode", (q) => q.eq("mode", "owner"))
        .order("desc")
        .take(50),
      ctx.db.query("chatThreads").withIndex("by_last_message").order("desc").take(100),
      monthUsage(ctx, Date.now()),
    ]);
    const listed = [...waiting, ...recent.filter((t) => t.mode !== "owner")];
    // "Most expensive first" shows which chats cost the most, for example a spammer.
    if (args.sort === "cost") listed.sort((a, b) => (b.costMicros ?? 0) - (a.costMicros ?? 0));
    const threads = listed.map((t) => ({
      id: t._id,
      mode: t.mode,
      language: t.language,
      market: t.market,
      lastMessageAt: t.lastMessageAt,
      preview: t.preview,
      unread: t.unread,
      handOffReason: t.handOffReason ?? null,
      costMicros: t.costMicros ?? 0,
      aiReplies: t.aiReplies ?? 0,
    }));
    const selectedId = args.threadId ? ctx.db.normalizeId("chatThreads", args.threadId) : null;
    const selected = selectedId ? await ctx.db.get(selectedId) : null;
    return {
      spend: {
        month: monthKey(Date.now()),
        costMicros: usage?.costMicros ?? 0,
        aiReplies: usage?.aiReplies ?? 0,
        paused: !!usage?.pausedAt,
        ...spendLimits(),
      },
      threads,
      selected: selected && {
        id: selected._id,
        mode: selected.mode,
        handOffReason: selected.handOffReason ?? null,
        costMicros: selected.costMicros ?? 0,
        tokensIn: selected.tokensIn ?? 0,
        tokensOut: selected.tokensOut ?? 0,
        aiReplies: selected.aiReplies ?? 0,
        messages: (await latest(ctx, selected._id, 200)).map(shown),
      },
    };
  },
});

/** Owner reply, or a change of who answers: take over, give back to the assistant, or close. */
export const ownerUpdate = internalMutation({
  args: {
    tokenHash: v.string(),
    threadId: v.string(),
    text: v.optional(v.string()),
    mode: v.optional(mode),
  },
  handler: async (ctx, args) => {
    if (!(await activeSession(ctx, args.tokenHash))) return "unauthorized" as const;
    const id = ctx.db.normalizeId("chatThreads", args.threadId);
    const thread = id ? await ctx.db.get(id) : null;
    if (!thread) return "missing" as const;
    const text = args.text?.trim().slice(0, 2000);
    if (text) await ctx.db.insert("chatMessages", { threadId: thread._id, author: "owner", text });
    await ctx.db.patch(thread._id, {
      // Replying takes the chat over, so the assistant stays silent.
      mode: args.mode ?? (text ? "owner" : thread.mode),
      unread: false,
      ...(text && { lastMessageAt: Date.now() }),
    });
    return "ok" as const;
  },
});

/** Deletes chats with no message for CHAT_RETENTION_DAYS, in small batches. */
export const purge = internalMutation({
  args: {},
  handler: async (ctx) => {
    const old = await ctx.db
      .query("chatThreads")
      .withIndex("by_last_message", (q) => q.lt("lastMessageAt", Date.now() - CHAT_RETENTION_DAYS * DAY))
      .take(20);
    for (const thread of old) {
      const messages = await ctx.db
        .query("chatMessages")
        .withIndex("by_thread", (q) => q.eq("threadId", thread._id))
        .take(500);
      for (const message of messages) await ctx.db.delete(message._id);
      if (messages.length < 500) await ctx.db.delete(thread._id);
    }
    if (old.length === 20) await ctx.scheduler.runAfter(0, internal.chat.purge, {});
  },
});

export const threadForAlert = internalQuery({
  args: { id: v.id("chatThreads") },
  handler: async (ctx, { id }) => {
    const thread = await ctx.db.get(id);
    return thread && { ...thread, recent: await latest(ctx, id, 6) };
  },
});

export const usageForAlert = internalQuery({
  args: { id: v.id("chatUsage") },
  handler: (ctx, { id }) => ctx.db.get(id),
});
