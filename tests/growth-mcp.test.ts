import test from "node:test";
import assert from "node:assert/strict";
import { GROWTH_MCP_MAX_BYTES, handleGrowthMcp } from "../lib/growth-mcp";

const token = "test-growth-token-01234567890123456789";
const env = {
  GROWTH_MCP_TOKEN: token,
  ADMIN_API_SECRET: "different-admin-secret",
  NEXT_PUBLIC_SITE_URL: "https://floruvi.example",
  NEXT_PUBLIC_CONVEX_SITE_URL: "https://example.convex.site",
};
const noFetch: typeof fetch = async () => {
  throw new Error("Unexpected backend request");
};
const rpc = (method: string, params: object = {}, id: number | string = 1) => ({
  jsonrpc: "2.0",
  id,
  method,
  params,
});
function request(
  body: unknown,
  headers: Record<string, string> = {},
  method = "POST",
) {
  return new Request("https://floruvi.example/api/growth/mcp", {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      "MCP-Protocol-Version": "2025-11-25",
      ...headers,
    },
    ...(method === "POST"
      ? { body: typeof body === "string" ? body : JSON.stringify(body) }
      : {}),
  });
}
async function call(name: string, args: object, fetcher = noFetch) {
  return (
    await handleGrowthMcp(
      request(rpc("tools/call", { name, arguments: args })),
      env,
      fetcher,
    )
  ).json();
}
function modern(method: string, params: Record<string, unknown> = {}) {
  return request(
    rpc(method, {
      ...params,
      _meta: {
        "io.modelcontextprotocol/protocolVersion": "2026-07-28",
        "io.modelcontextprotocol/clientCapabilities": {},
        "io.modelcontextprotocol/clientInfo": {
          name: "growth-test",
          version: "1.0",
        },
      },
    }),
    {
      "MCP-Protocol-Version": "2026-07-28",
      "Mcp-Method": method,
      ...(typeof params.name === "string" ? { "Mcp-Name": params.name } : {}),
    },
  );
}

test("MCP denies missing/wrong/admin credentials, foreign origins and unsafe setup", async () => {
  for (const authorization of [
    "",
    "Bearer wrong",
    `Bearer ${env.ADMIN_API_SECRET}`,
    `Basic ${token}`,
    `Bearer ${token} extra`,
  ]) {
    const response = await handleGrowthMcp(
      request(rpc("ping"), { Authorization: authorization }),
      env,
      noFetch,
    );
    assert.equal(response.status, 401);
    assert.match(response.headers.get("www-authenticate")!, /^Bearer /);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
  }
  for (const origin of [
    "null",
    "https://attacker.example",
    "https://floruvi.example.attacker.test",
    "https://floruvi.example/",
  ]) {
    assert.equal(
      (
        await handleGrowthMcp(
          request(rpc("ping"), { Origin: origin }),
          env,
          noFetch,
        )
      ).status,
      403,
    );
  }
  for (const override of [
    { GROWTH_MCP_TOKEN: undefined },
    { GROWTH_MCP_TOKEN: "short" },
    { GROWTH_MCP_TOKEN: env.ADMIN_API_SECRET },
    { ADMIN_API_SECRET: token },
    { NEXT_PUBLIC_CONVEX_SITE_URL: "https://attacker.example" },
    { NEXT_PUBLIC_CONVEX_SITE_URL: "https://example.convex.site/admin" },
    {
      NEXT_PUBLIC_CONVEX_SITE_URL:
        "https://example.convex.site@attacker.example",
    },
    { NEXT_PUBLIC_CONVEX_SITE_URL: "http://example.convex.site" },
    { NEXT_PUBLIC_SITE_URL: undefined },
  ])
    assert.equal(
      (
        await handleGrowthMcp(
          request(rpc("ping")),
          { ...env, ...override },
          noFetch,
        )
      ).status,
      503,
    );
  assert.equal(
    (
      await handleGrowthMcp(
        request(rpc("ping"), { Origin: env.NEXT_PUBLIC_SITE_URL }),
        env,
        noFetch,
      )
    ).status,
    200,
  );
});

