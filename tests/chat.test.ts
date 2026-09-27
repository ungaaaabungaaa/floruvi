import test from "node:test";
import assert from "node:assert/strict";
import { isStepCount, readUIMessageStream, simulateReadableStream, streamText, toUIMessageStream } from "ai";
import { MockLanguageModelV4 } from "ai/test";
import type { z } from "zod";
import { chatSpend, costLabel, dayKey, monthKey, needsPerson, toMicros } from "../lib/chat";
import { chatInstructions, chatTools, historyMessages, replyCost, replySummary } from "../lib/chat-bot";
import { POST } from "../app/api/chat/route";

const products = [
  {
    slug: "spinach",
    name: "Spinach",
    englishName: "Spinach",
    description: "Tender leaves.",
    uses: ["Palak paneer"],
    category: "leafy-greens",
    featured: true,
    price: { amountMinor: 10500, currency: "INR", packLabel: "250 g" },
    inStock: true,
  },
  {
    slug: "mint",
    name: "Mint",
    englishName: "Mint",
    description: "Fresh mint.",
    uses: ["Chutney"],
    category: "herbs",
    featured: false,
    price: { amountMinor: 5600, currency: "INR", packLabel: "1 bunch" },
    inStock: false,
  },
];
const usage = {
  inputTokens: { total: 5, noCache: 5, cacheRead: undefined, cacheWrite: undefined },
  outputTokens: { total: 5, text: 5, reasoning: undefined },
};
const options = { toolCallId: "call-1", messages: [] } as never;

test("code hands a chat to the owner for people, orders and refunds, in English and Hinglish", () => {
  for (const text of [
    "Can I talk to a real person?",
    "where is my order??",
    "I want a refund",
    "koi insaan se baat karni hai",
    "mera order kab aayega",
    "please call me back",
  ])
    assert.ok(needsPerson(text), text);
  for (const text of ["I want to place an order for spinach", "palak hai kya?", "What is the delivery fee?"])
    assert.equal(needsPerson(text), null, text);
});

test("tools check every argument and return only public catalogue data", async () => {
  let handedOff = "";
  const tools = chatTools(products, "en-IN", (reason) => (handedOff = reason));
  const found = await tools.findProducts.execute!({ query: "palak" }, options);
  assert.deepEqual(found, [
    { slug: "spinach", name: "Spinach", price: "₹105", pack: "250 g", inStock: true },
  ]);
  assert.deepEqual(await tools.addToBasket.execute!({ slug: "spinach", quantity: 2 }, options), {
    ok: true,
    slug: "spinach",
    name: "Spinach",
    quantity: 2,
  });
  for (const slug of ["mint", "gold"]) {
    const result = (await tools.addToBasket.execute!({ slug, quantity: 1 }, options)) as { ok: boolean };
    assert.equal(result.ok, false, slug);
  }
  const quantity = tools.addToBasket.inputSchema as z.ZodType;
  for (const bad of [0, 100, 1.5, -1])
    assert.equal(quantity.safeParse({ slug: "spinach", quantity: bad }).success, false, String(bad));
  assert.deepEqual(await tools.getProduct.execute!({ slug: "gold" }, options), {
    error: "No product has this slug. Use findProducts first.",
  });
  await tools.handOff.execute!({ reason: "Order question" }, options);
  assert.equal(handedOff, "Order question");
});

test("a streamed tool call becomes a basket button and is saved with the reply", async () => {
  let call = 0;
  const model = new MockLanguageModelV4({
    doStream: async () => ({
      stream: simulateReadableStream({
        // The two steps: a tool call, then the text answer.
        chunks: (call++ === 0
            ? [
                {
                  type: "tool-call",
                  toolCallId: "call-1",
                  toolName: "addToBasket",
                  input: JSON.stringify({ slug: "spinach", quantity: 2 }),
                },
                { type: "finish", finishReason: { unified: "tool-calls", raw: undefined }, usage },
              ]
            : [
                { type: "text-start", id: "t" },
                { type: "text-delta", id: "t", delta: "Spinach is ₹105 for 250 g." },
                { type: "text-end", id: "t" },
                { type: "finish", finishReason: { unified: "stop", raw: undefined }, usage },
              ]) as never,
      }),
    }),
  });
  const result = streamText({
    model,
    instructions: "test",
    messages: historyMessages([{ author: "customer", text: "2 palak please" }]),
    tools: chatTools(products, "en-IN", () => {}),
    stopWhen: isStepCount(4),
  });
  let last;
  for await (const message of readUIMessageStream({ stream: toUIMessageStream({ stream: result.stream }) }))
    last = message;
  const { text, products: saved } = replySummary(last!);
  assert.equal(text, "Spinach is ₹105 for 250 g.");
  assert.deepEqual(saved, [{ slug: "spinach", name: "Spinach", quantity: 2 }]);
});

test("instructions carry the rules and facts but no secrets", () => {
  const instructions = chatInstructions({
    countryName: "India",
    domestic: true,
    deliveryFee: "₹99",
    paymentsOn: true,
    faq: [["Do I need an account?", "No account needed."]],
  });
  assert.match(instructions, /Never state a price/);
  assert.match(instructions, /Razorpay/);
  assert.match(instructions, /₹99/);
  assert.match(instructions, /Do I need an account\?/);
  assert.doesNotMatch(instructions, /secret|api key|convex/i);
  assert.doesNotMatch(
    chatInstructions({ countryName: "Japan", domestic: false, deliveryFee: null, paymentsOn: true, faq: [] }),
    /Razorpay/,
  );
});

