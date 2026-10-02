import test, { type TestContext } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { convexTest } from "convex-test";
import { v } from "convex/values";
import schema from "../convex/schema";
import { internal } from "../convex/_generated/api";
import { internalAction } from "../convex/_generated/server";
import type { Id } from "../convex/_generated/dataModel";
import { emptySupplyProfile, type OpportunityInput } from "../lib/growth";
import {
  DEFAULT_RESEARCH_RESERVATION_MICROS,
  APOLLO_ENRICHMENT_RESERVATION,
} from "../lib/growth-budget";

// Explicit modules work under node:test/tsx. Scheduled provider work is replaced
// by a no-op: these tests exercise the real persistence gates without paid calls.
const modules = {
  "../convex/_generated/server.ts": () => import("../convex/_generated/server"),
  "../convex/growth.ts": () => import("../convex/growth"),
  "../convex/growthActions.ts": async () => ({
    run: internalAction({
      args: { id: v.id("growthRuns") },
      handler: async () => null,
    }),
  }),
};
const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
const ownerHash = hash("owner-test-session");
const mcpToken = "growth-test-token-012345678901234567890";
const mcpHash = hash(mcpToken);
const request = {
  kind: "buyers" as const,
  groups: ["hospitality" as const],
  region: "Bengaluru",
  products: "Basil",
  limit: 3,
  useExa: false,
};
const opportunity = (
  overrides: Partial<OpportunityInput> = {},
): OpportunityInput => ({
  kind: "buyer",
  name: "Example Hotel Hebbal",
  group: "hospitality",
  location: "Bengaluru",
  website: "https://hotel.example/hebbal",
  contact: "buyer@hotel.example",
  role: "Buyer",
  summary: "Review the menu.",
  productFit: "Fresh herbs",
  sourceUrl: "https://hotel.example/procurement",
  sourceTitle: "Hotel procurement",
  nextStep: "Check weekly demand.",
  tenderReference: "",
  deadline: "",
  requirements: "Verify supply capacity.",
  ...overrides,
});

