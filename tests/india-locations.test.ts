import test from "node:test";
import assert from "node:assert/strict";
import { indiaStates, citiesForState } from "../lib/india-locations";

test("checkout covers all 36 India states and territories without duplicate options", () => {
  assert.equal(indiaStates.length, 36);
  assert.equal(new Set(indiaStates.map((state) => state.code)).size, 36);
  for (const state of indiaStates) {
    const cities = citiesForState(state.name);
    assert.ok(cities.length > 0);
    assert.equal(new Set(cities).size, cities.length);
  }
});
test("city choices follow the state and clear when no state is selected", () => {
  assert.ok(citiesForState("Karnataka").includes("Bengaluru"));
  assert.ok(citiesForState("Maharashtra").includes("Mumbai"));
  assert.equal(citiesForState("Maharashtra").includes("Bengaluru"), false);
  assert.deepEqual(citiesForState(""), []);
});
