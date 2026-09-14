import assert from "node:assert/strict";
import { test } from "node:test";
import { storefrontCopy } from "../lib/storefront-copy";

test("formats nested storefront prose without changing identifiers or source data", () => {
  const source = {
    name: "Spinach and basil",
    steps: ["Wash and dry.", "And serve with bread."],
    slug: "rocket-pear-and-walnut-salad",
    imageKey: "and",
    sourceUrl: "https://example.com/and?name=and",
    price: 105,
  };
  const result = storefrontCopy(source);
  assert.equal(result.name, "Spinach & basil");
  assert.deepEqual(result.steps, ["Wash & dry.", "& serve with bread."]);
  assert.equal(result.slug, source.slug);
  assert.equal(result.imageKey, source.imageKey);
  assert.equal(result.sourceUrl, source.sourceUrl);
  assert.equal(result.price, 105);
  assert.equal(source.name, "Spinach and basil");
  assert.equal(storefrontCopy("Coriander and candy"), "Coriander & candy");
  assert.equal(storefrontCopy(null), null);
});