async function setup(t: TestContext) {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const variables: Record<string, string> = {
    GROWTH_MCP_TOKEN: mcpToken,
    ADMIN_API_SECRET: "separate-admin-secret-012345678901234567890",
    GROWTH_RESEARCH_ENABLED: "true",
    GROWTH_MONTHLY_BUDGET_USD: "10",
    GROWTH_APOLLO_MONTHLY_CREDITS: "100",
    OPENAI_API_KEY: "test-never-used",
    APOLLO_API_KEY: "test-never-used",
  };
  const before = Object.fromEntries(
    Object.keys(variables).map((key) => [key, process.env[key]]),
  );
  Object.assign(process.env, variables);
  t.after(() => {
    t.mock.timers.reset();
    for (const [key, value] of Object.entries(before)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
  const db = convexTest(schema, modules);
  const sessionId = await db.run((ctx) =>
    ctx.db.insert("adminSessions", {
      tokenHash: ownerHash,
      expiresAt: Date.now() + 3_600_000,
    }),
  );
  return { db, sessionId };
}

test("growth backend denies missing or expired owner sessions on direct calls", async (t) => {
  const { db, sessionId } = await setup(t);
  for (const tokenHash of ["", hash("wrong-session")]) {
    assert.equal(
      await db.query(internal.growth.dashboard, { tokenHash }),
      null,
    );
    assert.equal(
      (
        await db.mutation(internal.growth.update, {
          tokenHash,
          operation: "saveProfile",
          payload: emptySupplyProfile,
        })
      ).ok,
      false,
    );
    assert.equal(
      (
        await db.mutation(internal.growth.start, {
          tokenHash,
          payload: request,
        })
      ).ok,
      false,
    );
    assert.equal(
      await db.mutation(internal.growth.authorizeProvider, {
        tokenHash,
        operation: "apolloSearch",
      }),
      false,
    );
    assert.equal(
      (
        await db.mutation(internal.growth.reserveEnrichment, {
          tokenHash,
          personId: "person-1",
        })
      ).ok,
      false,
    );
  }
  await db.run((ctx) => ctx.db.patch(sessionId, { expiresAt: Date.now() - 1 }));
  assert.equal(
    await db.query(internal.growth.dashboard, { tokenHash: ownerHash }),
    null,
  );
  assert.equal(
    (
      await db.mutation(internal.growth.update, {
        tokenHash: ownerHash,
        operation: "saveOpportunity",
        payload: opportunity(),
      })
    ).ok,
    false,
  );
  assert.deepEqual(
    await db.run(async (ctx) => ({
      runs: await ctx.db.query("growthRuns").collect(),
      opportunities: await ctx.db.query("growthOpportunities").collect(),
      usage: await ctx.db.query("growthUsage").collect(),
    })),
    { runs: [], opportunities: [], usage: [] },
  );
});

test("direct MCP rejects admin credentials, permits creation only, and preserves retry identity after owner edits", async (t) => {
  const { db } = await setup(t);
  const draft = {
    title: "Sample offer",
    body: "Please review this sample offer.",
    opportunityId: "",
    idempotencyKey: "draft-idempotency-1",
  };
  for (const tokenHash of [
    ownerHash,
    hash(process.env.ADMIN_API_SECRET!),
    "wrong",
  ]) {
    assert.equal(
      (
        await db.mutation(internal.growth.mcp, {
          tokenHash,
          operation: "saveDraft",
          payload: draft,
        })
      ).ok,
      false,
    );
  }
  const originalAdmin = process.env.ADMIN_API_SECRET;
  process.env.ADMIN_API_SECRET = mcpToken;
  assert.equal(
    (
      await db.mutation(internal.growth.mcp, {
        tokenHash: mcpHash,
        operation: "saveDraft",
        payload: draft,
      })
    ).ok,
    false,
  );
  process.env.ADMIN_API_SECRET = originalAdmin;
  assert.equal(
    (
      await db.mutation(internal.growth.mcp, {
        tokenHash: mcpHash,
        operation: "saveDraft",
        payload: { ...draft, id: "existing-id" },
      })
    ).ok,
    false,
  );
  assert.equal(
    (
      await db.mutation(internal.growth.mcp, {
        tokenHash: mcpHash,
        operation: "saveDraft",
        payload: { title: draft.title, body: draft.body, opportunityId: "" },
      })
    ).ok,
    false,
  );
  const first = await db.mutation(internal.growth.mcp, {
    tokenHash: mcpHash,
    operation: "saveDraft",
    payload: draft,
  });
  assert.equal(first.ok, true);
  const id = (first.data as { id: Id<"growthDrafts"> }).id;
  const repeated = await db.mutation(internal.growth.mcp, {
    tokenHash: mcpHash,
    operation: "saveDraft",
    payload: draft,
  });
  assert.deepEqual(repeated.data, first.data);
  assert.equal(
    (
      await db.mutation(internal.growth.update, {
        tokenHash: ownerHash,
        operation: "saveDraft",
        payload: {
          id,
          title: "Owner edit",
          body: "The owner edited this draft.",
          opportunityId: "",
        },
      })
    ).ok,
    true,
  );
  const afterEdit = await db.mutation(internal.growth.mcp, {
    tokenHash: mcpHash,
    operation: "saveDraft",
    payload: draft,
  });
  assert.deepEqual(afterEdit.data, first.data);
  const saved = await db.run((ctx) => ctx.db.query("growthDrafts").collect());
  assert.equal(saved.length, 1);
  assert.equal(saved[0].title, "Owner edit");
  assert.equal(saved[0].idempotencyKey, draft.idempotencyKey);
  for (const operation of [
    "startResearch",
    "readOrders",
    "sendEmail",
    "deleteDraft",
  ])
    assert.equal(
      (
        await db.mutation(internal.growth.mcp, {
          tokenHash: mcpHash,
          operation,
          payload: {},
        })
      ).ok,
      false,
    );
});

test("direct MCP redacts contacts in nested evidence and excludes private fields", async (t) => {
  const { db } = await setup(t);
  const saved = await db.mutation(internal.growth.update, {
    tokenHash: ownerHash,
    operation: "saveOpportunity",
    payload: opportunity({
      summary: "Email chef@hotel.example or call +91 98765 43210.",
      sourceTitle: "Buyer: chef@hotel.example",
      requirements: "Contact +91 (98765) 43210",
    }),
  });
  assert.equal(saved.ok, true);
  await db.mutation(internal.growth.update, {
    tokenHash: ownerHash,
    operation: "updateOpportunity",
    payload: { id: saved.id, status: "reviewed", notes: "Private owner note" },
  });
  await db.run((ctx) =>
    ctx.db.insert("growthRuns", {
      request,
      status: "complete",
      actorHash: ownerHash,
      month: "2026-10",
      createdAt: Date.now(),
      reservationMicros: 0,
      settled: true,
      summary: "Email chef@hotel.example",
      sources: [
        {
          url: "https://hotel.example/procurement",
          title: "Call +91 98765 43210",
        },
      ],
      nextSteps: ["Call +91 98765 43210"],
      error: "Private provider error",
      providerId: "private-provider-id",
    }),
  );
  for (const operation of ["readOpportunities", "readResearch"]) {
    const result = await db.mutation(internal.growth.mcp, {
      tokenHash: mcpHash,
      operation,
      payload: { limit: 20, group: "hospitality" },
    });
    assert.equal(result.ok, true);
    const json = JSON.stringify(result.data);
    assert.match(json, /\[contact removed\]/);
    for (const privateValue of [
      "chef@hotel.example",
      "98765",
      "buyer@hotel.example",
      "Private owner note",
      "Private provider error",
      "private-provider-id",
      ownerHash,
    ])
      assert.equal(json.includes(privateValue), false, privateValue);
    const rows = result.data as Record<string, unknown>[];
    assert.equal(rows.length, 1);
    assert.equal("contact" in rows[0], false);
    assert.equal("notes" in rows[0], false);
    assert.equal("request" in rows[0], false);
  }
});

test("direct MCP preserves numeric tender evidence while removing all contact and token query fields", async (t) => {
  const { db } = await setup(t);
  const sourceUrl =
    "https://tenders.example/notices/202600012345?notice=202600012345&email=buyer%40example.com&phone=%2B919876543210&token=private-link-token&view=public";
  const expectedUrl =
    "https://tenders.example/notices/202600012345?notice=202600012345&view=public";
  const saved = await db.mutation(internal.growth.update, {
    tokenHash: ownerHash,
    operation: "saveOpportunity",
    payload: opportunity({
      kind: "tender",
      group: "government",
      sourceUrl,
      website: sourceUrl,
      tenderReference: "202600012345",
      deadline: "2026-11-20",
      summary: "Contact buyer@example.com or +91 98765 43210 before review.",
    }),
  });
  assert.equal(saved.ok, true);
  await db.run((ctx) =>
    ctx.db.insert("growthRuns", {
      request: { ...request, kind: "tenders", groups: ["government"] },
      status: "complete",
      actorHash: ownerHash,
      month: "2026-10",
      createdAt: Date.now(),
      reservationMicros: 0,
      settled: true,
      summary: "Review the official notice.",
      sources: [{ url: sourceUrl, title: "Notice 202600012345" }],
      nextSteps: [],
    }),
  );
  const opportunities = await db.mutation(internal.growth.mcp, {
    tokenHash: mcpHash,
    operation: "readOpportunities",
    payload: { group: "government", limit: 1 },
  });
  assert.equal(opportunities.ok, true);
  const result = (opportunities.data as Record<string, unknown>[])[0];
  assert.equal(result._id, saved.id);
  assert.equal(result.tenderReference, "202600012345");
  assert.equal(result.deadline, "2026-11-20");
  assert.equal(result.sourceUrl, expectedUrl);
  assert.equal(result.website, expectedUrl);
  const research = await db.mutation(internal.growth.mcp, {
    tokenHash: mcpHash,
    operation: "readResearch",
    payload: { group: "government", limit: 1 },
  });
  assert.equal(research.ok, true);
  const sources = (research.data as { sources: { url: string }[] }[])[0]
    .sources;
  assert.equal(sources[0].url, expectedUrl);
  const output = JSON.stringify([opportunities.data, research.data]);
  for (const privateValue of [
    "buyer@example.com",
    "9876543210",
    "private-link-token",
  ])
    assert.equal(output.includes(privateValue), false, privateValue);
});

test("same-brand branches remain distinct while repeated discoveries preserve owner decisions", async (t) => {
  const { db } = await setup(t);
  const save = (payload: OpportunityInput) =>
    db.mutation(internal.growth.update, {
      tokenHash: ownerHash,
      operation: "saveOpportunity",
      payload,
    });
  const hebbal = opportunity();
  const whitefield = opportunity({
    name: "Example Hotel Whitefield",
    website: "https://hotel.example/whitefield",
  });
  const first = await save(hebbal),
    second = await save(whitefield);
  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  assert.notEqual(first.id, second.id);
  await db.mutation(internal.growth.update, {
    tokenHash: ownerHash,
    operation: "updateOpportunity",
    payload: {
      id: first.id,
      status: "do-not-contact",
      notes: "Owner suppression",
    },
  });
  const repeat = await save({
    ...hebbal,
    name: "  EXAMPLE HOTEL HEBBAL  ",
    summary: "Fresh research must not replace owner data.",
  });
  assert.equal(repeat.id, first.id);
  const records = await db.run((ctx) =>
    ctx.db.query("growthOpportunities").collect(),
  );
  assert.equal(records.length, 2);
  assert.equal(
    records.find((row) => row._id === first.id)?.status,
    "do-not-contact",
  );
  assert.equal(
    records.find((row) => row._id === first.id)?.summary,
    hebbal.summary,
  );
});

test("research reservations serialize concurrent starts and queued cancellation releases only once", async (t) => {
  const { db } = await setup(t);
  const starts = await Promise.all(
    [1, 2].map(() =>
      db.mutation(internal.growth.start, {
        tokenHash: ownerHash,
        payload: request,
      }),
    ),
  );
  assert.equal(starts.filter((result) => result.ok).length, 1);
  const id = starts.find((result) => result.ok)!.id as Id<"growthRuns">;
  let usage = await db.run((ctx) => ctx.db.query("growthUsage").unique());
  assert.equal(usage?.reservedMicros, DEFAULT_RESEARCH_RESERVATION_MICROS);
  assert.equal(usage?.dailyRuns, 1);
  assert.equal(
    (await db.mutation(internal.growth.cancel, { tokenHash: "wrong", id })).ok,
    false,
  );
  assert.equal(
    (await db.mutation(internal.growth.cancel, { tokenHash: ownerHash, id }))
      .ok,
    true,
  );
  assert.equal(await db.mutation(internal.growth.claim, { id }), null);
  await db.mutation(internal.growth.cancel, { tokenHash: ownerHash, id });
  await db.mutation(internal.growth.expireRun, { id });
  usage = await db.run((ctx) => ctx.db.query("growthUsage").unique());
  assert.equal(usage?.reservedMicros, 0);
  assert.equal(usage?.chargedMicros, 0);
  assert.equal((await db.run((ctx) => ctx.db.get(id)))?.status, "cancelled");
});

test("running cancellation keeps the reserve, discards late results and cannot charge twice", async (t) => {
  const { db } = await setup(t);
  process.env.GROWTH_MONTHLY_BUDGET_USD = String(
    DEFAULT_RESEARCH_RESERVATION_MICROS / 1_000_000,
  );
  const started = await db.mutation(internal.growth.start, {
    tokenHash: ownerHash,
    payload: request,
  });
  const id = started.id as Id<"growthRuns">;
  assert.ok(await db.mutation(internal.growth.claim, { id }));
  assert.equal(await db.query(internal.growth.isActive, { id }), true);
  await db.mutation(internal.growth.cancel, { tokenHash: ownerHash, id });
  assert.equal(await db.query(internal.growth.isActive, { id }), false);
  let usage = await db.run((ctx) => ctx.db.query("growthUsage").unique());
  assert.equal(usage?.reservedMicros, DEFAULT_RESEARCH_RESERVATION_MICROS);
  const blocked = await db.mutation(internal.growth.start, {
    tokenHash: ownerHash,
    payload: request,
  });
  assert.equal(blocked.ok, false);
  assert.match(blocked.error!, /budget/);
  const result = {
    summary: "Late provider result",
    opportunities: [opportunity()],
    sources: [],
    nextSteps: [],
  };
  await db.mutation(internal.growth.finish, { id, result, costMicros: 50_000 });
  await db.mutation(internal.growth.finish, { id, result, costMicros: 50_000 });
  await db.mutation(internal.growth.expireRun, { id });
  usage = await db.run((ctx) => ctx.db.query("growthUsage").unique());
  assert.equal(usage?.reservedMicros, 0);
  assert.equal(usage?.chargedMicros, 50_000);
  assert.equal((await db.run((ctx) => ctx.db.get(id)))?.status, "cancelled");
  assert.equal(
    (await db.run((ctx) => ctx.db.query("growthOpportunities").collect()))
      .length,
    0,
  );
});

test("expiry retains uncertain provider spend and owner-session expiry prevents dispatch", async (t) => {
  const { db, sessionId } = await setup(t);
  const started = await db.mutation(internal.growth.start, {
    tokenHash: ownerHash,
    payload: request,
  });
  const id = started.id as Id<"growthRuns">;
  await db.mutation(internal.growth.claim, { id });
  t.mock.timers.runAll();
  await db.finishInProgressScheduledFunctions();
  const row = await db.run((ctx) => ctx.db.get(id));
  assert.equal(row?.status, "failed");
  assert.equal(row?.settled, true);
  let usage = await db.run((ctx) => ctx.db.query("growthUsage").unique());
  assert.equal(usage?.reservedMicros, 0);
  assert.equal(usage?.chargedMicros, DEFAULT_RESEARCH_RESERVATION_MICROS);
  await db.mutation(internal.growth.finish, { id, costMicros: 1 });
  const another = await db.mutation(internal.growth.start, {
    tokenHash: ownerHash,
    payload: request,
  });
  const nextId = another.id as Id<"growthRuns">;
  await db.run((ctx) => ctx.db.patch(sessionId, { expiresAt: Date.now() - 1 }));
  assert.equal(await db.mutation(internal.growth.claim, { id: nextId }), null);
  usage = await db.run((ctx) => ctx.db.query("growthUsage").unique());
  assert.equal(usage?.reservedMicros, 0);
  assert.equal(usage?.chargedMicros, DEFAULT_RESEARCH_RESERVATION_MICROS);
});

test("Apollo requires a fresh owned candidate and rejects a changed employer before saving contacts", async (t) => {
  const { db } = await setup(t);
  const reserve = (personId: string) =>
    db.mutation(internal.growth.reserveEnrichment, {
      tokenHash: ownerHash,
      personId,
    });
  assert.equal((await reserve("person-1")).ok, false);
  assert.equal(
    await db.mutation(internal.growth.rememberApolloSearch, {
      tokenHash: "wrong",
      domain: "hotel.example",
      people: [{ id: "person-1", organization: "Example Hotel" }],
    }),
    false,
  );
  await db.mutation(internal.growth.rememberApolloSearch, {
    tokenHash: ownerHash,
    domain: "hotel.example",
    people: [{ id: "person-1", organization: "Example Hotel" }],
  });
  const attempts = await Promise.all([
    reserve("person-1"),
    reserve("person-1"),
  ]);
  assert.equal(attempts.filter((item) => item.ok).length, 1);
  const reservation = attempts.find((item) => item.ok)!;
  assert.ok("id" in reservation);
  const id = reservation.id as Id<"growthEnrichments">;
  const mismatch = {
    person: {
      id: "person-1",
      domain: "other.example",
      organization: "Other company",
      email: "buyer@other.example",
    },
    status: "matched",
  };
  assert.equal(
    await db.mutation(internal.growth.finishEnrichment, { id, data: mismatch }),
    false,
  );
  const saved = await db.run((ctx) => ctx.db.get(id));
  assert.equal(saved?.status, "failed");
  assert.equal(saved?.data, undefined);
  assert.equal((await reserve("person-1")).ok, false);
  const usage = await db.run((ctx) => ctx.db.query("growthUsage").unique());
  assert.equal(usage?.apolloUsed, APOLLO_ENRICHMENT_RESERVATION);
});

test("Apollo cache is reusable only for the current owned company selection", async (t) => {
  const { db } = await setup(t);
  const remember = (domain: string, organization: string) =>
    db.mutation(internal.growth.rememberApolloSearch, {
      tokenHash: ownerHash,
      domain,
      people: [{ id: "person-2", organization }],
    });
  const reserve = () =>
    db.mutation(internal.growth.reserveEnrichment, {
      tokenHash: ownerHash,
      personId: "person-2",
    });
  await remember("hotel.example", "Example Hotel");
  const first = await reserve();
  assert.ok(first.ok && "id" in first);
  const data = {
    person: {
      id: "person-2",
      domain: "hotel.example",
      organization: "Example Hotel",
      email: "buyer@hotel.example",
    },
    status: "matched",
  };
  assert.equal(
    await db.mutation(internal.growth.finishEnrichment, {
      id: first.id as Id<"growthEnrichments">,
      data,
    }),
    true,
  );
  const cached = await reserve();
  assert.ok(cached.ok && "cached" in cached);
  assert.deepEqual(cached.cached, data);
  await remember("other.example", "Other Company");
  assert.equal((await reserve()).ok, false);
  const usage = await db.run((ctx) => ctx.db.query("growthUsage").unique());
  assert.equal(usage?.apolloUsed, APOLLO_ENRICHMENT_RESERVATION);
  await db.run(async (ctx) => {
    const candidate = await ctx.db.query("growthApolloCandidates").unique();
    await ctx.db.patch(candidate!._id, { expiresAt: Date.now() - 1 });
  });
  assert.equal((await reserve()).ok, false);
});
