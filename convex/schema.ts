import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const alertStatus = v.union(
  v.literal("pending"),
  v.literal("sent"),
  v.literal("failed"),
  v.literal("off"),
);
// Owner alerts by Telegram. "off" means the bot is not configured. Email alerts
// were removed on 28 September 2026; older records may still hold `email`.
const notifications = v.object({
  telegram: alertStatus,
  email: v.optional(alertStatus),
  attempts: v.number(),
});

export default defineSchema({
  recipes: defineTable({
    slug: v.string(),
    name: v.string(),
    category: v.string(),
    description: v.string(),
    minutes: v.number(),
    prepMinutes: v.number(),
    cookMinutes: v.number(),
    servings: v.number(),
    ingredients: v.array(v.string()),
    steps: v.array(v.string()),
    tip: v.string(),
    crops: v.array(v.string()),
    imageKey: v.string(),
    imageCaption: v.string(),
    rank: v.number(),
    published: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_published", ["published"]),
  categories: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    color: v.string(),
    symbol: v.string(),
    rank: v.number(),
  }).index("by_slug", ["slug"]),
  products: defineTable({
    slug: v.string(),
    name: v.string(),
    category: v.string(),
    description: v.string(),
    uses: v.array(v.string()),
    growingNote: v.string(),
    suitability: v.union(v.literal("specialist"), v.literal("established")),
    methods: v.array(v.string()),
    sourceUrl: v.string(),
    sourceNote: v.string(),
    featured: v.boolean(),
    status: v.literal("enquiry"),
    published: v.boolean(),
    rank: v.number(),
    imageId: v.optional(v.id("_storage")),
    price: v.optional(
      v.object({
        amountMinor: v.number(),
        currency: v.literal("INR"),
        packLabel: v.string(),
      }),
    ),
    pricingRevision: v.optional(v.string()),
    // Owner-controlled; missing means in stock. No quantities are tracked.
    inStock: v.optional(v.boolean()),
    details: v.optional(
      v.object({
        tagline: v.string(),
        benefits: v.array(
          v.object({ icon: v.string(), title: v.string(), text: v.string() }),
        ),
        preparation: v.string(),
        storage: v.string(),
        nutritionTitle: v.string(),
        nutrition: v.array(
          v.object({ icon: v.string(), title: v.string(), text: v.string() }),
        ),
        nutritionSource: v.string(),
        bannerIndex: v.number(),
      }),
    ),
  })
    .index("by_slug", ["slug"])
    .index("by_published", ["published"]),
  enquiries: defineTable({
    kind: v.union(v.literal("business"), v.literal("personal")),
    name: v.string(),
    business: v.string(),
    email: v.string(),
    phone: v.string(),
    city: v.string(),
    interest: v.string(),
    quantity: v.string(),
    message: v.string(),
    consentAt: v.number(),
    status: v.literal("new"),
    notifications: v.optional(notifications),
  }),
  // Paid online orders (India, Razorpay). Amounts are INR paise, set on the server.
  orders: defineTable({
    reference: v.string(),
    // created: waiting for payment. paid: captured for the exact amount.
    // review: captured, but the amount or currency did not match. Check it.
    status: v.union(v.literal("created"), v.literal("paid"), v.literal("review")),
    // Test-key orders move no money.
    mode: v.union(v.literal("test"), v.literal("live")),
    currency: v.literal("INR"),
    amountMinor: v.number(),
    subtotalMinor: v.number(),
    deliveryMinor: v.number(),
    items: v.array(
      v.object({
        slug: v.string(),
        name: v.string(),
        quantity: v.number(),
        packLabel: v.string(),
        lineMinor: v.number(),
      }),
    ),
    customer: v.object({ name: v.string(), email: v.string(), phone: v.string() }),
    delivery: v.object({
      address: v.string(),
      city: v.string(),
      region: v.string(),
      pincode: v.string(),
      notes: v.string(),
    }),
    consentAt: v.number(),
    razorpayOrderId: v.optional(v.string()),
    payment: v.optional(
      v.object({ id: v.string(), method: v.string(), capturedAt: v.number() }),
    ),
    // Further captures for the same order. Refund them in the Razorpay dashboard.
    extraPayments: v.optional(v.array(v.string())),
    lastFailure: v.optional(v.string()),
    notifications: v.optional(notifications),
  })
    .index("by_reference", ["reference"])
    .index("by_razorpay_order", ["razorpayOrderId"]),
  // Website chat. A thread belongs to whoever holds its cookie; only the
  // cookie's SHA-256 is stored. Deleted 180 days after the last message.
  chatThreads: defineTable({
    tokenHash: v.string(),
    // bot: the assistant answers. owner: the owner answers and the bot is silent.
    mode: v.union(v.literal("bot"), v.literal("owner"), v.literal("closed")),
    language: v.string(),
    market: v.string(),
    lastMessageAt: v.number(),
    preview: v.string(),
    // The customer wrote since the owner last answered.
    unread: v.boolean(),
    handOffReason: v.optional(v.string()),
    notifications: v.optional(notifications),
    // Assistant cost from OpenRouter, in micros (millionths of a US dollar).
    costMicros: v.optional(v.number()),
    tokensIn: v.optional(v.number()),
    tokensOut: v.optional(v.number()),
    aiReplies: v.optional(v.number()),
    // Today's cost (India day), for the per-chat daily limit.
    costDay: v.optional(v.string()),
    costDayMicros: v.optional(v.number()),
  })
    .index("by_token", ["tokenHash"])
    .index("by_last_message", ["lastMessageAt"])
    .index("by_mode", ["mode", "lastMessageAt"]),
  // Assistant spend per India month, for the monthly budget.
  chatUsage: defineTable({
    month: v.string(),
    costMicros: v.number(),
    aiReplies: v.number(),
    // When the budget ran out; the owner is alerted once.
    pausedAt: v.optional(v.number()),
    notifications: v.optional(notifications),
  }).index("by_month", ["month"]),
  chatMessages: defineTable({
    threadId: v.id("chatThreads"),
    author: v.union(v.literal("customer"), v.literal("bot"), v.literal("owner")),
    text: v.string(),
    products: v.optional(
      v.array(v.object({ slug: v.string(), name: v.string(), quantity: v.optional(v.number()) })),
    ),
  }).index("by_thread", ["threadId"]),
  // Owner admin sessions: only a SHA-256 of the cookie token is stored.
  adminSessions: defineTable({
    tokenHash: v.string(),
    expiresAt: v.number(),
  })
    .index("by_token", ["tokenHash"])
    .index("by_expiry", ["expiresAt"]),
  storeSettings: defineTable({
    key: v.literal("commerce"),
    currency: v.literal("INR"),
    deliveryFeeMinor: v.number(),
    // Website chat, switched in the admin panel. Missing means hidden.
    chatEnabled: v.optional(v.boolean()),
    // Online payment, switched in the admin panel. Also needs the Razorpay keys.
    paymentsEnabled: v.optional(v.boolean()),
  }).index("by_key", ["key"]),
  enquiryLimits: defineTable({
    key: v.string(),
    count: v.number(),
    windowStart: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_window", ["windowStart"]),
  // Export-market price rates: local retail study × 1.40. See docs/20-international-pricing.md.
  marketPricing: defineTable({
    market: v.string(),
    currency: v.string(),
    stepMinor: v.number(),
    categoryRates: v.record(v.string(), v.number()),
    productRates: v.record(v.string(), v.number()),
    revision: v.string(),
    researchedOn: v.string(),
    observationsUsed: v.number(),
  }).index("by_market", ["market"]),
  // Translations apply only while `source` matches the English record's fingerprint.
  productTranslations: defineTable({
    language: v.string(),
    slug: v.string(),
    source: v.string(),
    name: v.string(),
    description: v.string(),
    uses: v.array(v.string()),
    details: v.union(
      v.null(),
      v.object({
        tagline: v.string(),
        benefits: v.array(v.object({ title: v.string(), text: v.string() })),
        preparation: v.string(),
        storage: v.string(),
        nutritionTitle: v.string(),
        nutrition: v.array(v.object({ title: v.string(), text: v.string() })),
      }),
    ),
  }).index("by_language_slug", ["language", "slug"]),
  recipeTranslations: defineTable({
    language: v.string(),
    slug: v.string(),
    source: v.string(),
    name: v.string(),
    description: v.string(),
    ingredients: v.array(v.string()),
    steps: v.array(v.string()),
    tip: v.string(),
  }).index("by_language_slug", ["language", "slug"]),
});
