import {
  internalMutation,
  internalQuery,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { z } from "zod";
import { activeSession } from "./admin";
import { takeRateLimits } from "./limits";
import { sha256 } from "./httpUtils";
import { matchesApolloEmployer } from "../lib/growth-apollo";
import { scopedGrowthText } from "../lib/growth-redaction";
import { dayKey, monthKey } from "../lib/chat";
import {
  budgetNumber,
  canReserveResearch,
  settleReservation,
  DEFAULT_RESEARCH_RESERVATION_MICROS,
  APOLLO_ENRICHMENT_RESERVATION,
} from "../lib/growth-budget";
import {
  channels,
  channelStatuses,
  draftSchema,
  emptySupplyProfile,
  opportunityKey,
  opportunitySchema,
  opportunityStatuses,
  researchRequestSchema,
  researchResultSchema,
  supplyProfileSchema,
  type GrowthActionResult,
  type GrowthDashboard,
  type OpportunityInput,
  type ResearchResult,
} from "../lib/growth";

function select<T extends object, K extends keyof T>(
  row: T,
  keys: K[],
): Pick<T, K> {
  return Object.fromEntries(
    keys.filter((key) => row[key] !== undefined).map((key) => [key, row[key]]),
  ) as Pick<T, K>;
}

const ownerSettings = (ctx: QueryCtx) =>
  ctx.db
    .query("growthSettings")
    .withIndex("by_key", (q) => q.eq("key", "owner"))
    .unique();
const usageFor = (ctx: QueryCtx, month: string) =>
  ctx.db
    .query("growthUsage")
    .withIndex("by_month", (q) => q.eq("month", month))
    .unique();
const budget = () =>
  Math.round(
    budgetNumber(process.env.GROWTH_MONTHLY_BUDGET_USD, 10, 1000) * 1e6,
  );
const apolloLimit = () =>
  Math.floor(budgetNumber(process.env.GROWTH_APOLLO_MONTHLY_CREDITS, 0, 10000));
const enabled = () => process.env.GROWTH_RESEARCH_ENABLED === "true";
const providerFlags = () =>
  (["openai", "exa", "apollo"] as const).map((id) => ({
    id,
    configured: !!process.env[`${id.toUpperCase()}_API_KEY`]?.trim(),
  }));
const deny = { ok: false, error: "Unauthorized" } as const;
export const authorized = internalQuery({
  args: { tokenHash: v.string() },
  handler: async (ctx, { tokenHash }) =>
    !!(await activeSession(ctx, tokenHash)),
});

async function settings(ctx: MutationCtx) {
  const old = await ownerSettings(ctx);
  if (old) return old;
  const id = await ctx.db.insert("growthSettings", {
    key: "owner",
    profile: emptySupplyProfile,
    channels: [],
    providers: [],
  });
  return (await ctx.db.get(id))!;
}
async function usage(ctx: MutationCtx, now = Date.now()) {
  const month = monthKey(now),
    old = await usageFor(ctx, month);
  if (old) return old;
  const id = await ctx.db.insert("growthUsage", {
    month,
    reservedMicros: 0,
    chargedMicros: 0,
    day: dayKey(now),
    dailyRuns: 0,
    apolloUsed: 0,
  });
  return (await ctx.db.get(id))!;
}
async function audit(
  ctx: MutationCtx,
  action: string,
  actor: string,
  targetId?: string,
) {
  await ctx.db.insert("growthAudit", {
    action,
    actor,
    at: Date.now(),
    ...(targetId ? { targetId } : {}),
  });
}
async function saveOpportunity(
  ctx: MutationCtx,
  input: OpportunityInput,
  runId?: Id<"growthRuns">,
) {
  const key = opportunityKey(input),
    old = await ctx.db
      .query("growthOpportunities")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();
  // Preserve owner edits, qualification and suppression. A fresh discovery never overwrites them.
  if (old) return old._id;
  const now = Date.now();
  return ctx.db.insert("growthOpportunities", {
    ...input,
    key,
    status: "found",
    notes: "",
    createdAt: now,
    updatedAt: now,
    ...(runId ? { runId } : {}),
  });
}
async function saveDraft(ctx: MutationCtx, payload: unknown) {
  const input = draftSchema.parse(payload);
  if (input.opportunityId) {
    const id = ctx.db.normalizeId("growthOpportunities", input.opportunityId);
    if (!id || !(await ctx.db.get(id)))
      throw new Error("Choose an existing opportunity.");
  }
  if (input.idempotencyKey) {
    const old = await ctx.db
      .query("growthDrafts")
      .withIndex("by_idempotency", (q) =>
        q.eq("idempotencyKey", input.idempotencyKey),
      )
      .unique();
    if (old) return old._id;
  }
  const now = Date.now();
  const { id, ...data } = input;
  if (id) {
    const draftId = ctx.db.normalizeId("growthDrafts", id);
    if (!draftId || !(await ctx.db.get(draftId)))
      throw new Error("Draft not found.");
    await ctx.db.patch(draftId, { ...data, updatedAt: now });
    return draftId;
  }
  return ctx.db.insert("growthDrafts", {
    ...data,
    createdAt: now,
    updatedAt: now,
  });
}

// Snapshot the stored result; never trust browser-supplied answer text or links.
async function saveResearchNote(ctx: MutationCtx, payload: unknown) {
  const { id } = z.object({ id: z.string() }).strict().parse(payload);
  const runId = ctx.db.normalizeId("growthRuns", id);
  const run = runId ? await ctx.db.get(runId) : null;
  if (
    !run ||
    run.status !== "complete" ||
    !run.summary ||
    run.summary.trim().length < 5
  )
    throw new Error("Choose a completed research answer.");
  const idempotencyKey = `research:${run._id}`;
  const existing = await ctx.db
    .query("growthDrafts")
    .withIndex("by_idempotency", (q) => q.eq("idempotencyKey", idempotencyKey))
    .unique();
  if (existing) return existing._id;
  const question =
    run.request.prompt ||
    `${run.request.kind}: ${run.request.products} in ${run.request.region}`;
  const now = Date.now();
  return ctx.db.insert("growthDrafts", {
    title: question.slice(0, 180),
    body: run.summary,
    opportunityId: "",
    idempotencyKey,
    researchRunId: run._id,
    researchPrompt: question,
    researchedAt: run.finishedAt ?? run.createdAt,
    sources: run.sources ?? [],
    researchNextSteps: run.nextSteps ?? [],
    createdAt: now,
    updatedAt: now,
  });
}

export const dashboard = internalQuery({
  args: { tokenHash: v.string() },
  handler: async (ctx, { tokenHash }): Promise<GrowthDashboard | null> => {
    if (!(await activeSession(ctx, tokenHash))) return null;
    const now = Date.now(),
      month = monthKey(now);
    const [config, spent, opportunities, runs, drafts] = await Promise.all([
      ownerSettings(ctx),
      usageFor(ctx, month),
      ctx.db.query("growthOpportunities").order("desc").take(200),
      ctx.db.query("growthRuns").order("desc").take(30),
      ctx.db.query("growthDrafts").order("desc").take(100),
    ]);
    return {
      profile: config?.profile ?? emptySupplyProfile,
      opportunities: opportunities.map((row) =>
        select(row, [
          "_id",
          "kind",
          "name",
          "group",
          "location",
          "website",
          "contact",
          "role",
          "summary",
          "productFit",
          "sourceUrl",
          "sourceTitle",
          "nextStep",
          "tenderReference",
          "deadline",
          "requirements",
          "status",
          "notes",
          "createdAt",
          "updatedAt",
          "runId",
        ]),
      ) as GrowthDashboard["opportunities"],
      runs: runs.map((row) =>
        select(row, [
          "_id",
          "request",
          "status",
          "createdAt",
          "finishedAt",
          "summary",
          "error",
          "sources",
          "nextSteps",
          "reservationMicros",
          "costMicros",
        ]),
      ) as GrowthDashboard["runs"],
      drafts: drafts.map((row) =>
        select(row, [
          "_id",
          "title",
          "body",
          "opportunityId",
          "researchRunId",
          "researchPrompt",
          "researchedAt",
          "sources",
          "researchNextSteps",
          "createdAt",
          "updatedAt",
        ]),
      ),
      channels: (config?.channels ?? []) as GrowthDashboard["channels"],
      providers: providerFlags().map((flag) => ({
        ...config?.providers.find((p) => p.id === flag.id),
        ...flag,
      })),
      usage: {
        month,
        budgetMicros: budget(),
        reservedMicros: spent?.reservedMicros ?? 0,
        chargedMicros: spent?.chargedMicros ?? 0,
        dailyRuns: spent?.day === dayKey(now) ? spent.dailyRuns : 0,
        apolloUsed: spent?.apolloUsed ?? 0,
        apolloLimit: apolloLimit(),
      },
      enabled: enabled(),
      mcpConfigured:
        (process.env.GROWTH_MCP_TOKEN?.length ?? 0) >= 32 &&
        process.env.GROWTH_MCP_TOKEN !== process.env.ADMIN_API_SECRET,
    };
  },
});

export const update = internalMutation({
  args: { tokenHash: v.string(), operation: v.string(), payload: v.any() },
  handler: async (
    ctx,
    { tokenHash, operation, payload },
  ): Promise<GrowthActionResult> => {
    if (!(await activeSession(ctx, tokenHash))) return deny;
    if (!(await takeRateLimits(ctx, [{ key: "growth-writes", max: 120 }])))
      return { ok: false, error: "Too many changes. Try again later." };
    try {
      let id: string | undefined;
      if (operation === "saveProfile") {
        const profile = supplyProfileSchema.parse(payload),
          old = await settings(ctx);
        await ctx.db.patch(old._id, { profile });
      } else if (operation === "saveChannel") {
        const p = z
          .object({
            id: z.enum(channels.map((c) => c.id) as [string, ...string[]]),
            status: z.enum(channelStatuses),
            notes: z.string().trim().max(1500),
          })
          .strict()
          .parse(payload);
        const old = await settings(ctx);
        await ctx.db.patch(old._id, {
          channels: [
            ...old.channels.filter((c) => c.id !== p.id),
            { ...p, updatedAt: Date.now() },
          ],
        });
      } else if (operation === "saveOpportunity")
        id = await saveOpportunity(ctx, opportunitySchema.parse(payload));
      else if (operation === "updateOpportunity") {
        const p = z
          .object({
            id: z.string(),
            status: z.enum(opportunityStatuses),
            notes: z.string().trim().max(2000),
          })
          .strict()
          .parse(payload);
        const record = ctx.db.normalizeId("growthOpportunities", p.id);
        if (!record || !(await ctx.db.get(record)))
          return { ok: false, error: "Opportunity not found." };
        await ctx.db.patch(record, {
          status: p.status,
          notes: p.notes,
          updatedAt: Date.now(),
        });
        id = record;
      } else if (operation === "saveDraft") id = await saveDraft(ctx, payload);
      else if (operation === "saveResearchNote")
        id = await saveResearchNote(ctx, payload);
      else if (operation === "deleteDraft") {
        const p = z.object({ id: z.string() }).strict().parse(payload);
        const record = ctx.db.normalizeId("growthDrafts", p.id);
        if (!record || !(await ctx.db.get(record)))
          return { ok: false, error: "Draft not found." };
        await ctx.db.delete(record);
        id = record;
      } else return { ok: false, error: "Unknown growth action." };
      await audit(ctx, operation, "owner", id);
      return { ok: true, ...(id ? { id } : {}) };
    } catch (error) {
      return {
        ok: false,
        error:
          error instanceof z.ZodError
            ? (error.issues[0]?.message ?? "Check the fields.")
            : "The change could not be saved. Check the selected record.",
      };
    }
  },
});

export const start = internalMutation({
  args: { tokenHash: v.string(), payload: v.any() },
  handler: async (ctx, { tokenHash, payload }): Promise<GrowthActionResult> => {
    if (!(await activeSession(ctx, tokenHash))) return deny;
    const parsed = researchRequestSchema.safeParse(payload);
    if (!parsed.success)
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Check the research request.",
      };
    if (!enabled() || !process.env.OPENAI_API_KEY)
      return {
        ok: false,
        error: "Add the OpenAI key and enable research in Convex first.",
      };
    if (parsed.data.useExa && !process.env.EXA_API_KEY)
      return {
        ok: false,
        error: "Add the Exa key or turn Exa off for this run.",
      };
    const active = await Promise.all([
      ctx.db
        .query("growthRuns")
        .withIndex("by_status", (q) => q.eq("status", "queued"))
        .first(),
      ctx.db
        .query("growthRuns")
        .withIndex("by_status", (q) => q.eq("status", "running"))
        .first(),
    ]);
    if (active.some(Boolean))
      return {
        ok: false,
        error: "A research run is already active. Wait or cancel it.",
      };
    const now = Date.now(),
      old = await usage(ctx, now),
      dailyRuns = old.day === dayKey(now) ? old.dailyRuns : 0;
    const problem = canReserveResearch(
      { ...old, dailyRuns },
      budget(),
      DEFAULT_RESEARCH_RESERVATION_MICROS,
    );
    if (problem) return { ok: false, error: problem };
    const id = await ctx.db.insert("growthRuns", {
      request: parsed.data,
      status: "queued",
      actorHash: tokenHash,
      month: old.month,
      createdAt: now,
      reservationMicros: DEFAULT_RESEARCH_RESERVATION_MICROS,
      settled: false,
    });
    await ctx.db.patch(old._id, {
      reservedMicros: old.reservedMicros + DEFAULT_RESEARCH_RESERVATION_MICROS,
      day: dayKey(now),
      dailyRuns: dailyRuns + 1,
    });
    await ctx.scheduler.runAfter(0, internal.growthActions.run, { id });
    await ctx.scheduler.runAfter(5 * 60_000, internal.growth.expireRun, { id });
    await audit(ctx, "startResearch", "owner", id);
    return { ok: true, id };
  },
});