test("MCP enforces transport and body limits before dispatch", async () => {
  const get = await handleGrowthMcp(request(null, {}, "GET"), env, noFetch);
  assert.equal(get.status, 405);
  assert.equal(get.headers.get("allow"), "POST");
  assert.equal(
    (await handleGrowthMcp(request(null, {}, "DELETE"), env, noFetch)).status,
    405,
  );
  for (const contentType of [
    "text/plain",
    "text/application/json",
    "application/json-invalid",
  ]) {
    assert.equal(
      (
        await handleGrowthMcp(
          request(rpc("ping"), { "Content-Type": contentType }),
          env,
          noFetch,
        )
      ).status,
      415,
    );
  }
  assert.equal(
    (await handleGrowthMcp(request("{bad"), env, noFetch)).status,
    400,
  );
  assert.equal(
    (
      await handleGrowthMcp(
        request("x".repeat(GROWTH_MCP_MAX_BYTES + 1), {
          "Content-Length": "2",
        }),
        env,
        noFetch,
      )
    ).status,
    413,
  );
  assert.equal(
    (
      await handleGrowthMcp(
        request(rpc("ping"), { Accept: "text/plain" }),
        env,
        noFetch,
      )
    ).status,
    406,
  );
  const batch = await handleGrowthMcp(request([rpc("ping")]), env, noFetch);
  assert.equal(batch.status, 400);
  const mismatch = modern("ping");
  mismatch.headers.set("Mcp-Method", "tools/call");
  const failed = await handleGrowthMcp(mismatch, env, noFetch);
  assert.equal(failed.status, 400);
  assert.equal((await failed.json()).error.code, -32020);
});

test("MCP serves legacy initialize and current discovery without sessions or SSE", async () => {
  const response = await handleGrowthMcp(
    request(
      rpc("initialize", {
        protocolVersion: "2025-11-25",
        capabilities: {},
        clientInfo: { name: "test", version: "1.0" },
      }),
    ),
    env,
    noFetch,
  );
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type")!, /^application\/json/);
  assert.equal(response.headers.get("mcp-session-id"), null);
  const body = await response.json();
  assert.equal(body.result.protocolVersion, "2025-11-25");
  assert.equal(body.result.serverInfo.name, "floruvi-growth");
  assert.ok(body.result.capabilities.tools);
  const discovery = await handleGrowthMcp(
    modern("server/discover"),
    env,
    noFetch,
  );
  assert.equal(discovery.status, 200);
  assert.ok(
    (await discovery.json()).result.supportedVersions.includes("2026-07-28"),
  );
  const notification = await handleGrowthMcp(
    request({ jsonrpc: "2.0", method: "notifications/initialized" }),
    env,
    noFetch,
  );
  assert.equal(notification.status, 202);
  assert.equal(await notification.text(), "");
  assert.equal(
    (await handleGrowthMcp(request(rpc("ping")), env, noFetch)).status,
    200,
  );
});

test("MCP exposes only the three scoped tools and rejects unsupported names/arguments", async () => {
  const response = await handleGrowthMcp(
    request(rpc("tools/list")),
    env,
    noFetch,
  );
  const tools = (await response.json()).result.tools;
  assert.deepEqual(
    tools.map((tool: { name: string }) => tool.name),
    ["read_opportunities", "read_research", "save_draft"],
  );
  assert.ok(tools[2].inputSchema.required.includes("idempotencyKey"));
  assert.equal("id" in tools[2].inputSchema.properties, false);
  assert.equal(tools[0].inputSchema.additionalProperties, false);
  for (const name of [
    "send_email",
    "start_research",
    "read_orders",
    "http_fetch",
    "__proto__",
  ]) {
    assert.ok((await call(name, {})).error);
  }
  for (const args of [
    { limit: 51 },
    { limit: -1 },
    { limit: 1.5 },
    { group: "unknown" },
    { url: "https://attacker.example" },
  ]) {
    const result = await call("read_opportunities", args);
    assert.ok(result.error || result.result?.isError, JSON.stringify(args));
  }
  for (const args of [
    { title: "Draft", body: "A valid draft body", opportunityId: "" },
    {
      title: "Draft",
      body: "A valid draft body",
      opportunityId: "",
      idempotencyKey: "",
    },
    {
      title: "Draft",
      body: "A valid draft body",
      opportunityId: "",
      idempotencyKey: "abc12345",
      send: true,
    },
    {
      id: "existing-draft",
      title: "Draft",
      body: "A valid draft body",
      opportunityId: "",
      idempotencyKey: "abc12345",
    },
  ]) {
    const result = await call("save_draft", args);
    assert.ok(result.error || result.result?.isError);
  }
});

