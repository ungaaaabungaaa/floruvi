import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { budgetAlert, chatAlert, orderAlert, paidOrderAlert } from "../lib/order-notification";
import { spendLimits } from "./chatSpend";

// Owner alerts by Telegram for each saved enquiry, paid order and chat hand-off.
// Without the bot settings the alert stays "off". A failed alert retries twice;
// a sent alert is never sent again. (Email alerts were removed on 28 September 2026.)
const RETRY_AFTER = [60_000, 5 * 60_000];
const status = v.union(
  v.literal("pending"),
  v.literal("sent"),
  v.literal("failed"),
  v.literal("off"),
);
type Status = "sent" | "failed" | "off";

export const enquiryForAlert = internalQuery({
  args: { id: v.id("enquiries") },
  handler: (ctx, { id }) => ctx.db.get(id),
});

export const orderForAlert = internalQuery({
  args: { id: v.id("orders") },
  handler: (ctx, { id }) => ctx.db.get(id),
});

export const record = internalMutation({
  args: {
    id: v.union(v.id("enquiries"), v.id("orders"), v.id("chatThreads"), v.id("chatUsage")),
    telegram: status,
    attempts: v.number(),
  },
  handler: async (ctx, { id, ...notifications }) => {
    await ctx.db.patch(id, { notifications });
  },
});

const timeout = () =>
  typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(10_000) : undefined;

async function sendTelegram(token: string, chat: string, html: string) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chat,
        text: html,
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
      }),
      signal: timeout(),
    });
    return response.ok;
  } catch {
    return false;
  }
}

type Notifications = { telegram: Status | "pending"; attempts: number };

/**
 * Sends one alert and saves the result. Returns the delay before a retry, or
 * null when it was sent, is off, or the retries are used up.
 */
async function deliver(
  html: string,
  before: Notifications | undefined,
  save: (notifications: Notifications) => Promise<unknown>,
) {
  const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_OWNER_CHAT_ID: chat } = process.env;
  const telegram: Status =
    !token || !chat
      ? "off"
      : before?.telegram === "sent"
        ? "sent"
        : (await sendTelegram(token, chat, html))
          ? "sent"
          : "failed";
  const attempts = (before?.attempts ?? 0) + 1;
  await save({ telegram, attempts });
  return telegram === "failed" && attempts <= RETRY_AFTER.length ? RETRY_AFTER[attempts - 1] : null;
}

const adminUrl = () => {
  const site = process.env.SITE_URL?.replace(/\/+$/, "");
  return site ? `${site}/admin` : undefined;
};

export const sendEnquiry = internalAction({
  args: { id: v.id("enquiries") },
  handler: async (ctx, { id }) => {
    const enquiry = await ctx.runQuery(internal.notifications.enquiryForAlert, { id });
    if (!enquiry) return;
    const alert = orderAlert({ ...enquiry, receivedAt: enquiry._creationTime }, adminUrl());
    const retry = await deliver(alert, enquiry.notifications, (notifications) =>
      ctx.runMutation(internal.notifications.record, { id, ...notifications }),
    );
    if (retry !== null)
      await ctx.scheduler.runAfter(retry, internal.notifications.sendEnquiry, { id });
  },
});

export const sendOrder = internalAction({
  args: { id: v.id("orders") },
  handler: async (ctx, { id }) => {
    const order = await ctx.runQuery(internal.notifications.orderForAlert, { id });
    if (!order) return;
    const alert = paidOrderAlert(order, adminUrl());
    const retry = await deliver(alert, order.notifications, (notifications) =>
      ctx.runMutation(internal.notifications.record, { id, ...notifications }),
    );
    if (retry !== null)
      await ctx.scheduler.runAfter(retry, internal.notifications.sendOrder, { id });
  },
});

export const sendChat = internalAction({
  args: { id: v.id("chatThreads") },
  handler: async (ctx, { id }) => {
    const chat = await ctx.runQuery(internal.chat.threadForAlert, { id });
    if (!chat || chat.mode !== "owner") return;
    const inbox = adminUrl();
    const alert = chatAlert(
      { reason: chat.handOffReason ?? "Needs a person", language: chat.language, recent: chat.recent },
      inbox && `${inbox}/chats?t=${id}`,
    );
    const retry = await deliver(alert, chat.notifications, (notifications) =>
      ctx.runMutation(internal.notifications.record, { id, ...notifications }),
    );
    if (retry !== null) await ctx.scheduler.runAfter(retry, internal.notifications.sendChat, { id });
  },
});

export const sendBudget = internalAction({
  args: { id: v.id("chatUsage") },
  handler: async (ctx, { id }) => {
    const usage = await ctx.runQuery(internal.chat.usageForAlert, { id });
    if (!usage?.pausedAt) return;
    const alert = budgetAlert(
      {
        month: usage.month,
        spentUsd: usage.costMicros / 1e6,
        budgetUsd: spendLimits().monthMicros / 1e6,
      },
      adminUrl(),
    );
    const retry = await deliver(alert, usage.notifications, (notifications) =>
      ctx.runMutation(internal.notifications.record, { id, ...notifications }),
    );
    if (retry !== null) await ctx.scheduler.runAfter(retry, internal.notifications.sendBudget, { id });
  },
});
