import test from "node:test";
import assert from "node:assert/strict";
import { findProducts, sortProducts } from "../lib/search";
import { cropCatalogue } from "../convex/catalogueData";
const products = cropCatalogue.map((p) => ({
  ...p,
  imageUrl: null,
  price: null,
}));
test("search tolerates spelling mistakes and swapped letters, with exact names first", () => {
  for (const [query, slug] of [
    ["spinch", "spinach"],
    ["lettcue", "romaine-lettuce"],
    ["brocoli", "broccoli-microgreens"],
    ["capsicum", "bell-peppers"],
    ["palak", "spinach"],
    ["dhaniya", "coriander"],
    ["PAK-CHOI", "bok-choy"],
    ["púdina", "mint"],
  ]) {
    assert.ok(
      findProducts(products, query).some((p) => p.slug === slug),
      query,
    );
  }
  assert.equal(findProducts(products, "spinach")[0].slug, "spinach");
  assert.ok(
    findProducts(products, "lettcue wraps").some(
      (p) => p.slug === "romaine-lettuce",
    ),
  );
  assert.equal(findProducts(products, "palak", "herbs").length, 0);
  assert.equal(findProducts(products, "xyz").length, 0);
  assert.equal(findProducts(products, "qwertyuiop").length, 0);
});
test("pack sorting puts unpriced crops last in both directions and preserves relevance", () => {
  const source = products
    .slice(0, 3)
    .map((p, i) => ({
      ...p,
      price:
        i === 0
          ? null
          : {
              amountMinor: i * 10000,
              currency: "INR" as const,
              packLabel: "100 g",
            },
    }));
  assert.deepEqual(
    sortProducts(source, "price-asc", false).map((p) => p.price?.amountMinor),
    [10000, 20000, undefined],
  );
  assert.deepEqual(
    sortProducts(source, "price-desc", false).map((p) => p.price?.amountMinor),
    [20000, 10000, undefined],
  );
  assert.deepEqual(sortProducts(source, "recommended", true), source);
});

test("search finds Indian names, spelling variants and Devanagari, with the crop itself first", () => {
  for (const [query, slug] of [
    ["kheera", "cucumber"],
    ["khira", "cucumber"],
    ["tamater", "cherry-tomatoes"],
    ["muli", "radish"],
    ["mooli", "radish"],
    ["alu", "potato"],
    ["bengan", "eggplant"],
    ["पालक", "spinach"],
    ["palak chahiye", "spinach"],
    ["tulsi", "holy-basil"],
    ["sarson ka saag", "mustard-greens"],
    ["piyaz", "spring-onions"],
    ["zukini", "zucchini"],
  ]) {
    assert.equal(findProducts(products, query)[0]?.slug, slug, query);
  }
  // Microgreens answer to their parent crop's names, below the crop.
  const mooli = findProducts(products, "mooli").map((p) => p.slug);
  assert.ok(mooli.includes("radish-microgreens"));
  // A word that matches nothing still finds nothing.
  assert.equal(findProducts(products, "bhindi").length, 0);
});
