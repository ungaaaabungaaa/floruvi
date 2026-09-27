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
  // Telegram rejects messages over 4096 characters; never cut inside an entity.
  let body = "";
  const budget = 4000 - head.length - foot.length;
  for (const char of enquiry.message) {
    const piece = escapeHtml(char);
    if (body.length + piece.length > budget - 1) {
      body += "…";
      break;
    }
    body += piece;
  }
  return { subject, text, telegram: head + body + foot };
}
