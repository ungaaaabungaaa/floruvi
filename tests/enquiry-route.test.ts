import test from "node:test";
import assert from "node:assert/strict";
import { POST } from "../app/api/enquiries/route";

test("server enquiry boundary rejects abuse and only reports confirmed storage", async (t) => {
  const original = {
    secret: process.env.LEAD_INGEST_SECRET,
    site: process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
    fetch: globalThis.fetch,
  };
  t.after(() => {
    for (const [key, value] of [
      ["LEAD_INGEST_SECRET", original.secret],
      ["NEXT_PUBLIC_CONVEX_SITE_URL", original.site],
    ]) {
      if (value === undefined) delete process.env[key!];
      else process.env[key!] = value;
    }
    globalThis.fetch = original.fetch;
  });
  process.env.LEAD_INGEST_SECRET = "test-only-secret";
  process.env.NEXT_PUBLIC_CONVEX_SITE_URL = "https://example.convex.site";
  const payload = {
    kind: "personal",
    name: "Test User",
    business: "",
    email: "test@example.com",
    phone: "",
    city: "Test City",
    interest: "Basil",
    quantity: "",
    message: "Please confirm crop availability.",
    consent: true,
    website: "",
  };
  const request = (
    body = JSON.stringify(payload),
    origin = "https://farm.example",
  ) =>
    new Request("https://farm.example/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json", origin },
      body,
    });
  globalThis.fetch = async () => {
    throw new Error("No network call allowed");
  };
  assert.equal(
    (await POST(request("{}", "https://attacker.invalid"))).status,
    403,
  );
  assert.equal((await POST(request("{"))).status, 400);
  assert.equal(
    (await POST(request(JSON.stringify({ ...payload, consent: false }))))
      .status,
    400,
  );
  assert.equal(
    (
      await POST(
        request(JSON.stringify({ ...payload, website: "bot.invalid" })),
      )
    ).status,
    400,
  );
  assert.equal((await POST(request("x".repeat(12001)))).status, 413);
  assert.equal((await POST(request())).status, 503);
  globalThis.fetch = async (_url, init) => {
    const body = JSON.parse(init?.body as string);
    assert.match(body.ipHash, /^[a-f0-9]{64}$/);
    assert.match(body.contactHash, /^[a-f0-9]{64}$/);
    assert.equal(body.ip, undefined);
    assert.equal(
      new Headers(init?.headers).get("Authorization"),
      "Bearer test-only-secret",
    );
    return Response.json({ ok: true }, { status: 201 });
  };
  assert.equal((await POST(request())).status, 201);
  globalThis.fetch = async () => Response.json({ ok: false }, { status: 429 });
  assert.equal((await POST(request())).status, 429);
  delete process.env.LEAD_INGEST_SECRET;
  assert.equal((await POST(request())).status, 503);
});
