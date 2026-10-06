import { createHash } from "node:crypto";
import { api } from "@/convex/_generated/api";
import { adminApi, adminToken } from "@/lib/admin";
import { liveChatResponse } from "@/lib/chat-live-server";

export const maxDuration = 300;
export async function GET(request: Request) {
  const token = await adminToken();
  const secret = process.env.ADMIN_API_SECRET;
  if (!token || !secret) return new Response(null, { status: 401 });
  const params = new URL(request.url).searchParams;
  const threadId = params.get("t")?.slice(0, 64);
  const sort = params.get("sort") === "cost" ? "cost" as const : undefined;
  const response = await adminApi("chats", { token, threadId, sort }).catch(() => null);
  if (!response?.ok) return new Response(null, { status: response?.status === 401 ? 401 : 503 });
  return liveChatResponse(request, api.chatLive.inbox, {
    secret, tokenHash: createHash("sha256").update(token).digest("hex"),
    ...(threadId && { threadId }), ...(sort && { sort }),
  });
}
