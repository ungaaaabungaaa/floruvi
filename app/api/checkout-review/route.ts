import { z } from "zod";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { basketLines } from "@/lib/checkout";
import { isSameOrigin } from "@/lib/request-origin";
import { readJson } from "@/lib/read-json";
import { reviewBasket } from "@/lib/pricing";
import { marketCodes, type Market } from "@/lib/i18n/config";
import { localProductPreview } from "@/lib/local-product-preview";
const schema = z
  .object({
    items: basketLines,
    market: z.enum(marketCodes as [Market, ...Market[]]).default("in"),
  })
  .strict();
export async function POST(request: Request) {
  if (!isSameOrigin(request))
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const read = await readJson(request, 6000);
  if (!read.ok) return read.response;
  const body = read.value;
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return Response.json(
      { error: "Check basket quantities." },
      { status: 400 },
    );
  try {
    const { items, market } = parsed.data;
    if (localProductPreview() && market === "in") {
      const { products, commerce } = (
        await import("@/lib/local-product-preview-data")
      ).previewShop();
      return Response.json(
        reviewBasket(items, products, commerce, market, false),
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    // Convex recalculates prices for the requested market; the browser sends none.
    // English names keep the enquiry readable for the farm.
    const [{ products, commerce }, payments] = await Promise.all([
      fetchQuery(api.storefront.catalogue, { language: "en", market }),
      // Payments stay off if the backend is older than this site or unreachable.
      fetchQuery(api.storefront.payments, {}).catch(() => ({ enabled: false })),
    ]);
    return Response.json(
      reviewBasket(items, products, commerce, market, payments.enabled),
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
