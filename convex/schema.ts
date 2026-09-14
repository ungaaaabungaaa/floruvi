import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
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
  }),
  enquiryLimits: defineTable({
    key: v.string(),
    count: v.number(),
    windowStart: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_window", ["windowStart"]),
});
