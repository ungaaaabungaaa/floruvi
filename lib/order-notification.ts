import { formatCurrency } from "./i18n/format";

// Owner alerts, sent by Telegram (HTML). Every customer value is escaped.

export type EnquiryForAlert = {
  kind: "business" | "personal";
  name: string;
  business: string;
  email: string;
  phone: string;
  city: string;
  interest: string;
  quantity: string;
  message: string;
  receivedAt: number;
};

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const fieldLines = (fields: [string, string][]) =>
  fields
    .filter(([, value]) => value.trim())
    .map(([label, value]) => `<b>${label}:</b> ${escapeHtml(value)}`);

const adminLink = (url: string | undefined, label: string) =>
  url ? `\n\n<a href="${escapeHtml(url)}">${label}</a>` : "";

/** Telegram rejects messages over 4096 characters. Cuts the body, never inside an entity. */
function fitTelegram(head: string, body: string, foot: string) {
  let fitted = "";
  const budget = 4000 - head.length - foot.length;
  for (const char of body) {
    const piece = escapeHtml(char);
    if (fitted.length + piece.length > budget - 1) {
      fitted += "…";
      break;
    }
    fitted += piece;
  }
  return head + fitted + foot;
}

/** Alert for a saved enquiry or order request. */
export function orderAlert(enquiry: EnquiryForAlert, adminUrl?: string) {
  const basket = enquiry.message.startsWith("Basket availability request:");
  const title =
    enquiry.kind === "business"
      ? "New business enquiry"
      : basket
        ? "New order request"
        : "New enquiry";
  const received = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(enquiry.receivedAt);
  const head = [
    `<b>${escapeHtml(title)}</b>`,
    "",
    ...fieldLines([
      ["Name", enquiry.name],
      ["Business", enquiry.business],
      ["Phone", enquiry.phone],
      ["Email", enquiry.email],
      ["City", enquiry.city],
      ["Interest", enquiry.interest],
      ["Quantity", enquiry.quantity],
    ]),
    "",
    "",
  ].join("\n");
  const foot =
    `\n\n<i>Received ${escapeHtml(received)} IST</i>` + adminLink(adminUrl, "Open the admin panel");
  return fitTelegram(head, enquiry.message, foot);
}

export type PaidOrderForAlert = {
  reference: string;
  status: "created" | "paid" | "review";
  mode: "test" | "live";
  amountMinor: number;
  deliveryMinor: number;
  items: { name: string; quantity: number; packLabel: string; lineMinor: number }[];
  customer: { name: string; email: string; phone: string };
  delivery: { address: string; city: string; region: string; pincode: string; notes: string };
  payment?: { id: string; method: string } | null;
};

const rupees = (minor: number) => formatCurrency(minor, "INR", "en-IN");

/** Alert for a captured Razorpay payment. */
export function paidOrderAlert(order: PaidOrderForAlert, adminUrl?: string) {
  const test = order.mode === "test" ? "TEST · no money moved · " : "";
  const title =
    order.status === "paid"
      ? `${test}Paid order ${order.reference}`
      : `${test}Check payment ${order.reference}: the amount did not match`;
  const head = [
    `<b>${escapeHtml(title)}</b>`,
    "",
    ...fieldLines([
      [
        "Total paid",
        `${rupees(order.amountMinor)}${order.deliveryMinor ? ` (includes ${rupees(order.deliveryMinor)} delivery)` : ""}`,
      ],
      ["Name", order.customer.name],
      ["Phone", order.customer.phone],
      ["Email", order.customer.email],
      ["Address", order.delivery.address || "Not given. Call to confirm."],
      ["Area", [order.delivery.city, order.delivery.region, order.delivery.pincode].filter(Boolean).join(", ")],
      ["Razorpay payment", [order.payment?.id, order.payment?.method].filter(Boolean).join(" · ")],
    ]),
    "",
    "<b>Items</b>",
    "",
  ].join("\n");
  const items = order.items.map(
    (item) =>
      `${item.name} × ${item.quantity}${item.packLabel ? ` (${item.packLabel})` : ""}: ${rupees(item.lineMinor)}`,
  );
  const notes = order.delivery.notes.trim();
  return fitTelegram(
    head,
    [...items, ...(notes ? ["", `Notes: ${notes}`] : [])].join("\n"),
    adminLink(adminUrl, "Open the admin panel"),
  );
}

/** Alert when a website chat needs a person. */
export function chatAlert(
  chat: { reason: string; language: string; recent: { author: string; text: string }[] },
  inboxUrl?: string,
) {
  const lines = chat.recent.map(
    (m) => `${m.author === "customer" ? "Customer" : m.author === "owner" ? "You" : "Assistant"}: ${m.text}`,
  );
  const head = `<b>${escapeHtml(`Chat needs you: ${chat.reason}`)}</b>\nLanguage: ${escapeHtml(chat.language)}\n\n`;
  return fitTelegram(head, lines.join("\n"), adminLink(inboxUrl, "Reply in the admin panel"));
}
