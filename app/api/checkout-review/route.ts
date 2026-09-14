import { z } from "zod";
import { getCatalogue } from "@/lib/catalogue";
import { MAX_CART_LINES, MAX_QUANTITY } from "@/lib/cart";
import { isSameOrigin } from "@/lib/request-origin";
import { reviewBasket } from "@/lib/pricing";
const schema = z
  .object({
    items: z
      .array(
        z
          .object({
            slug: z
              .string()
              .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
              .max(100),
            quantity: z.number().int().min(1).max(MAX_QUANTITY),
          })
          .strict(),
      )
      .min(1)
      .max(MAX_CART_LINES),
  })
  .strict();
export async function POST(request: Request) {
  if (!isSameOrigin(request))
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  if (!request.headers.get("content-type")?.includes("application/json"))
    return Response.json({ error: "Use JSON." }, { status: 415 });
  const reader = request.body?.getReader();
  if (!reader)
    return Response.json({ error: "Basket is empty." }, { status: 400 });
  let bytes = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.length;
    if (bytes > 6000) {
      await reader.cancel();
      return Response.json({ error: "Basket is too large." }, { status: 413 });
    }
    chunks.push(value);
  }
  let body;
  try {
    body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return Response.json({ error: "Invalid basket." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return Response.json(
      { error: "Check basket quantities." },
      { status: 400 },
    );
  if (
    new Set(parsed.data.items.map((i) => i.slug)).size !==
    parsed.data.items.length
  )
    return Response.json({ error: "Duplicate basket items." }, { status: 400 });
  try {
    const { products, commerce } = await getCatalogue();
    return Response.json(reviewBasket(parsed.data.items, products, commerce), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(
      { error: "We could not check the basket. Please try again." },
      { status: 503 },
    );
  }
}
