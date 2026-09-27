import { chatBackend, chatToken } from "@/lib/chat-server";

// The visitor's own chat, to restore the window and to show the owner's replies.
export async function GET(request: Request) {
  const token = chatToken(request);
  const data = token ? await chatBackend("thread", { token }) : null;
  return Response.json(data ?? { mode: "bot", messages: [] }, {
    headers: { "Cache-Control": "no-store" },
  });
}
