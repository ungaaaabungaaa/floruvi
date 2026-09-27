import { formatCurrency } from "./i18n/format";

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

/** One owner alert as plain text (email) and Telegram HTML. */
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
  const fields: [string, string][] = [
    ["Name", enquiry.name],
    ["Business", enquiry.business],
    ["Phone", enquiry.phone],
    ["Email", enquiry.email],
    ["City", enquiry.city],
    ["Interest", enquiry.interest],
    ["Quantity", enquiry.quantity],
  ];
  const shown = fields.filter(([, value]) => value.trim());
  const subject = `${title}: ${enquiry.name}${enquiry.business ? ` (${enquiry.business})` : ""}`;
  const text = [
    title,
    "",
    ...shown.map(([label, value]) => `${label}: ${value}`),
    "",
    enquiry.message,
    "",
    `Received ${received} IST`,
    ...(adminUrl ? [`Open the admin panel: ${adminUrl}`] : []),
  ].join("\n");
  const head = [
    `<b>${escapeHtml(title)}</b>`,
    "",
    ...shown.map(([label, value]) => `<b>${label}:</b> ${escapeHtml(value)}`),
    "",
  ].join("\n");
  const foot = [
    "",
    "",
    `<i>Received ${escapeHtml(received)} IST</i>`,
    ...(adminUrl ? [`<a href="${escapeHtml(adminUrl)}">Open the admin panel</a>`] : []),
  ].join("\n");
  return { subject, text, telegram: fitTelegram(head, enquiry.message, foot) };
}

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

/** Owner alert for a captured Razorpay payment, as plain text (email) and Telegram HTML. */
export function paidOrderAlert(order: PaidOrderForAlert, adminUrl?: string) {
  const test = order.mode === "test" ? "TEST · no money moved · " : "";
  const title =
    order.status === "paid"
      ? `${test}Paid order ${order.reference}`
      : `${test}Check payment ${order.reference}: the amount did not match`;
  const fields: [string, string][] = [
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
  ];
  const shown = fields.filter(([, value]) => value.trim());
  const items = order.items.map(
    (item) =>
      `${item.name} × ${item.quantity}${item.packLabel ? ` (${item.packLabel})` : ""}: ${rupees(item.lineMinor)}`,
  );
  const notes = order.delivery.notes.trim();
  const subject = `${title}: ${rupees(order.amountMinor)} from ${order.customer.name}`;
  const text = [
    title,
    "",
    ...shown.map(([label, value]) => `${label}: ${value}`),
    "",
    "Items:",
    ...items,
    ...(notes ? ["", `Notes: ${notes}`] : []),
    ...(adminUrl ? ["", `Open the admin panel: ${adminUrl}`] : []),
  ].join("\n");
  const head = [
    `<b>${escapeHtml(title)}</b>`,
    "",
    ...shown.map(([label, value]) => `<b>${label}:</b> ${escapeHtml(value)}`),
    "",
    "<b>Items</b>",
    "",
  ].join("\n");
  const foot = adminUrl ? `\n\n<a href="${escapeHtml(adminUrl)}">Open the admin panel</a>` : "";
  return {
    subject,
    text,
    telegram: fitTelegram(head, [...items, ...(notes ? ["", `Notes: ${notes}`] : [])].join("\n"), foot),
  };
}
