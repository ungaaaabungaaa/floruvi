// Website chat rules shared by Convex, the Next.js routes and tests.

/** The chat cookie holds 32 random bytes as base64url; Convex stores only its SHA-256. */
export const CHAT_TOKEN = /^[A-Za-z0-9_-]{43}$/;
export const MAX_CHAT_TEXT = 500;
/** Chats are deleted this long after their last message (proposal in docs/26). */
export const CHAT_RETENTION_DAYS = 180;

export type ChatMode = "bot" | "owner" | "closed";
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
