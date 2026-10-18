# Pantry recipes — 18 October 2026

Owner request: add 40 recipes with images, update recipe links and publish the completed range. Use the existing Floruvi theme and recipe pages. Preserve existing recipes and owner edits.

## Scope

- Forty new vegetarian recipes across all 11 flours, powders and onion flakes.
- Measured ingredients, numbered methods, preparation and cooking estimates, servings and a practical tip.
- One separate generated serving image per dish. Warm ivory stone, natural daylight and natural food colours.
- Exact pantry product links on each recipe page. Link the matching recipes from pantry product pages without unrelated suggestions.
- Preserve the five product gallery images. Recipe images belong in the recipe section.
- Additive seeds in development and production. Verify existing records remain unchanged and repeat seeds add zero duplicates.
- Run local checks, publish the website, refresh the catalogue cache, and verify live pages and image files.

These are original editorial cooking guides. They have not been kitchen-tested. Generated images show serving ideas. Do not add nutrition or health claims.

## Initial checkpoint

The 40 images are generating through built-in image_gen in four workers. Recipe content is being prepared in convex/pantryRecipes.json. Reuse convex/recipeData.ts, seed:recipes and the existing recipe image map. No schema, provider, payment, identity or stock change is needed.

Preserve the existing untracked output/ and docs/farm-plan/2026-10-12-profit-plan/ directories. Application commit 75b8fda is already live; local documentation commit ada7d24 records the preceding product release.

## Verified result — 19 October 2026

- Development and production each contain 102 products and 217 recipes.
- All 217 recipe records match, excluding deployment-specific IDs. All product catalogue values match; omitted inStock and true both mean available. Two historical basil records use these equivalent representations. No stock change was made.
- Each seed added 40 recipes and preserved all 177 existing records. A repeat added zero.
- Forty distinct WebP images were checked. All 143 tests, TypeScript, ESLint and the production build passed.
- Local browser: 217 recipes, working search and new detail page, loaded images, correct product price/link, five product gallery images, and no horizontal overflow at 320 px.
- Owner changed the release stop condition: publish, check Vercel once, then leave. Do not wait or poll. Live acceptance and catalogue cache refresh remain pending unless that single check shows Ready.
