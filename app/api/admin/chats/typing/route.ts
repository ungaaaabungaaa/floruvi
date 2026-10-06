import { adminApi, adminToken } from "@/lib/admin";
import { isSameOrigin } from "@/lib/request-origin";
import { readJson } from "@/lib/read-json";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return new Response(null, { status: 403 });
  const token = await adminToken();
  if (!token) return new Response(null, { status: 401 });
  const body = await readJson(request, 500);
  if (!body.ok) return body.response;
  const data = body.value as Record<string, unknown> | null;
  if (!data || typeof data.threadId !== "string" || data.threadId.length > 64 || typeof data.typing !== "boolean") return new Response(null, { status: 400 });
  const response = await adminApi("chat-typing", { token, threadId: data.threadId, typing: data.typing }).catch(() => null);
  return new Response(null, { status: response?.status ?? 503 });
}
