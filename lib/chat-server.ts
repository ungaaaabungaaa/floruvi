import { CHAT_RETENTION_DAYS, CHAT_TOKEN } from "./chat";

// Server-only helpers for the website chat routes. The chat cookie is the only
// key to a thread: httpOnly, so page scripts cannot read it.

const secure = process.env.NODE_ENV === "production";
// __Host- cookies must be Secure, host-only and path "/", so no subdomain can set them.
export const CHAT_COOKIE = secure ? "__Host-floruvi-chat" : "floruvi-chat";

export function chatToken(request: Request) {
  const prefix = `${CHAT_COOKIE}=`;
  const value = request.headers
    .get("cookie")
    ?.split(/;\s*/)
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length);
  return value && CHAT_TOKEN.test(value) ? value : null;
}

export const chatCookie = (token: string) =>
  `${CHAT_COOKIE}=${token}; Path=/; Max-Age=${CHAT_RETENTION_DAYS * 24 * 60 * 60}; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}`;

/** Calls a Convex /chat route with the site's server secret. Null when not configured or failed. */
export async function chatBackend(path: "turn" | "reply" | "thread", body: object) {
  const site = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
  const secret = process.env.LEAD_INGEST_SECRET;
  if (!site || !secret) return null;
  try {
    const response = await fetch(`${site}/chat/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}
