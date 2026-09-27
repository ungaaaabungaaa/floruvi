import { randomBytes } from "node:crypto";
import { after } from "next/server";
import { fetchQuery } from "convex/nextjs";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
} from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";
import { api } from "@/convex/_generated/api";
import { MAX_CHAT_TEXT, type ChatMode } from "@/lib/chat";
import {
  chatInstructions,
  chatTools,
  DEFAULT_MODEL,
  FALLBACK_MODEL,
  historyMessages,
  replySummary,
} from "@/lib/chat-bot";
import { chatBackend, chatCookie, chatToken } from "@/lib/chat-server";
import { faqGroups } from "@/lib/faq";
import { countryName, formatCurrency } from "@/lib/i18n/format";
import { isLocale, parseLocale } from "@/lib/i18n/config";
import { loadMessages } from "@/lib/i18n/messages";
import { isSameOrigin } from "@/lib/request-origin";
import { callerHash, keyedHash, readJson } from "@/lib/read-json";
import { siteUrl } from "@/lib/site";

// Allow a streamed reply with tool calls to finish.
export const maxDuration = 30;

// Whether the owner has switched the website chat on, and whether the AI assistant
// is connected. Cached briefly at the edge, so a change reaches visitors within a minute.
export async function GET() {
  const ai = !!process.env.OPENROUTER_API_KEY;
  try {
    const { enabled } = await fetchQuery(api.storefront.chat, {});
    return Response.json(
      { enabled, ai },
      {
        headers: {
          // Browsers always ask again; only Vercel's edge keeps the answer briefly.
          "Cache-Control": "no-store",
          "Vercel-CDN-Cache-Control": "max-age=30, stale-while-revalidate=30",
        },
      },
    );
  } catch {
    return Response.json({ enabled: false, ai }, { headers: { "Cache-Control": "no-store" } });
  }
}

const schema = z
  .object({
    text: z.string().trim().min(1).max(MAX_CHAT_TEXT),
    locale: z.string().refine(isLocale),
  })
  .strict();

const statusFor: Record<string, number> = { limited: 429, invalid: 400 };

export async function POST(request: Request) {
  const secret = process.env.LEAD_INGEST_SECRET;
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!secret || !apiKey) return Response.json({ error: "off" }, { status: 503 });
  if (!isSameOrigin(request)) return Response.json({ error: "origin" }, { status: 403 });
  const body = await readJson(request, 2000);
  if (!body.ok) return body.response;
  const parsed = schema.safeParse(body.value);
  if (!parsed.success) return Response.json({ error: "invalid" }, { status: 400 });
  const locale = parseLocale(parsed.data.locale as Parameters<typeof parseLocale>[0]);
  const saved = chatToken(request);
  const token = saved ?? randomBytes(32).toString("base64url");
  const headers: Record<string, string> = {
    "Cache-Control": "no-store",
    ...(!saved && { "Set-Cookie": chatCookie(token) }),
  };
  const turn = await chatBackend("turn", {
    token,
    ipHash: callerHash(request, secret),
    text: parsed.data.text,
    language: locale.language,
    market: locale.market,
  });
  if (!turn?.ok)
    return Response.json(
      { error: turn?.reason ?? "off" },
      { status: statusFor[String(turn?.reason)] ?? 503, headers },
    );
  const messages = await loadMessages(locale.language);
  const mode = turn.mode as ChatMode;

  // The owner answers this chat: store only, and say so once at hand-off.
  if (mode !== "bot")
    return createUIMessageStreamResponse({
      headers,
      stream: createUIMessageStream({
        execute: ({ writer }) => {
          writer.write({ type: "start", messageMetadata: { mode } });
          if (turn.handedOff) {
            writer.write({ type: "text-start", id: "handoff" });
            writer.write({ type: "text-delta", id: "handoff", delta: messages.common.chat.handedOff });
            writer.write({ type: "text-end", id: "handoff" });
          }
          writer.write({ type: "finish" });
        },
      }),
    });

  const [catalogue, payments, english] = await Promise.all([
    fetchQuery(api.storefront.catalogue, { language: locale.language, market: locale.market }),
    fetchQuery(api.storefront.payments, {}).catch(() => ({ enabled: false })),
    loadMessages("en"),
  ]);
  let handOff: string | null = null;
  let failed = false;
  const openrouter = createOpenRouter({
    apiKey,
    compatibility: "strict",
    appName: "Floruvi",
    appUrl: siteUrl,
  });
  const result = streamText({
    model: openrouter.chat(process.env.OPENROUTER_MODEL || DEFAULT_MODEL, {
      models: [process.env.OPENROUTER_FALLBACK_MODEL || FALLBACK_MODEL],
      reasoning: { effort: "minimal", exclude: true },
      // Only providers that do not keep or train on customer messages.
      provider: { data_collection: "deny" },
      user: keyedHash(token, secret).slice(0, 32),
    }),
    instructions: chatInstructions({
      countryName: countryName(locale.country, "en"),
      domestic: locale.domestic,
      deliveryFee:
        catalogue.commerce?.deliveryFeeMinor == null
          ? null
          : formatCurrency(catalogue.commerce.deliveryFeeMinor, "INR", "en-IN"),
      paymentsOn: payments.enabled,
      faq: faqGroups(english.faq, {
        domestic: locale.domestic,
        countryName: countryName(locale.country, "en"),
        tag: "en-IN",
        deliveryFeeMinor: catalogue.commerce?.deliveryFeeMinor,
      }).flatMap((group) => group.questions),
    }),
    messages: historyMessages(turn.history),
    tools: chatTools(catalogue.products, locale.tag, (reason) => {
      handOff ??= reason;
    }),
    stopWhen: isStepCount(4),
    maxOutputTokens: 500,
    temperature: 0.3,
  });
  // Finish and save the reply even if the visitor closes the chat mid-answer.
  result.consumeStream();
  let done: () => void = () => {};
  const stored = new Promise<void>((resolve) => (done = resolve));
  after(() => Promise.race([stored, new Promise((resolve) => setTimeout(resolve, 25_000))]));
  return createUIMessageStreamResponse({
    headers,
    stream: toUIMessageStream({
      stream: result.stream,
      messageMetadata: ({ part }) => (part.type === "start" ? { mode: "bot" } : undefined),
      onError: () => {
        failed = true;
        return messages.common.chat.error;
      },
      onEnd: async ({ responseMessage }) => {
        const { text, products } = replySummary(responseMessage);
        // A failed answer goes to the owner, so no customer is left without a reply.
        await chatBackend("reply", {
          token,
          text,
          products,
          handOff: handOff ?? (failed ? "The assistant could not answer" : undefined),
        });
        done();
      },
    }),
  });
}
