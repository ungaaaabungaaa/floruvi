import { createHash } from "node:crypto";
import { api } from "@/convex/_generated/api";
import { CHAT_SESSION } from "@/lib/chat";
import { chatToken } from "@/lib/chat-server";
import { liveChatResponse } from "@/lib/chat-live-server";

export const maxDuration = 300;
export async function GET(request: Request) {
  const token = chatToken(request);
  const secret = process.env.LEAD_INGEST_SECRET;
  if (!token) return new Response(null, { status: 204 });
  if (!secret) return new Response(null, { status: 503 });
  const session = new URL(request.url).searchParams.get("session") ?? "";
  if (session && !CHAT_SESSION.test(session)) return new Response(null, { status: 400 });
  return liveChatResponse(request, api.chatLive.customer, {
    secret, tokenHash: createHash("sha256").update(token).digest("hex"),
    ...(session && { sessionId: session }),
  });
}
