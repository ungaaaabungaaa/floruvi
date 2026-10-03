# Non-vegetarian recipes

## Owner request — 3 October 2026

Add 89 non-vegetarian recipes and a generated image for each dish. Preserve all 88 vegetarian recipes and their URLs. The full seed catalogue has 177 recipes.

| Group                 | Recipes |
| --------------------- | ------: |
| Chicken               |      25 |
| Fish                  |      20 |
| Prawns                |      16 |
| Mutton                |      15 |
| Eggs                  |      13 |
| Vegetarian, preserved |      88 |

## Implementation

- `convex/nonVegetarianRecipes.json` contains measured ingredients, steps, preparation and cooking times, servings, and crop links. The existing additive seed preserves owner edits.
- `src/assets/recipes/non-vegetarian` contains 89 separate WebP dish images and their prompts. Images use the existing illustrative serving caption.
- The homepage and recipe list feature three non-vegetarian dishes and one vegetarian dish when available. The session shuffle remains stable.
- Five protein categories are translated in all ten site dictionaries. Existing recipe translations remain unchanged. The new recipe text uses the supported English fallback until native-language translations are reviewed.
- Crop pages can link up to 24 direct recipes. The old limit of ten hid eight dishes after the expansion, including six older vegetarian recipes. The larger limit retains links to all 177 dishes without a second recommendation system.
- Cooking checks follow the [FoodSafety.gov temperature chart](https://www.foodsafety.gov/food-safety-charts/safe-minimum-internal-temperatures). These are original editorial recipes, not kitchen-tested recipes. Times are estimates. Use the cooking checks in each recipe.

## Image maintenance

Run `node scripts/prepare-non-vegetarian-recipe-images.mjs` after saving all dish images. This verifies the files and updates the static image map. It does not call an image provider or replace the older images.

## Verification and release

- Images: all 89 generated dishes passed visual review. All 89 WebP files are distinct and 960 × 960 pixels.
- Local checks: all 122 tests, lint, TypeScript and the Next.js Turbopack production build passed. The build generated 473 static pages.
- Development Convex: the seed added 89 recipes and preserved 88. A second seed added zero and preserved 177. A public query confirmed 177 published, unique recipe slugs and the five group counts above.
- Browser: the recipe list shows 177 dishes. All five protein filters return the expected counts. Keyboard filtering, search and a new detail link work. The detail image and its cooking check load. The homepage shows three non-vegetarian dishes and one vegetarian dish.
- Layout: desktop at 1280 px and English/Arabic at 320 px passed. The narrow pages have no horizontal overflow. The new recipe text falls back to English on the Arabic page, while the controls remain translated.
- Local cache: the first browser check showed the older 88 recipes from the one-hour fetch cache. The old local fetch cache was preserved in a temporary folder, and a fresh build then displayed 177. Refresh the catalogue cache when publishing seeded data.
- CI, production Convex, website deployment and live acceptance: not run in this task. Production data and website publication require a separate release.
