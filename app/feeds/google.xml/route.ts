import { fetchQuery } from "convex/nextjs";
import { makeFunctionReference } from "convex/server";
import { merchantFeedResponse, type MerchantFeed } from "@/lib/merchant-feed";
import { siteUrl } from "@/lib/site";

// Refresh the stock and payment gates on every scheduled fetch. A feed must not
// keep advertising purchasable items after the owner turns checkout off.
export const dynamic = "force-dynamic";
const feedQuery = makeFunctionReference<
  "query",
  Record<string, never>,
  MerchantFeed
>("merchant:google");

export async function GET() {
  try {
    return merchantFeedResponse(await fetchQuery(feedQuery, {}), siteUrl);
  } catch {
    return merchantFeedResponse(
      {
        status: "not-ready",
        message: "The product feed is temporarily unavailable.",
      },
      siteUrl,
    );
  }
}
