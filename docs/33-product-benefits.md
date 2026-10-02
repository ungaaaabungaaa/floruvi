# Product descriptions and food benefits

Owner request: 2 October 2026. Expand all 91 product descriptions and add useful food benefits. Include digestion and weight management where evidence supports them. Keep the basket reminder quiet.

## Editorial choices

- Each description now combines the crop's flavour, food pairings and serving advice. Existing preparation, storage and recipes remain.
- Whole vegetables include fibre and regular bowel movements, gradual fibre intake, and enough water. This is general food education. It does not diagnose a gut problem.
- Weight guidance explains a substitution: use vegetables in place of some foods with more calories. It also names portions, dressing and the whole diet. Each vegetable note includes its own preparation step.
- Strawberries and muskmelon explain whole fruit versus juice and replacing a richer dessert.
- Potato has a separate starchy-food portion note. It does not use the generic weight-loss swap.
- Herbs, ginger, turmeric, chillies, spring onions and sorrel describe flavour with less added salt. Their normal seasoning portions supply little fibre.
- Microgreens, live trays and flowers remain small additions to a meal. Do not infer a nutrient level from the mature crop. Wheatgrass has no meal-replacement claim.
- Existing crop-specific nutrient education remains: carrot beta-carotene; spinach vitamin K, provitamin A, folate and potassium; kale vitamin K; tomato, pepper and strawberry vitamin C. These are food references, not measured values for Floruvi produce.
- The basket says “A small investment in everyday health”. It encourages varied plant foods. It does not promise fewer doctor visits, disease prevention, a treatment or a weight-loss result.

All ten current language versions have matching descriptions, benefits and basket text. New wording follows the same limits in each language. Native-speaker review is still part of the existing pre-advertising process.

## Evidence checked on 2 October 2026

| Source | What it supports | Limit in the copy |
| --- | --- | --- |
| [NIDDK: Eating, diet and nutrition for constipation](https://www.niddk.nih.gov/health-information/digestive-diseases/constipation/eating-diet-nutrition) | Dietary fibre, gradual increases and adequate liquids support bowel regularity. | No claim that a particular vegetable treats a gut condition. No fixed daily fibre or fluid prescription. |
| [CDC: Vegetables and fruits for healthy weight](https://www.cdc.gov/healthy-weight-growth/healthy-eating/fruits-vegetables.html) | Replacing calorie-dense ingredients can reduce meal energy. Portions and preparation count. Whole fruit retains fibre. | No automatic weight loss from buying or adding a product. The preparation steps are culinary suggestions. |
| [NIH NHLBI: Use herbs and spices instead of salt](https://www.nhlbi.nih.gov/resources/use-herbs-and-spices-instead-salt-fact-sheet) | Herbs and spices can add flavour without more salt. | A food-use suggestion, not a medicinal herb claim. |
| [Penn State: Mineral differences among microgreens](https://www.psu.edu/news/research/story/select-microgreens-custom-diet-may-help-deliver-desired-nutrients) | Nutrient composition varies by species. | No guaranteed nutrient density, supplement equivalence, or mature-crop extrapolation. |
| [University of Minnesota Extension: Edible flowers and late-summer herbs](https://extension.umn.edu/about/our-stories/news/yard-and-garden-news/edible-flowers-and-late-summer-herbs) | Correct identification, food-safe growing and culinary use. | Small, occasional garnish only; no digestive or weight claim. |
| [NCCIH: Turmeric](https://www.nccih.nih.gov/health/turmeric) | Evidence for clinical effects is uncertain and supplement evidence has limits. | Fresh turmeric remains a culinary ingredient. No inflammation, blood sugar or treatment claim. |
| [NIH Office of Dietary Supplements](https://ods.od.nih.gov/factsheets/list-VitaminsMinerals/) | Existing explanations of the roles of vitamins and minerals. | Retained education is not a nutrition label or a harvest analysis. |

Product pages link the relevant food guide, plus the NIDDK and CDC guidance for whole vegetables and fruit. Seasonings also link the NHLBI guide.

## Storage and guarded update

Convex remains the source of product content. The website does not override stored product descriptions with a local fallback. The checked-in catalogue and translation snapshots define this editorial revision for new records and local validation.

For an existing catalogue, use the authenticated internal mutation:

1. Deploy the Convex code to the intended deployment.
2. Run `pnpm exec convex run seed:productWellness '{"dryRun":true}'` against that deployment.
3. Review `changed`, `unchanged` and `skipped`. Each skipped entry gives a slug and reason.
4. Run the same mutation with `{"dryRun":false}` to apply the reviewed update.
5. Repeat the dry run. Updated products should appear in `unchanged`.

The default is `dryRun: true`. Add `--prod` only when production publication is authorized. Do not use `seed:productDetails` with `refresh: true` for this revision.

A product updates only if its English text matches the recorded baseline and all nine stored translations match that source and shape. Each update appends to the stored translations, preserving their wording. Missing or stale translations cause the entire product to be skipped. The mutation writes English and translations in one transaction. Prices, images, stock, publication, growing notes, nutrient source URLs and owner edits stay intact.

The content guard is in `convex/productWellnessBaseline.json`. Tests cover all 91 before/after records, translation completeness, owner-copy preservation, stale-translation refusal and repeat runs.

## Development checks

The existing development deployment `efficient-toad-585` received this revision on 2 October 2026. The dry run proposed 91 updates and skipped zero products. Applying the update changed all 91. A second dry run returned zero changes and 91 unchanged products. All 73 tests pass after merging the SEO revision `1cb685e`. Product and basket pages fit a 320 px viewport. The basket reminder is below the checkout control.

## Production content checks

On 2 October 2026, the Convex deploy completed on `polished-mosquito-828` with TypeScript and schema validation enabled. No indexes were deleted. The guarded preview proposed 91 updates and skipped zero products. The applied update changed all 91; the repeat preview returned zero changes, 91 unchanged and zero skipped.

The public catalogue returned all 91 products in each of the ten languages. All 910 descriptions match the reviewed snapshots, and all non-English records remain translated. Public nutrition rows also match for carrot, potato, sweet basil, radish microgreens and borage flowers. These cover the vegetable, starch, seasoning, microgreen and flower rules. The website release for the basket reminder and full image set is tracked in `docs/34-product-images.md`.
