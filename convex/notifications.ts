import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { orderAlert, paidOrderAlert } from "../lib/order-notification";

// Owner alerts for each saved enquiry and each paid order. Channels without settings stay "off".
// A failed channel retries twice; a sent channel is never sent again.
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
    id: v.union(v.id("enquiries"), v.id("orders")),
    telegram: status,
    email: status,
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

async function sendEmail(
  key: string,
  from: string,
  to: string[],
  alert: { subject: string; text: string },
  replyTo: string,
) {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ from, to, subject: alert.subject, text: alert.text, reply_to: replyTo }),
      signal: timeout(),
    });
    return response.ok;
  } catch {
    return false;
  }
}

type Alert = { subject: string; text: string; telegram: string };
type Notifications = { telegram: Status | "pending"; email: Status | "pending"; attempts: number };

/**
 * Sends one alert on each configured channel and saves each result. Returns the
 * delay before a retry, or null when nothing failed or the retries are used up.
 */
async function deliver(
  alert: Alert,
  replyTo: string,
  before: Notifications | undefined,
  save: (notifications: Notifications) => Promise<unknown>,
) {
  const env = process.env;
  const recipients = (env.OWNER_ALERT_EMAILS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const telegram: Status =
    !env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_OWNER_CHAT_ID
      ? "off"
      : before?.telegram === "sent"
        ? "sent"
        : (await sendTelegram(env.TELEGRAM_BOT_TOKEN, env.TELEGRAM_OWNER_CHAT_ID, alert.telegram))
          ? "sent"
          : "failed";
  const attempts = (before?.attempts ?? 0) + 1;
  // Save Telegram's result first, so a crash before email cannot resend it.
  await save({ telegram, email: before?.email ?? "pending", attempts });
  const email: Status =
    !env.RESEND_API_KEY || !env.ALERT_EMAIL_FROM || !recipients.length
      ? "off"
      : before?.email === "sent"
        ? "sent"
        : (await sendEmail(env.RESEND_API_KEY, env.ALERT_EMAIL_FROM, recipients, alert, replyTo))
          ? "sent"
          : "failed";
  await save({ telegram, email, attempts });
  return (telegram === "failed" || email === "failed") && attempts <= RETRY_AFTER.length
    ? RETRY_AFTER[attempts - 1]
    : null;
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
    const retry = await deliver(alert, enquiry.email, enquiry.notifications, (notifications) =>
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
    const retry = await deliver(alert, order.customer.email, order.notifications, (notifications) =>
      ctx.runMutation(internal.notifications.record, { id, ...notifications }),
    );
    if (retry !== null)
      await ctx.scheduler.runAfter(retry, internal.notifications.sendOrder, { id });
  },
});
