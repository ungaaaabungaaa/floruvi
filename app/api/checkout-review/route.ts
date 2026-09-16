import { z } from "zod";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { MAX_CART_LINES, MAX_QUANTITY } from "@/lib/cart";
import { isSameOrigin } from "@/lib/request-origin";
import { reviewBasket } from "@/lib/pricing";
import { marketCodes, type Market } from "@/lib/i18n/config";
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
    market: z.enum(marketCodes as [Market, ...Market[]]).default("in"),
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
    const { items, market } = parsed.data;
    // Convex recalculates prices for the requested market; the browser sends none.
    // English names keep the enquiry readable for the farm.
    const { products, commerce } = await fetchQuery(api.storefront.catalogue, {
      language: "en",
      market,
    });
    return Response.json(
      reviewBasket(items, products, commerce, market),
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch {
    return Response.json(
      { error: "We could not check the basket. Please try again." },
      { status: 503 },
    );
  }
}
