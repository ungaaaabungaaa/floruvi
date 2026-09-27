import { createHmac } from "node:crypto";
import { cookies, headers } from "next/headers";
import type { FunctionReturnType } from "convex/server";
import type { internal } from "@/convex/_generated/api";

// Server-only helpers for the owner's admin pages. The session token lives in an
// httpOnly cookie; Convex stores only its hash and checks it on every call.

export type Dashboard = NonNullable<FunctionReturnType<typeof internal.admin.dashboard>>;

const secure = process.env.NODE_ENV === "production";
// __Host- cookies must be Secure, host-only and path "/", so no subdomain can set them.
export const ADMIN_COOKIE = secure ? "__Host-floruvi-admin" : "floruvi-admin";
export const cookieOptions = { httpOnly: true, secure, sameSite: "lax", path: "/" } as const;

export async function adminToken() {
  return (await cookies()).get(ADMIN_COOKIE)?.value ?? null;
}

/** Calls a Convex admin HTTP route with the server secret. Null when not configured. */
export async function adminApi(
  path: "login" | "dashboard" | "stock" | "chat" | "logout",
  body: object,
) {
  const site = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
  const secret = process.env.ADMIN_API_SECRET;
  if (!site || !secret) return null;
  return fetch(`${site}/admin/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
}

/** Keyed hash of the caller's address for sign-in limits; the address itself is never sent. */
export async function callerHash() {
  const list = await headers();
  // Vercel overwrites this header. Never trust a caller-controlled forwarded header.
  const ip =
    process.env.VERCEL === "1"
      ? list.get("x-vercel-forwarded-for")?.split(",")[0]?.trim()
      : "local";
  return createHmac("sha256", process.env.ADMIN_API_SECRET ?? "").update(ip || "unknown").digest("hex");
}