async function settle(
  ctx: MutationCtx,
  run: Doc<"growthRuns">,
  costMicros: number | undefined,
) {
  if (run.settled) return;
  const old = await usageFor(ctx, run.month);
  if (old)
    await ctx.db.patch(
      old._id,
      settleReservation(old, run.reservationMicros, costMicros),
    );
  await ctx.db.patch(run._id, {
    settled: true,
    costMicros: costMicros ?? run.reservationMicros,
  });
}
export const claim = internalMutation({
  args: { id: v.id("growthRuns") },
  handler: async (ctx, { id }) => {
    const run = await ctx.db.get(id);
    if (!run || run.status !== "queued") return null;
    if (!enabled() || !(await activeSession(ctx, run.actorHash))) {
      await settle(ctx, run, 0);
      await ctx.db.patch(id, {
        status: "cancelled",
        finishedAt: Date.now(),
        error: "Research was disabled or the owner session ended.",
      });
      return null;
    }
    await ctx.db.patch(id, { status: "running" });
    const config = await ownerSettings(ctx);
    return {
      request: run.request,
      profile: config?.profile ?? emptySupplyProfile,
    };
  },
});
export const isActive = internalQuery({
  args: { id: v.id("growthRuns") },
  handler: async (ctx, { id }) => {
    const run = await ctx.db.get(id);
    return (
      !!run &&
      run.status === "running" &&
      enabled() &&
      !!(await activeSession(ctx, run.actorHash))
    );
  },
});

