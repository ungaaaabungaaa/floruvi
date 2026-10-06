import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { convexTest } from "convex-test";
import { v } from "convex/values";
import schema from "../convex/schema";
import { api, internal } from "../convex/_generated/api";
import { internalAction } from "../convex/_generated/server";
import { CHAT_IDLE_MS } from "../lib/chat";

const modules = {
  "../convex/_generated/server.ts": () => import("../convex/_generated/server"),
  "../convex/chat.ts": () => import("../convex/chat"),
  "../convex/chatLive.ts": () => import("../convex/chatLive"),
  "../convex/notifications.ts": async () => ({ sendChat: internalAction({ args: { id: v.id("chatThreads") }, handler: async () => null }) }),
};
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
const owner = hash("owner-test");
const visitor = hash("visitor-test");
const secret = "chat-test-secret-not-used-outside-tests";
const sessionA = "00000000-0000-4000-8000-000000000001";
const sessionB = "00000000-0000-4000-8000-000000000002";
async function setup() {
  const db = convexTest(schema, modules);
  await db.run(async (ctx) => {
    await ctx.db.insert("adminSessions", { tokenHash: owner, expiresAt: Date.now() + 3600000 });
    await ctx.db.insert("storeSettings", { key: "commerce", currency: "INR", deliveryFeeMinor: 9900, chatEnabled: true });
  });
  return db;
}
const turn = (tokenHash = visitor, sessionId: string | undefined = sessionA) => ({ tokenHash, sessionId, ipHash: hash("test-ip"), text: "Delivery question", language: "en", market: "in" });

test("browser sessions create separate owned threads and history never crosses visitors", async () => {
  const db = await setup();
  await db.mutation(internal.chat.customerTurn, turn());
  await db.mutation(internal.chat.customerTurn, turn(visitor, sessionB));
  await db.mutation(internal.chat.customerTurn, turn(hash("other"), sessionA));
  const own = await db.query(internal.chat.customerThread, { tokenHash: visitor, sessionId: sessionA });
  assert.equal(own.messages.length, 1);
  assert.equal(own.history.length, 2);
  assert.deepEqual(new Set(own.history.map((t) => t.sessionId)), new Set([sessionA, sessionB]));
  const stranger = await db.query(internal.chat.customerThread, { tokenHash: hash("stranger"), sessionId: sessionA });
  assert.equal(stranger.messages.length, 0);
  assert.equal(stranger.history.length, 0);
});

test("legacy cookie-owned chats remain accessible without a session ID", async () => {
  const db = await setup();
  await db.mutation(internal.chat.customerTurn, { ...turn(), sessionId: undefined });
  const legacy = await db.query(internal.chat.customerThread, { tokenHash: visitor });
  assert.equal(legacy.messages.length, 1);
  assert.equal(legacy.history[0].sessionId, "");
});

test("a team reply is saved in the exact visitor session and takes over an AI-owned chat", async () => {
  const db = await setup();
  await db.mutation(internal.chat.customerTurn, turn());
  await db.mutation(internal.chat.customerTurn, turn(visitor, sessionB));
  const inbox = await db.query(internal.chat.inbox, { tokenHash: owner });
  const id = inbox!.threads[1].id;
  assert.equal(await db.mutation(internal.chat.ownerUpdate, { tokenHash: owner, threadId: id, text: "Team test reply" }), "ok");
  const a = await db.query(internal.chat.customerThread, { tokenHash: visitor, sessionId: sessionA });
  const b = await db.query(internal.chat.customerThread, { tokenHash: visitor, sessionId: sessionB });
  assert.equal(a.mode, "owner");
  assert.equal(a.messages.at(-1)?.text, "Team test reply");
  assert.equal(b.messages.length, 1);
  // A model that finishes after takeover must not overwrite the team's answer.
  await db.mutation(internal.chat.botReply, { tokenHash: visitor, sessionId: sessionA, text: "Late AI reply" });
  assert.equal((await db.query(internal.chat.customerThread, { tokenHash: visitor, sessionId: sessionA })).messages.length, 2);
});

