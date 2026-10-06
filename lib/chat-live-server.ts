import { ConvexClient } from "convex/browser";
import type { FunctionReference } from "convex/server";
import type { Value } from "convex/values";

/** Bridge a cookie-authorized Convex subscription, without exposing credentials. */
export function liveChatResponse(request: Request, query: FunctionReference<"query">, args: Record<string, Value>) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return new Response(null, { status: 503 });
  const client = new ConvexClient(url, { logger: false });
  const encoder = new TextEncoder();
  let cleanup = () => {};
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false;
      let unsubscribe = () => {};
      const timers: ReturnType<typeof setTimeout>[] = [];
      const send = (text: string) => { if (!closed) controller.enqueue(encoder.encode(text)); };
      cleanup = () => {
        if (closed) return;
        closed = true;
        timers.forEach(clearTimeout);
        unsubscribe();
        void client.close();
        request.signal.removeEventListener("abort", cleanup);
      };
      const finish = () => { cleanup(); controller.close(); };
      request.signal.addEventListener("abort", cleanup, { once: true });
      send("retry: 1000\n\n");
      unsubscribe = client.onUpdate(query, args, (data) => {
        if (data === null) {
          send('event: denied\ndata: {}\n\n');
          finish();
        } else send(`data: ${JSON.stringify(data)}\n\n`);
      }, () => { send('event: unavailable\ndata: {}\n\n'); finish(); });
      const heartbeat = () => {
        if (closed) return;
        send(": connected\n\n");
        timers.push(setTimeout(heartbeat, 20_000));
      };
      timers.push(setTimeout(heartbeat, 20_000), setTimeout(finish, 240_000));
      if (request.signal.aborted) finish();
    },
    cancel() { cleanup(); },
  });
  return new Response(stream, { headers: {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-store, no-transform",
    "X-Accel-Buffering": "no",
    "Vercel-CDN-Cache-Control": "no-store",
  } });
}
