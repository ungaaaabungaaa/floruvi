import { defineTable } from "convex/server";
import { v } from "convex/values";

export const profileFields = {
  origin: v.string(),
  products: v.string(),
  capacity: v.string(),
  delivery: v.string(),
  certifications: v.string(),
  terms: v.string(),
};
export const source = v.object({ url: v.string(), title: v.string() });
export const request = v.object({
  kind: v.union(
    v.literal("general"),
    v.literal("buyers"),
    v.literal("tenders"),
    v.literal("export"),
  ),
  prompt: v.optional(v.string()),
  groups: v.array(v.string()),
  region: v.string(),
  products: v.string(),
  limit: v.number(),
  useExa: v.boolean(),
});
export const opportunityFields = {
  kind: v.union(v.literal("buyer"), v.literal("tender"), v.literal("export")),
  name: v.string(),
  group: v.string(),
  location: v.string(),
  website: v.string(),
  contact: v.string(),
  role: v.string(),
  summary: v.string(),
  productFit: v.string(),
  sourceUrl: v.string(),
  sourceTitle: v.string(),
  nextStep: v.string(),
  tenderReference: v.string(),
  deadline: v.string(),
  requirements: v.string(),
};
export const growthTables = {
  growthSettings: defineTable({
    key: v.literal("owner"),
    profile: v.object(profileFields),
    channels: v.array(
      v.object({
        id: v.string(),
        status: v.string(),
        notes: v.string(),
        updatedAt: v.number(),
      }),
    ),
    providers: v.array(
      v.object({
        id: v.string(),
        testedAt: v.number(),
        ok: v.boolean(),
        message: v.string(),
      }),
    ),
  }).index("by_key", ["key"]),
  growthOpportunities: defineTable({
    ...opportunityFields,
    key: v.string(),
    status: v.string(),
    notes: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    runId: v.optional(v.id("growthRuns")),
  })
    .index("by_key", ["key"])
    .index("by_group", ["group"]),
  growthRuns: defineTable({
    request,
    status: v.union(
      v.literal("queued"),
      v.literal("running"),
      v.literal("complete"),
      v.literal("failed"),
      v.literal("cancelled"),
    ),
    actorHash: v.string(),
    month: v.string(),
    createdAt: v.number(),
    finishedAt: v.optional(v.number()),
    summary: v.optional(v.string()),
    error: v.optional(v.string()),
    sources: v.optional(v.array(source)),
    nextSteps: v.optional(v.array(v.string())),
    reservationMicros: v.number(),
    costMicros: v.optional(v.number()),
    providerId: v.optional(v.string()),
    settled: v.boolean(),
  }).index("by_status", ["status"]),
  growthDrafts: defineTable({
    title: v.string(),
    body: v.string(),
    opportunityId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    idempotencyKey: v.optional(v.string()),
    researchRunId: v.optional(v.id("growthRuns")),
    researchPrompt: v.optional(v.string()),
    researchedAt: v.optional(v.number()),
    sources: v.optional(v.array(source)),
    researchNextSteps: v.optional(v.array(v.string())),
  }).index("by_idempotency", ["idempotencyKey"]),
  growthUsage: defineTable({
    month: v.string(),
    reservedMicros: v.number(),
    chargedMicros: v.number(),
    day: v.string(),
    dailyRuns: v.number(),
    apolloUsed: v.number(),
  }).index("by_month", ["month"]),
  growthApolloCandidates: defineTable({
    personId: v.string(),
    domain: v.string(),
    organization: v.string(),
    actorHash: v.string(),
    expiresAt: v.number(),
  }).index("by_person", ["personId"]),
  growthEnrichments: defineTable({
    personId: v.string(),
    domain: v.string(),
    organization: v.string(),
    month: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("complete"),
      v.literal("failed"),
    ),
    data: v.optional(v.any()),
    createdAt: v.number(),
  }).index("by_person", ["personId"]),
  growthAudit: defineTable({
    action: v.string(),
    targetId: v.optional(v.string()),
    at: v.number(),
    actor: v.string(),
  }).index("by_at", ["at"]),
};
