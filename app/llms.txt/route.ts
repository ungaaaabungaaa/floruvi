import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import messages from "@/messages/en.json";
import { llmsText } from "@/lib/llms";
import { siteUrl } from "@/lib/site";

export async function GET() {
  try {
    const [catalogue, recipes] = await Promise.all([
      fetchQuery(api.storefront.catalogue, { language: "en", market: "in" }),
      fetchQuery(api.storefront.recipes, { language: "en" }),
    ]);
    const body = llmsText({
      site: siteUrl,
      messages,
      categories: catalogue.categories,
      products: catalogue.products,
      recipes,
      deliveryFeeMinor: catalogue.commerce?.deliveryFeeMinor,
    });
    return new Response(body, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new Response("Unavailable", { status: 503 });
  }
}
