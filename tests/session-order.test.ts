import { test } from "node:test";
import assert from "node:assert/strict";
import { readSessionSeed, sessionOrder } from "../lib/session-order";

const recipes = Array.from({ length: 88 }, (_, i) => ({ slug: `recipe-${i}` }));
test("shuffle is complete, repeatable and independent of source ordering", () => {
  const order = sessionOrder(recipes, 123);
  assert.equal(new Set(order.map((r) => r.slug)).size, 88);
  assert.deepEqual(order, sessionOrder([...recipes].reverse(), 123));
  assert.notDeepEqual(order, sessionOrder(recipes, 456));
  assert.deepEqual(sessionOrder(recipes, null), recipes);
  assert.equal(recipes[0].slug, "recipe-0");
});
test("reload reuses the saved seed without requesting another random value", () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (k: string) => values.get(k) ?? null,
    setItem: (k: string, v: string) => {
      values.set(k, v);
    },
  };
  const first = readSessionSeed(storage, () => 42);
  const reloaded = readSessionSeed(storage, () => {
    throw new Error("must not reshuffle");
  });
  assert.deepEqual(
    sessionOrder(recipes, first),
    sessionOrder(recipes, reloaded),
  );
  assert.equal(
    readSessionSeed({ getItem: () => null, setItem: () => {} }, () => 99),
    99,
  );
});
test("bad or blocked storage does not prevent browsing", () => {
  for (const invalid of ["bad", "", "-1", "4294967296", "1.5"]) {
    assert.equal(
      readSessionSeed({ getItem: () => invalid, setItem: () => {} }, () => 7),
      7,
    );
  }
  assert.equal(
    readSessionSeed(
      {
        getItem: () => {
          throw Error();
        },
        setItem: () => {
          throw Error();
        },
      },
      () => 7,
    ),
    7,
  );
});