export const finish = internalMutation({
  args: {
    id: v.id("growthRuns"),
    result: v.optional(v.any()),
    error: v.optional(v.string()),
    costMicros: v.optional(v.number()),
    providerId: v.optional(v.string()),
  },
  handler: async (ctx, { id, result, error, costMicros, providerId }) => {
    const run = await ctx.db.get(id);
    if (!run || run.settled) return;
    const valid = researchResultSchema.safeParse(result);
    const permitted =
      run.status === "running" &&
      enabled() &&
      !!(await activeSession(ctx, run.actorHash));
    await settle(ctx, run, costMicros);
    if (!permitted) {
      await ctx.db.patch(id, { status: "cancelled", finishedAt: Date.now() });
      return;
    }
    if (!valid.success) {
      await ctx.db.patch(id, {
        status: "failed",
        finishedAt: Date.now(),
        error:
          error?.slice(0, 300) ?? "The provider result could not be verified.",
      });
      return;
    }
    const data: ResearchResult = valid.data;
    const allowedGroups = new Set(run.request.groups);
    if (run.request.kind !== "general")
      for (const item of data.opportunities.slice(0, run.request.limit))
        if (allowedGroups.has(item.group)) await saveOpportunity(ctx, item, id);
    await ctx.db.patch(id, {
      status: "complete",
      summary: data.summary,
      sources: data.sources,
      nextSteps: data.nextSteps,
      finishedAt: Date.now(),
      ...(providerId ? { providerId } : {}),
    });
    await audit(ctx, "researchComplete", "worker", id);
  },
});
export const cancel = internalMutation({
  args: { tokenHash: v.string(), id: v.string() },
  handler: async (ctx, { tokenHash, id }): Promise<GrowthActionResult> => {
    if (!(await activeSession(ctx, tokenHash))) return deny;
    const runId = ctx.db.normalizeId("growthRuns", id),
      run = runId ? await ctx.db.get(runId) : null;
    if (!run) return { ok: false, error: "Research run not found." };
    if (run.status === "queued") await settle(ctx, run, 0);
    // A running call may already be charged. Finish/expiry settles its reservation.
    if (["queued", "running"].includes(run.status))
      await ctx.db.patch(run._id, {
        status: "cancelled",
        finishedAt: Date.now(),
      });
    await audit(ctx, "cancelResearch", "owner", run._id);
    return { ok: true };
  },
});
export const expireRun = internalMutation({
  args: { id: v.id("growthRuns") },
  handler: async (ctx, { id }) => {
    const run = await ctx.db.get(id);
    if (!run || run.settled) return;
    await settle(ctx, run, run.status === "queued" ? 0 : undefined);
    await ctx.db.patch(id, {
      status: run.status === "cancelled" ? "cancelled" : "failed",
      finishedAt: Date.now(),
      error:
        "The run timed out. Its reserved cost is retained if a provider call may have started. Review provider usage before another attempt.",
    });
  },
});