test("chat route refuses bad requests and stays silent while the owner answers", async (t) => {
  const original = {
    secret: process.env.LEAD_INGEST_SECRET,
    site: process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
    key: process.env.OPENROUTER_API_KEY,
    fetch: globalThis.fetch,
  };
  t.after(() => {
    for (const [key, value] of [
      ["LEAD_INGEST_SECRET", original.secret],
      ["NEXT_PUBLIC_CONVEX_SITE_URL", original.site],
      ["OPENROUTER_API_KEY", original.key],
    ] as const) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    globalThis.fetch = original.fetch;
  });
  const request = (body: unknown, origin = "https://farm.example", cookie = "") =>
    new Request("https://farm.example/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", origin, ...(cookie && { cookie }) },
      body: JSON.stringify(body),
    });
  const good = { text: "Talk to a person", locale: "en-in" };
  delete process.env.OPENROUTER_API_KEY;
  process.env.LEAD_INGEST_SECRET = "test-only-secret-0123456789";
  process.env.NEXT_PUBLIC_CONVEX_SITE_URL = "https://example.convex.site";
  assert.equal((await POST(request(good))).status, 503);
  process.env.OPENROUTER_API_KEY = "test-key";
  globalThis.fetch = async () => {
    throw new Error("No network call allowed");
  };
  assert.equal((await POST(request(good, "https://attacker.invalid"))).status, 403);
  assert.equal((await POST(request({ ...good, locale: "xx-yy" }))).status, 400);
  assert.equal((await POST(request({ ...good, text: "x".repeat(301) }))).status, 400);
  assert.equal((await POST(request({ ...good, extra: 1 }))).status, 400);

  let sent: Record<string, unknown> = {};
  globalThis.fetch = async (_url, init) => {
    sent = JSON.parse(String(init?.body));
    return Response.json({ ok: false, reason: "limited" });
  };
  const limited = await POST(request(good));
  assert.equal(limited.status, 429);
  assert.match(String(sent.token), /^[A-Za-z0-9_-]{43}$/);
  assert.match(String(sent.ipHash), /^[a-f0-9]{64}$/);
  // A new visitor gets an httpOnly cookie; the token never appears in the body.
  assert.match(limited.headers.get("set-cookie") ?? "", /floruvi-chat=[A-Za-z0-9_-]{43}; .*HttpOnly/);

  const cookie = `floruvi-chat=${"a".repeat(43)}`;
  globalThis.fetch = async (_url, init) => {
    sent = JSON.parse(String(init?.body));
    return Response.json({ ok: true, mode: "owner", handedOff: true, history: [] });
  };
  const handedOff = await POST(request(good, undefined, cookie));
  assert.equal(handedOff.status, 200);
  assert.equal(sent.token, "a".repeat(43));
  assert.equal(handedOff.headers.get("set-cookie"), null);
  const stream = await handedOff.text();
  assert.match(stream, /passed this to the Floruvi team/);
  assert.match(stream, /"mode":"owner"/);

  // Monthly budget used up: a short notice, and no model call at all.
  globalThis.fetch = async (url) => {
    assert.match(String(url), /\/chat\/turn$/, "no model or catalogue call when paused");
    return Response.json({ ok: true, mode: "bot", handedOff: false, paused: true, history: [] });
  };
  const paused = await POST(request({ text: "palak?", locale: "en-in" }, undefined, cookie));
  assert.equal(paused.status, 200);
  assert.match(await paused.text(), /assistant is paused/);
});

test("spend limits pause the assistant for the month or hand one costly chat to the owner", () => {
  const limits = { monthMicros: toMicros(5), chatDayMicros: toMicros(0.05) };
  assert.equal(chatSpend({ monthMicros: 4_999_999, chatTodayMicros: 49_999 }, limits), "ok");
  assert.equal(chatSpend({ monthMicros: 5_000_000, chatTodayMicros: 0 }, limits), "month");
  assert.equal(chatSpend({ monthMicros: 10, chatTodayMicros: 50_000 }, limits), "chat");
  // India days and months: 31 August 18:29 UTC is already 1 September in India.
  const lateAugustUtc = Date.UTC(2026, 7, 31, 18, 31);
  assert.equal(dayKey(lateAugustUtc), "2026-09-01");
  assert.equal(monthKey(lateAugustUtc), "2026-09");
  assert.equal(monthKey(Date.UTC(2026, 7, 31, 18, 29)), "2026-08");
  assert.equal(costLabel(1_234), "$0.0012 (≈ ₹0.10)");
  assert.equal(costLabel(2_500_000), "$2.50 (≈ ₹213)");
});

test("a reply's cost adds up every model call and ignores missing or bad reports", async () => {
  const steps = [
    { providerMetadata: { openrouter: { usage: { cost: 0.00031 } } } },
    { providerMetadata: { openrouter: { usage: { cost: 0.00012 } } } },
    { providerMetadata: { openrouter: { usage: { cost: "free" } } } },
    { providerMetadata: undefined },
  ];
  assert.deepEqual(
    await replyCost({
      steps: Promise.resolve(steps),
      totalUsage: Promise.resolve({ inputTokens: 5200, outputTokens: 180 }),
    }),
    { costMicros: 430, tokensIn: 5200, tokensOut: 180 },
  );
  assert.deepEqual(
    await replyCost({ steps: Promise.reject(new Error("stream failed")), totalUsage: Promise.resolve({ inputTokens: 1, outputTokens: 1 }) }),
    { costMicros: 0, tokensIn: 0, tokensOut: 0 },
  );
});
