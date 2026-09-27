import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { languages, markets } from "../lib/i18n/config";
import { CHAT_TOKEN, MAX_CHAT_TEXT } from "../lib/chat";
import { hasBearer, readObject, reply, sha256, text } from "./httpUtils";

// /chat/* are called by the Next.js server with LEAD_INGEST_SECRET and the
// visitor's chat cookie. /admin/chat* need ADMIN_API_SECRET and an owner session.

const HEX64 = /^[a-f0-9]{64}$/;
const ADMIN_TOKEN = /^[A-Za-z0-9_-]{43}$/;
const fromSite = (request: Request) => hasBearer(request, process.env.LEAD_INGEST_SECRET);
const fromAdmin = async (request: Request) => {
  const secret = process.env.ADMIN_API_SECRET;
  return !!secret && secret.length >= 32 && (await hasBearer(request, secret));
};

export const turn = httpAction(async (ctx, request) => {
  if (!(await fromSite(request))) return reply(401);
  const body = await readObject(request, 3000);
  const token = text(body?.token);
  const message = text(body?.text).trim();
  const language = text(body?.language);
  const market = text(body?.market);
  if (
    !CHAT_TOKEN.test(token) ||
    !HEX64.test(text(body?.ipHash)) ||
    !message ||
    message.length > MAX_CHAT_TEXT ||
    !Object.hasOwn(languages, language) ||
    !Object.hasOwn(markets, market)
  )
    return reply(400);
  const result = await ctx.runMutation(internal.chat.customerTurn, {
    tokenHash: await sha256(token),
    ipHash: text(body?.ipHash),
    text: message,
    language,
    market,
  });
  return reply(200, result);
});

export const botReply = httpAction(async (ctx, request) => {
  if (!(await fromSite(request))) return reply(401);
  const body = await readObject(request, 12_000);
  const token = text(body?.token);
  if (!CHAT_TOKEN.test(token)) return reply(400);
  const products = Array.isArray(body?.products)
    ? body.products
        .filter((p): p is Record<string, unknown> => !!p && typeof p === "object")
        .map((p) => ({
          slug: text(p.slug).slice(0, 100),
          name: text(p.name).slice(0, 120),
          ...(Number.isInteger(p.quantity) && { quantity: p.quantity as number }),
        }))
        .filter((p) => p.slug && p.name)
        .slice(0, 10)
    : [];
  await ctx.runMutation(internal.chat.botReply, {
    tokenHash: await sha256(token),
    text: text(body?.text),
    products,
    handOff: text(body?.handOff) || undefined,
  });
  return reply(200);
});

export const thread = httpAction(async (ctx, request) => {
  if (!(await fromSite(request))) return reply(401);
  const token = text((await readObject(request, 200))?.token);
  if (!CHAT_TOKEN.test(token)) return reply(400);
  const data = await ctx.runQuery(internal.chat.customerThread, { tokenHash: await sha256(token) });
  return reply(200, data ?? { mode: "bot", messages: [] });
});

export const inbox = httpAction(async (ctx, request) => {
  if (!(await fromAdmin(request))) return reply(401);
  const body = await readObject(request, 500);
  const token = text(body?.token);
  if (!ADMIN_TOKEN.test(token)) return reply(401);
  const data = await ctx.runQuery(internal.chat.inbox, {
    tokenHash: await sha256(token),
    threadId: text(body?.threadId).slice(0, 64) || undefined,
  });
  return data ? reply(200, data) : reply(401);
});

export const update = httpAction(async (ctx, request) => {
  if (!(await fromAdmin(request))) return reply(401);
  const body = await readObject(request, 6000);
  const token = text(body?.token);
  const mode = text(body?.mode);
  if (!ADMIN_TOKEN.test(token) || (mode && !["bot", "owner", "closed"].includes(mode)))
    return reply(400);
  const result = await ctx.runMutation(internal.chat.ownerUpdate, {
    tokenHash: await sha256(token),
    threadId: text(body?.threadId).slice(0, 64),
    text: text(body?.text) || undefined,
    mode: (mode || undefined) as "bot" | "owner" | "closed" | undefined,
  });
  return reply(result === "ok" ? 200 : result === "missing" ? 404 : 401, { result });
});
