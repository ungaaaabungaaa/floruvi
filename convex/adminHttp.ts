import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

// HTTP entry points for the Next.js admin pages. The caller must hold
// ADMIN_API_SECRET (server-only); every call except sign-in also needs a live session.

const TOKEN = /^[A-Za-z0-9_-]{43}$/;
const HEX64 = /^[a-f0-9]{64}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

async function sha256(text: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Compares digests, so the time taken does not depend on how much of the secret matched. */
async function fromServer(request: Request) {
  const secret = process.env.ADMIN_API_SECRET;
  if (!secret || secret.length < 32) return false;
  const [given, expected] = await Promise.all([
    sha256(request.headers.get("Authorization") ?? ""),
    sha256(`Bearer ${secret}`),
  ]);
  let difference = 0;
  for (let i = 0; i < expected.length; i++) difference |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  return difference === 0;
}

async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  const text = await request.text();
  if (text.length > 4000) return null;
  try {
    const value = JSON.parse(text);
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
}

const reply = (status: number, data: object = {}) => Response.json(data, { status });
const text = (value: unknown) => (typeof value === "string" ? value : "");

export const login = httpAction(async (ctx, request) => {
  if (!(await fromServer(request))) return reply(401);
  const body = await readBody(request);
  const ipHash = text(body?.ipHash);
  if (!body || !HEX64.test(ipHash) || typeof body.remember !== "boolean") return reply(400);
  if (!(await ctx.runMutation(internal.admin.reserveLoginAttempt, { ipHash })))
    return reply(429, { error: "limited" });
  const valid = await ctx.runAction(internal.adminAuth.verify, {
    email: text(body.email),
    aadhaar: text(body.aadhaar),
    dob: text(body.dob),
    phone: text(body.phone),
    password: text(body.password),
  });
  if (!valid) return reply(401, { error: "invalid" });
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const token = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const { maxAgeSeconds } = await ctx.runMutation(internal.admin.startSession, {
    tokenHash: await sha256(token),
    remember: body.remember,
    ipHash,
  });
  return reply(200, { token, maxAgeSeconds });
});

export const dashboard = httpAction(async (ctx, request) => {
  if (!(await fromServer(request))) return reply(401);
  const token = text((await readBody(request))?.token);
  if (!TOKEN.test(token)) return reply(401);
  const data = await ctx.runQuery(internal.admin.dashboard, { tokenHash: await sha256(token) });
  return data ? reply(200, data) : reply(401);
});

export const stock = httpAction(async (ctx, request) => {
  if (!(await fromServer(request))) return reply(401);
  const body = await readBody(request);
  const token = text(body?.token);
  const slug = text(body?.slug);
  if (!TOKEN.test(token) || !SLUG.test(slug) || slug.length > 100 || typeof body?.inStock !== "boolean")
    return reply(400);
  const result = await ctx.runMutation(internal.admin.setStock, {
    tokenHash: await sha256(token),
    slug,
    inStock: body.inStock,
  });
  return reply(result === "ok" ? 200 : result === "missing" ? 404 : 401, { result });
});

export const chat = httpAction(async (ctx, request) => {
  if (!(await fromServer(request))) return reply(401);
  const body = await readBody(request);
  const token = text(body?.token);
  if (!TOKEN.test(token) || typeof body?.enabled !== "boolean") return reply(400);
  const result = await ctx.runMutation(internal.admin.setChat, {
    tokenHash: await sha256(token),
    enabled: body.enabled,
  });
  return reply(result === "ok" ? 200 : result === "missing" ? 404 : 401, { result });
});

export const logout = httpAction(async (ctx, request) => {
  if (!(await fromServer(request))) return reply(401);
  const token = text((await readBody(request))?.token);
  if (TOKEN.test(token))
    await ctx.runMutation(internal.admin.endSession, { tokenHash: await sha256(token) });
  return reply(200);
});
