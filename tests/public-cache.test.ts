import test from "node:test";
import assert from "node:assert/strict";
import { GET } from "../app/llms.txt/route";

test("AI catalogue route uses tagged daily public reads and retains its text output", async (t) => {
  const previous = process.env.NEXT_PUBLIC_CONVEX_URL;
  process.env.NEXT_PUBLIC_CONVEX_URL = "https://example.convex.cloud";
  t.after(() => {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_CONVEX_URL;
    else process.env.NEXT_PUBLIC_CONVEX_URL = previous;
  });
  const paths: string[] = [];
  t.mock.method(globalThis, "fetch", async (_input: unknown, init: RequestInit & {
    next?: { revalidate: number; tags: string[] };
  }) => {
    assert.equal(init.cache, "force-cache");
    assert.equal(init.next?.revalidate, 86400);
    assert.deepEqual(init.next?.tags, ["catalogue"]);
    const { path } = JSON.parse(String(init.body));
    paths.push(path);
    return Response.json({ status: "success", value: path === "storefront:catalogue"
      ? { categories: [], products: [], commerce: null }
      : [] });
  });
  const response = await GET();
  assert.equal(response.status, 200);
  assert.match(await response.text(), /# Floruvi/);
  assert.deepEqual(paths.sort(), ["storefront:catalogue", "storefront:recipes"]);
});
