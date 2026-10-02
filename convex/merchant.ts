import { query } from "./_generated/server";
import { commerceSettings } from "./orders";
import { priceInMarket } from "../lib/markets/pricing-core";
import {
  merchantItem,
  merchantSetupReady,
  MERCHANT_PRODUCT_LIMIT,
  type MerchantFeed,
} from "../lib/merchant-feed";

/** Public feed projection only. No customer, order, provider key or admin data. */
export const google = query({
  args: {},
  handler: async (ctx): Promise<MerchantFeed> => {
    if (process.env.GROWTH_MERCHANT_FEED_ENABLED !== "true")
      return {
        status: "disabled",
        message: "The product feed is not enabled.",
      };
    const commerce = await commerceSettings(ctx);
    if (
      !merchantSetupReady({
        paymentsEnabled: commerce?.paymentsEnabled === true,
        liveKeyConfigured: /^rzp_live_[A-Za-z0-9]+$/.test(
          process.env.RAZORPAY_KEY_ID?.trim() ?? "",
        ),
        secretConfigured: Boolean(process.env.RAZORPAY_KEY_SECRET?.trim()),
        webhookConfigured: Boolean(process.env.RAZORPAY_WEBHOOK_SECRET?.trim()),
        currency: commerce?.currency ?? "",
        deliveryFeeMinor: commerce?.deliveryFeeMinor ?? -1,
      })
    )
      return {
        status: "not-ready",
        message:
          "The product feed needs enabled live checkout and valid India shipping settings.",
      };
    const products = await ctx.db
      .query("products")
      .withIndex("by_published", (q) => q.eq("published", true))
      .take(MERCHANT_PRODUCT_LIMIT + 1);
    if (products.length > MERCHANT_PRODUCT_LIMIT)
      return {
        status: "not-ready",
        message: "The catalogue exceeds the current product feed limit.",
      };
    const items = [];
    for (const product of products.sort((a, b) => a.rank - b.rank)) {
      if (!product.imageId) continue;
      const metadata = await ctx.db.system.get(product.imageId);
      if (!metadata) continue;
      const item = merchantItem(
        { ...product, price: priceInMarket(product, "in", null) },
        {
          url: await ctx.storage.getUrl(product.imageId),
          contentType: metadata.contentType,
          size: metadata.size,
        },
      );
      if (item) items.push(item);
    }
    if (!items.length)
      return {
        status: "not-ready",
        message:
          "No published products have a valid India price, confirmed stock state and stored product image.",
      };
    return {
      status: "ready",
      items,
      deliveryFeeMinor: commerce!.deliveryFeeMinor,
    };
  },
});
