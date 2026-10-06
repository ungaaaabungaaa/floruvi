import { chatBackend, chatToken } from "@/lib/chat-server";
import { CHAT_SESSION } from "@/lib/chat";

// The visitor's own chat, to restore the window and to show the owner's replies.
export async function GET(request: Request) {
  const token = chatToken(request);
  const session = new URL(request.url).searchParams.get("session") ?? "";
  if (session && !CHAT_SESSION.test(session)) return new Response(null, { status: 400 });
  const data = token ? await chatBackend("thread", { token, ...(session && { sessionId: session }) }) : null;
  return Response.json(data ?? { mode: "bot", messages: [], history: [], typingUntil: 0 }, {
    headers: { "Cache-Control": "no-store" },
  });
}
