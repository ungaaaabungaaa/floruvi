import { getCartBox } from "./boxes";
import { publicSourceUrl } from "./growth";
import { storefrontCopy } from "./storefront-copy";

export type MerchantItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  priceMinor: number;
  inStock: boolean;
};
export type MerchantFeed =
  | { status: "ready"; items: MerchantItem[]; deliveryFeeMinor: number }
  | { status: "disabled" | "not-ready"; message: string };
type MerchantProduct = {
  slug: string;
  name: string;
  description: string;
  published: boolean;
  inStock?: boolean;
  price?: { amountMinor: number; currency: string; packLabel: string } | null;
};
type StoredImage = { url: string | null; contentType?: string; size?: number };
export const MERCHANT_PRODUCT_LIMIT = 500;
const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const validMoney = (value: number) => Number.isSafeInteger(value) && value >= 0;

/** The caller passes configuration states, never secret values. */
export function merchantSetupReady(setup: {
  paymentsEnabled: boolean;
  liveKeyConfigured: boolean;
  secretConfigured: boolean;
  webhookConfigured: boolean;
  currency: string;
  deliveryFeeMinor: number;
}) {
  return (
    setup.paymentsEnabled &&
    setup.liveKeyConfigured &&
    setup.secretConfigured &&
    setup.webhookConfigured &&
    setup.currency === "INR" &&
    validMoney(setup.deliveryFeeMinor)
  );
}

/**
 * No fallback illustrations, guessed availability, box enquiries or export prices.
 * A stored image proves a file exists; the owner still reviews its real product
 * match, dimensions, rights and any required AI metadata before enabling the feed.
 */
export function merchantItem(
  product: MerchantProduct,
  image: StoredImage,
): MerchantItem | null {
  if (
    !product.published ||
    typeof product.inStock !== "boolean" ||
    !/^[a-z0-9][a-z0-9-]{0,49}$/.test(product.slug) ||
    getCartBox(product.slug) ||
    product.slug.startsWith("box-") ||
    !product.price ||
    product.price.currency !== "INR" ||
    !validMoney(product.price.amountMinor) ||
    product.price.amountMinor <= 0 ||
    !product.price.packLabel.trim() ||
    !product.name.trim() ||
    !product.description.trim() ||
    !image.url ||
    !publicSourceUrl(image.url) ||
    image.url.length > 2000 ||
    !imageTypes.has(image.contentType ?? "") ||
    !Number.isSafeInteger(image.size) ||
    !image.size ||
    image.size <= 0 ||
    image.size > 16_000_000
  )
    return null;
  const imageUrl = new URL(image.url).href;
  if (imageUrl.length > 2000) return null;
  return {
    id: product.slug,
    slug: product.slug,
    title: storefrontCopy(
      `${product.name.trim()} · ${product.price.packLabel.trim()}`,
    ).slice(0, 150),
    description: storefrontCopy(product.description.trim()).slice(0, 5000),
    imageUrl,
    priceMinor: product.price.amountMinor,
    inStock: product.inStock,
  };
}

/** XML 1.0 character set, then XML entities. No CDATA or executable markup. */
export function escapeMerchantXml(value: string) {
  const valid = Array.from(value)
    .filter((char) => {
      const code = char.codePointAt(0)!;
      return (
        code === 9 ||
        code === 10 ||
        code === 13 ||
        (code >= 32 && code <= 0xd7ff) ||
        (code >= 0xe000 && code <= 0xfffd) ||
        (code >= 0x10000 && code <= 0x10ffff)
      );
    })
    .join("");
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  };
  return valid.replace(/[&<>"']/g, (char) => entities[char]);
}

/**
 * Google RSS 2.0 / product specification, checked 2026-10-02:
 * https://support.google.com/merchants/answer/14987622
 * https://support.google.com/merchants/answer/7052112
 * Omit GTIN, MPN, brand and identifier_exists: none is verified in this catalogue.
 * Account/domain verification, shipping/returns and image review remain setup gates.
 */
export function merchantXml(
  feed: Extract<MerchantFeed, { status: "ready" }>,
  baseUrl: string,
) {
  if (!publicSourceUrl(baseUrl) || !validMoney(feed.deliveryFeeMinor))
    throw new Error("Merchant feed setup is incomplete.");
  const base = new URL(baseUrl);
  if (
    base.pathname !== "/" ||
    base.search ||
    base.hash ||
    !feed.items.length ||
    feed.items.length > MERCHANT_PRODUCT_LIMIT ||
    new Set(feed.items.map((item) => item.id)).size !== feed.items.length
  )
    throw new Error("Merchant feed setup is incomplete.");
  const tag = (name: string, value: string) =>
    `<g:${name}>${escapeMerchantXml(value)}</g:${name}>`;
  const items = feed.items.map((item) => {
    // Defend the public XML boundary even if the backend contract changes.
    if (
      !/^[a-z0-9][a-z0-9-]{0,49}$/.test(item.id) ||
      item.id !== item.slug ||
      item.slug.startsWith("box-") ||
      !validMoney(item.priceMinor) ||
      item.priceMinor <= 0 ||
      typeof item.inStock !== "boolean" ||
      !publicSourceUrl(item.imageUrl) ||
      !item.title.trim() ||
      !item.description.trim()
    )
      throw new Error("Merchant item is invalid.");
    return `<item>${tag("id", item.id)}${tag("title", item.title)}${tag("description", item.description)}${tag("link", new URL(`/products/${item.slug}`, base).href)}${tag("image_link", item.imageUrl)}${tag("condition", "new")}${tag("availability", item.inStock ? "in_stock" : "out_of_stock")}${tag("price", `${(item.priceMinor / 100).toFixed(2)} INR`)}<g:shipping>${tag("country", "IN")}${tag("price", `${(feed.deliveryFeeMinor / 100).toFixed(2)} INR`)}</g:shipping></item>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel><title>Floruvi products in India</title><link>${escapeMerchantXml(base.origin)}</link><description>Published produce and current India prices.</description>${items.join("")}</channel></rss>`;
}

export function merchantFeedResponse(
  feed: MerchantFeed,
  baseUrl: string,
): Response {
  const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };
  if (feed.status !== "ready")
    return new Response(feed.message, {
      status: 503,
      headers: {
        ...headers,
        "Content-Type": "text/plain; charset=utf-8",
        "Retry-After": "3600",
      },
    });
  try {
    return new Response(merchantXml(feed, baseUrl), {
      headers: { ...headers, "Content-Type": "application/xml; charset=utf-8" },
    });
  } catch {
    return new Response(
      "The product feed is not ready. Check product data and the public site address.",
      {
        status: 503,
        headers: {
          ...headers,
          "Content-Type": "text/plain; charset=utf-8",
          "Retry-After": "3600",
        },
      },
    );
  }
}
