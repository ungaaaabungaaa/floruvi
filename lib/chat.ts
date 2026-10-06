// Website chat rules shared by Convex, the Next.js routes and tests.

/** The chat cookie holds 32 random bytes as base64url; Convex stores only its SHA-256. */
export const CHAT_TOKEN = /^[A-Za-z0-9_-]{43}$/;
/** Characters per customer message; the chat box shows a counter near the end. */
export const MAX_CHAT_TEXT = 300;
/** Chats are deleted this long after their last message (proposal in docs/26). */
export const CHAT_RETENTION_DAYS = 180;

// Spend guards, in US dollars; Convex env CHAT_MONTHLY_BUDGET_USD and
// CHAT_DAILY_LIMIT_PER_CHAT_USD override them. Also set the same monthly limit
// on the OpenRouter key. Costs are stored in micros: millionths of a dollar.
export const CHAT_MONTHLY_BUDGET_USD = 5;
export const CHAT_DAILY_LIMIT_PER_CHAT_USD = 0.05;
/** For showing costs in rupees in the admin panel only; not a live rate. */
export const USD_TO_INR = 85;

export const toMicros = (usd: number) => Math.max(0, Math.round(usd * 1e6));
const IST = 5.5 * 60 * 60 * 1000;
/** India day and month keys, so budgets reset at midnight IST. */
export const dayKey = (time: number) => new Date(time + IST).toISOString().slice(0, 10);
export const monthKey = (time: number) => dayKey(time).slice(0, 7);

/** A cost in micros for the admin panel, in dollars and rupees: "$0.0042 (≈ ₹0.36)". */
export function costLabel(micros: number) {
  const usd = micros / 1e6;
  const inr = usd * USD_TO_INR;
  return `$${usd < 0.01 ? usd.toFixed(4) : usd.toFixed(2)} (≈ ₹${inr < 10 ? inr.toFixed(2) : Math.round(inr)})`;
}

/** Whether the assistant may answer: "month" when the budget is spent, "chat" when this chat hit today's limit. */
export function chatSpend(
  spent: { monthMicros: number; chatTodayMicros: number },
  limits: { monthMicros: number; chatDayMicros: number },
) {
  if (spent.monthMicros >= limits.monthMicros) return "month" as const;
  if (spent.chatTodayMicros >= limits.chatDayMicros) return "chat" as const;
  return "ok" as const;
}

export type ChatMode = "bot" | "owner" | "closed";
export const CHAT_SESSION = /^[a-f0-9-]{36}$/i;
export const CHAT_IDLE_MS = 3 * 24 * 60 * 60 * 1000;
export type CustomerChat = {
  mode: ChatMode;
  messages: StoredChatMessage[];
  typingUntil: number;
  history: { sessionId: string; preview: string; at: number; mode: ChatMode }[];
};
export type ChatProduct = { slug: string; name: string; quantity?: number };
export type StoredChatMessage = {
  id: string;
  author: "customer" | "bot" | "owner";
  text: string;
  products?: ChatProduct[];
  at: number;
};

const rules: [RegExp, string][] = [
  [
    /\b(refund|money back|cancel (my|the|this)? ?order|complain(t)?|damaged|rotten|wrong item|missing item)\b/i,
    "Refund, cancellation or complaint",
  ],
  [
    /\b(where is my order|order status|track(ing)? (my )?order|not (been )?(delivered|received)|late delivery|delayed|kab aayega|order kaha)\b/i,
    "Question about an existing order",
  ],
  [
    /\b(human|real person|talk to (a |some)?(one|person|someone|human)|speak to|customer (care|service|support)|agent|representative|call me|call back|phone me|insaan|kisi se baat|call karo|call kariye|phone karo)\b/i,
    "Asked for a person",
  ],
];

/**
 * Decided by code, not by the model: messages that need the owner. The model can
 * also hand off with its handOff tool, for other languages and unclear cases.
 */
export function needsPerson(text: string) {
  for (const [pattern, reason] of rules) if (pattern.test(text)) return reason;
  return null;
}