export const authorizeProvider = internalMutation({
  args: { tokenHash: v.string(), operation: v.string() },
  handler: async (ctx, { tokenHash, operation }) => {
    if (!(await activeSession(ctx, tokenHash))) return false;
    return takeRateLimits(ctx, [
      {
        key: `growth-provider:${operation}`,
        max: operation === "testProvider" ? 12 : 30,
      },
    ]);
  },
});
export const recordProvider = internalMutation({
  args: {
    tokenHash: v.string(),
    id: v.string(),
    ok: v.boolean(),
    message: v.string(),
  },
  handler: async (ctx, { tokenHash, id, ok, message }) => {
    if (!(await activeSession(ctx, tokenHash))) return;
    if (!["openai", "exa", "apollo"].includes(id)) return;
    const old = await settings(ctx);
    await ctx.db.patch(old._id, {
      providers: [
        ...old.providers.filter((p) => p.id !== id),
        { id, ok, message: message.slice(0, 300), testedAt: Date.now() },
      ],
    });
  },
});
export const rememberApolloSearch = internalMutation({
  args: {
    tokenHash: v.string(),
    domain: v.string(),
    people: v.array(v.object({ id: v.string(), organization: v.string() })),
  },
  handler: async (ctx, { tokenHash, domain, people }) => {
    if (!(await activeSession(ctx, tokenHash))) return false;
    for (const person of people.slice(0, 20)) {
      const old = await ctx.db
        .query("growthApolloCandidates")
        .withIndex("by_person", (q) => q.eq("personId", person.id))
        .unique();
      const data = {
        personId: person.id,
        domain: domain
          .trim()
          .toLowerCase()
          .replace(/^www\./, ""),
        organization: person.organization,
        actorHash: tokenHash,
        expiresAt: Date.now() + 60 * 60_000,
      };
      if (old) await ctx.db.patch(old._id, data);
      else await ctx.db.insert("growthApolloCandidates", data);
    }
    return true;
  },
});
export const reserveEnrichment = internalMutation({
  args: { tokenHash: v.string(), personId: v.string() },
  handler: async (ctx, { tokenHash, personId }) => {
    if (!(await activeSession(ctx, tokenHash)))
      return { ok: false, error: "Unauthorized" };
    if (!/^[a-zA-Z0-9_-]{2,100}$/.test(personId))
      return { ok: false, error: "Choose a valid Apollo person." };
    const candidate = await ctx.db
      .query("growthApolloCandidates")
      .withIndex("by_person", (q) => q.eq("personId", personId))
      .unique();
    if (
      !candidate ||
      candidate.actorHash !== tokenHash ||
      candidate.expiresAt <= Date.now()
    )
      return {
        ok: false,
        error: "Search this company again before selecting a contact.",
      };
    const existing = await ctx.db
      .query("growthEnrichments")
      .withIndex("by_person", (q) => q.eq("personId", personId))
      .unique();
    if (existing)
      return existing.status === "complete" &&
        matchesApolloEmployer(existing.data, candidate)
        ? { ok: true, cached: existing.data }
        : {
            ok: false,
            error:
              "This contact was already requested or its company changed. Check Apollo before another paid request.",
          };
    if (!process.env.APOLLO_API_KEY)
      return { ok: false, error: "Add the Apollo key first." };
    const old = await usage(ctx);
    if (old.apolloUsed + APOLLO_ENRICHMENT_RESERVATION > apolloLimit())
      return {
        ok: false,
        error:
          "The Apollo credit allowance cannot cover this enrichment. Set GROWTH_APOLLO_MONTHLY_CREDITS in Convex.",
      };
    await ctx.db.patch(old._id, {
      apolloUsed: old.apolloUsed + APOLLO_ENRICHMENT_RESERVATION,
    });
    const id = await ctx.db.insert("growthEnrichments", {
      personId,
      domain: candidate.domain,
      organization: candidate.organization,
      month: old.month,
      status: "pending",
      createdAt: Date.now(),
    });
    await audit(ctx, "apolloEnrich", "owner", id);
    return { ok: true, id };
  },
});
export const finishEnrichment = internalMutation({
  args: { id: v.id("growthEnrichments"), data: v.optional(v.any()) },
  handler: async (ctx, { id, data }) => {
    const row = await ctx.db.get(id);
    if (row?.status !== "pending") return false;
    const matched = matchesApolloEmployer(data, row);
    await ctx.db.patch(
      id,
      matched ? { status: "complete", data } : { status: "failed" },
    );
    return matched;
  },
});