test("MCP calls the fixed backend and strips contact/private fields from responses", async () => {
  let count = 0;
  const backend: typeof fetch = async (url, init) => {
    count++;
    assert.equal(url, "https://example.convex.site/growth/mcp");
    assert.equal(init?.redirect, "error");
    assert.equal(init?.cache, "no-store");
    assert.equal(
      new Headers(init?.headers).get("Authorization"),
      `Bearer ${token}`,
    );
    const body = JSON.parse(String(init?.body));
    assert.deepEqual(body, {
      operation: "readOpportunities",
      payload: { limit: 20, group: "hospitality" },
    });
    return Response.json({
      ok: true,
      data: [
        {
          id: "buyer-1",
          name: "Sample kitchen",
          group: "hospitality",
          sourceUrl: "https://example.com",
          contact: "private@example.com",
          notes: "private note",
          session: "private-session",
          payment: { total: 100 },
          secret: token,
        },
      ],
    });
  };
  const response = await handleGrowthMcp(
    modern("tools/call", {
      name: "read_opportunities",
      arguments: { group: "hospitality" },
    }),
    env,
    backend,
  );
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.deepEqual(body.result.structuredContent.records, [
    {
      id: "buyer-1",
      name: "Sample kitchen",
      group: "hospitality",
      sourceUrl: "https://example.com",
    },
  ]);
  assert.equal(JSON.stringify(body).includes("private"), false);
  assert.equal(JSON.stringify(body).includes(token), false);
  assert.equal(count, 1);
});

test("MCP passes a stable draft idempotency key and hides backend failures", async () => {
  const args = {
    title: "Sample offer",
    body: "Please review this offer.",
    opportunityId: "buyer-1",
    idempotencyKey: "draft-key-12345",
  };
  const saved: object[] = [];
  const backend: typeof fetch = async (_url, init) => {
    const value = JSON.parse(String(init?.body));
    assert.equal(value.operation, "saveDraft");
    saved.push(value.payload);
    return Response.json({
      ok: true,
      data: { id: "draft-1", saved: true, body: "private draft detail" },
    });
  };
  for (let i = 0; i < 2; i++) {
    const response = await call("save_draft", args, backend);
    assert.deepEqual(response.result.structuredContent, {
      id: "draft-1",
      status: "draft",
      requiresOwnerReview: true,
    });
  }
  assert.deepEqual(saved, [args, args]);
  for (const fail of [
    async () =>
      Response.json(
        { ok: false, error: "private backend data" },
        { status: 429 },
      ),
    async () => {
      throw new Error(`private backend data ${token}`);
    },
  ]) {
    const response = await call("save_draft", args, fail);
    assert.equal(response.result.isError, true);
    assert.equal(
      JSON.stringify(response).includes("private backend data"),
      false,
    );
    assert.equal(JSON.stringify(response).includes(token), false);
  }
});

test("MCP research output excludes raw requests and notifications cannot save drafts", async () => {
  let count = 0;
  const backend: typeof fetch = async (_url, init) => {
    count++;
    assert.deepEqual(JSON.parse(String(init?.body)), {
      operation: "readResearch",
      payload: { limit: 1, group: "export" },
    });
    return Response.json({
      ok: true,
      data: [
        {
          id: "research-1",
          status: "complete",
          kind: "export",
          summary: "Review the official source.",
          sources: [
            {
              url: "https://example.com",
              title: "Official source",
              contact: "private contact",
            },
          ],
          nextSteps: ["Verify supply capacity"],
          request: { contacts: "private request" },
          error: "private error",
          apiKey: token,
        },
      ],
    });
  };
  const body = await call(
    "read_research",
    { limit: 1, group: "export" },
    backend,
  );
  assert.equal(body.result.structuredContent.records[0].id, "research-1");
  assert.deepEqual(body.result.structuredContent.records[0].sources, [
    { url: "https://example.com", title: "Official source" },
  ]);
  assert.equal(JSON.stringify(body).includes("private"), false);
  assert.equal(JSON.stringify(body).includes(token), false);
  assert.equal(count, 1);
  const notification = await handleGrowthMcp(
    request({
      jsonrpc: "2.0",
      method: "tools/call",
      params: {
        name: "save_draft",
        arguments: {
          title: "Draft title",
          body: "Draft body",
          opportunityId: "",
          idempotencyKey: "test-1234",
        },
      },
    }),
    env,
    backend,
  );
  assert.equal(notification.status, 202);
  assert.equal(count, 1);
  const unsupported = modern("ping");
  unsupported.headers.set("MCP-Protocol-Version", "2099-01-01");
  const rejected = await handleGrowthMcp(unsupported, env, noFetch);
  assert.equal(rejected.status, 400);
});
