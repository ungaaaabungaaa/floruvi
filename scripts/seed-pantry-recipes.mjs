import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { execFileSync } from "node:child_process";
import recipes from "../convex/pantryRecipes.json" with { type: "json" };
const production = process.argv.includes("--prod");
const flags = production ? ["--prod"] : [];
const run = (name, args = {}) =>
  JSON.parse(
    execFileSync(
      process.execPath,
      [
        "node_modules/convex/bin/main.js",
        "run",
        name,
        JSON.stringify(args),
        ...flags,
      ],
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "inherit"],
        maxBuffer: 8 * 1024 * 1024,
      },
    ),
  );
const snapshot = () =>
  JSON.parse(
    execFileSync(
      process.execPath,
      [
        "node_modules/convex/bin/main.js",
        "run",
        "--inline-query",
        'return await ctx.db.query("recipes").take(500)',
        ...flags,
      ],
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "inherit"],
        maxBuffer: 8 * 1024 * 1024,
      },
    ),
  );
const before = snapshot();
const seeded = run("seed:recipes");
const after = snapshot();
for (const prior of before)
  assert.deepEqual(
    after.find((r) => r.slug === prior.slug),
    prior,
    `Existing recipe changed: ${prior.slug}`,
  );
for (const expected of recipes) {
  const actual = after.find((r) => r.slug === expected.slug);
  assert.ok(actual, expected.slug);
  for (const [key, value] of Object.entries(expected))
    assert.deepEqual(actual[key], value, `${expected.slug}: ${key}`);
  assert.equal(actual.published, true);
  assert.equal(actual.imageKey, `recipe:${expected.slug}`);
}
const repeat = run("seed:recipes");
assert.equal(repeat.added, 0);
const publicList = run("recipes:list");
assert.equal(publicList.length, after.filter((r) => r.published).length);
assert.equal(new Set(publicList.map((r) => r.slug)).size, publicList.length);
const report = {
  environment: production ? "production" : "development",
  seeded,
  repeat,
  preserved: before.length,
  total: after.length,
  recipes: after.filter((r) => recipes.some((x) => x.slug === r.slug)),
};
await fs.mkdir("backups/pantry-recipes-2026-10-18", { recursive: true });
await fs.writeFile(
  `backups/pantry-recipes-2026-10-18/${report.environment}.json`,
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    environment: report.environment,
    seeded,
    repeat,
    preserved: before.length,
    total: after.length,
    verifiedNewRecipes: recipes.length,
  }),
);