test("typing uses an expiring signal, rejects unauthorized agents, and clears on reply", async () => {
  const db = await setup();
  await db.mutation(internal.chat.customerTurn, turn());
  const id = (await db.query(internal.chat.inbox, { tokenHash: owner }))!.threads[0].id;
  assert.equal(await db.mutation(internal.chat.ownerTyping, { tokenHash: hash("wrong"), threadId: id, typing: true }), "unauthorized");
  await db.mutation(internal.chat.ownerTyping, { tokenHash: owner, threadId: id, typing: true });
  const thread = await db.query(internal.chat.customerThread, { tokenHash: visitor, sessionId: sessionA });
  assert.ok(thread.typingUntil > Date.now());
  assert.ok(thread.typingUntil <= Date.now() + 8000);
  await db.run((ctx) => ctx.db.patch(id, { unread: true }));
  await db.mutation(internal.chat.ownerUpdate, { tokenHash: owner, threadId: id, read: true });
  assert.equal((await db.query(internal.chat.inbox, { tokenHash: owner }))?.threads[0].unread, false);
  assert.equal((await db.query(internal.chat.customerThread, { tokenHash: visitor, sessionId: sessionA })).typingUntil, thread.typingUntil);
  await db.mutation(internal.chat.ownerUpdate, { tokenHash: owner, threadId: id, text: "Reply" });
  assert.equal((await db.query(internal.chat.customerThread, { tokenHash: visitor, sessionId: sessionA })).typingUntil, 0);
});

test("three-day closure preserves messages; recent chats cannot be archived; archive can be restored", async () => {
  const db = await setup();
  await db.mutation(internal.chat.customerTurn, turn());
  await db.mutation(internal.chat.customerTurn, turn(visitor, sessionB));
  const inbox = await db.query(internal.chat.inbox, { tokenHash: owner });
  const [recent, old] = inbox!.threads;
  assert.equal(await db.mutation(internal.chat.ownerUpdate, { tokenHash: owner, threadId: recent.id, archive: true }), "recent");
  await db.run((ctx) => ctx.db.patch(old.id, { lastMessageAt: Date.now() - CHAT_IDLE_MS - 1 }));
  await db.mutation(internal.chat.closeIdle, {});
  const closed = await db.query(internal.chat.inbox, { tokenHash: owner, threadId: old.id });
  assert.equal(closed?.selected?.mode, "closed");
  assert.equal(closed?.selected?.messages.length, 1);
  assert.equal(await db.mutation(internal.chat.ownerUpdate, { tokenHash: owner, threadId: old.id, archive: true }), "ok");
  assert.ok((await db.query(internal.chat.inbox, { tokenHash: owner, threadId: old.id }))?.selected?.archivedAt);
  await db.mutation(internal.chat.ownerUpdate, { tokenHash: owner, threadId: old.id, archive: false });
  assert.equal((await db.query(internal.chat.inbox, { tokenHash: owner, threadId: old.id }))?.selected?.archivedAt, null);
  assert.equal((await db.mutation(internal.chat.customerTurn, turn())).ok, false);
});

test("live queries deny missing server credentials and expired admin sessions on direct calls", async (t) => {
  const db = await setup();
  const before = { LEAD_INGEST_SECRET: process.env.LEAD_INGEST_SECRET, ADMIN_API_SECRET: process.env.ADMIN_API_SECRET };
  Object.assign(process.env, { LEAD_INGEST_SECRET: secret, ADMIN_API_SECRET: secret });
  t.after(() => { for (const [key, value] of Object.entries(before)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; } });
  await db.mutation(internal.chat.customerTurn, turn());
  assert.equal(await db.query(api.chatLive.customer, { secret: "wrong", tokenHash: visitor, sessionId: sessionA }), null);
  assert.equal(await db.query(api.chatLive.inbox, { secret, tokenHash: hash("wrong-session") }), null);
  const own = await db.query(api.chatLive.customer, { secret, tokenHash: visitor, sessionId: sessionA });
  assert.equal(own?.messages.length, 1);
  assert.equal((await db.query(api.chatLive.customer, { secret, tokenHash: hash("stranger"), sessionId: sessionA }))?.messages.length, 0);
  const id = await db.run(async (ctx) => (await ctx.db.query("adminSessions").first())!._id);
  await db.run((ctx) => ctx.db.patch(id, { expiresAt: Date.now() - 1 }));
  assert.equal(await db.query(api.chatLive.inbox, { secret, tokenHash: owner }), null);
});
