import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { hasBearer, readObject, reply, sha256, text } from "./httpUtils";

// HTTP entry points for the Next.js admin pages. The caller must hold
// ADMIN_API_SECRET (server-only); every call except sign-in also needs a live session.

const TOKEN = /^[A-Za-z0-9_-]{43}$/;
const HEX64 = /^[a-f0-9]{64}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Admin calls need ADMIN_API_SECRET, which is at least 32 characters. */
async function fromServer(request: Request) {
  const secret = process.env.ADMIN_API_SECRET;
  return !!secret && secret.length >= 32 && hasBearer(request, secret);
}

const readBody = (request: Request) => readObject(request, 4000);

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

export const payments = httpAction(async (ctx, request) => {
  if (!(await fromServer(request))) return reply(401);
  const body = await readBody(request);
  const token = text(body?.token);
  if (!TOKEN.test(token) || typeof body?.enabled !== "boolean") return reply(400);
  const result = await ctx.runMutation(internal.admin.setPayments, {
    tokenHash: await sha256(token),
    enabled: body.enabled,
  });
  return reply(result === "ok" ? 200 : result === "missing" ? 404 : result === "keys" ? 409 : 401, {
    result,
  });
});

export const logout = httpAction(async (ctx, request) => {
  if (!(await fromServer(request))) return reply(401);
  const token = text((await readBody(request))?.token);
  if (TOKEN.test(token))
    await ctx.runMutation(internal.admin.endSession, { tokenHash: await sha256(token) });
  return reply(200);
});