async function validMcpHash(hash: string) {
  const token = process.env.GROWTH_MCP_TOKEN;
  return (
    !!token &&
    token.length >= 32 &&
    token !== process.env.ADMIN_API_SECRET &&
    hash === (await sha256(token))
  );
}
export const mcp = internalMutation({
  args: { tokenHash: v.string(), operation: v.string(), payload: v.any() },
  handler: async (
    ctx,
    { tokenHash, operation, payload },
  ): Promise<GrowthActionResult> => {
    if (!(await validMcpHash(tokenHash))) return deny;
    if (!(await takeRateLimits(ctx, [{ key: "growth-mcp", max: 120 }])))
      return { ok: false, error: "Rate limit reached." };
    try {
      if (operation === "saveDraft") {
        const parsed = draftSchema.omit({ id: true }).parse(payload);
        if (!parsed.idempotencyKey)
          return { ok: false, error: "An idempotency key is required." };
        const id = await saveDraft(ctx, parsed);
        await audit(ctx, "saveDraft", "mcp", id);
        return { ok: true, data: { id, saved: true } };
      }
      const p = z
        .object({
          limit: z.number().int().min(1).max(50).default(20),
          group: z.string().max(40).optional(),
        })
        .strict()
        .parse(payload);
      if (operation === "readOpportunities") {
        const rows = p.group
          ? await ctx.db
              .query("growthOpportunities")
              .withIndex("by_group", (q) => q.eq("group", p.group!))
              .order("desc")
              .take(p.limit)
          : await ctx.db
              .query("growthOpportunities")
              .order("desc")
              .take(p.limit);
        return {
          ok: true,
          data: scopedGrowthText(
            rows.map((row) => ({
              _id: row._id,
              name: row.name,
              kind: row.kind,
              group: row.group,
              location: row.location,
              website: row.website,
              summary: row.summary,
              productFit: row.productFit,
              sourceUrl: row.sourceUrl,
              sourceTitle: row.sourceTitle,
              status: row.status,
              nextStep: row.nextStep,
              deadline: row.deadline,
              tenderReference: row.tenderReference,
              requirements: row.requirements,
              createdAt: row.createdAt,
              updatedAt: row.updatedAt,
            })),
          ),
        };
      }
      if (operation === "readResearch") {
        const rows = await ctx.db.query("growthRuns").order("desc").take(50);
        return {
          ok: true,
          data: scopedGrowthText(
            rows
              .filter((row) => !p.group || row.request.groups.includes(p.group))
              .slice(0, p.limit)
              .map((row) => ({
                _id: row._id,
                status: row.status,
                summary: row.summary,
                sources: row.sources,
                nextSteps: row.nextSteps,
                createdAt: row.createdAt,
                finishedAt: row.finishedAt,
              })),
          ),
        };
      }
      return { ok: false, error: "Tool is not permitted." };
    } catch {
      return { ok: false, error: "Check the tool input." };
    }
  },
});
