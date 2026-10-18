# Flours and powders — 18 October 2026

Owner request: list the 11 supplied products separately, with five images per product, individual pack prices in the description, and the same seed in development and production. Do not list a combined set. No sample, mockup or preview wording belongs on the products.

## Approved prices

| Product | Pack | India price |
| --- | --- | --- |
| Green banana flour | 500 g | ₹749 |
| Onion powder | 250 g | ₹329 |
| Onion flakes | 250 g | ₹329 |
| Garlic powder | 200 g | ₹349 |
| Ginger powder | 250 g | ₹429 |
| Turmeric powder | 500 g | ₹529 |
| Moringa leaf powder | 250 g | ₹599 |
| Tomato powder | 200 g | ₹479 |
| Beetroot powder | 250 g | ₹849 |
| Carrot powder | 250 g | ₹559 |
| Spinach powder | 250 g | ₹629 |

The shared onion price applies to each separate form. Pack counts, cost and profit from the pricing reference are not confirmed stock and are not public listing data. Export prices require reviewed benchmarks; do not invent a category conversion rate.

## Work checkpoint

- The five banana flour images are complete.
- The other 50 images are generating in four concurrent workers through built-in image_gen.
- Images preserve the owner's botanical ribbon design. Correct pack sizes replace the original 250 g labels where needed.
- Each product has a main pouch view, pouch detail, ingredient view, texture view and overhead preparation view.
- New seed: convex/dehydrated.ts. Product content: convex/dehydratedData.ts.
- Seed tests verify prices, separate onion forms, repeatability and preservation of owner edits.
- Production baseline: 91 products and six categories. No seed has run yet.
- Existing untracked output/ and docs/farm-plan/2026-10-12-profit-plan/ belong to prior work. Preserve them.
- Next: finish and inspect all images, prepare WebP files and import map, run checks, deploy Convex, seed both databases, deploy website, verify production pages and galleries.

No payment, OTP, chat, stock or commerce settings change is part of this work.

## Verified database and local results

All 55 images were generated with built-in image_gen, visually checked and saved as distinct WebP files (15,017,538 bytes total). The original PNG files remain local and are excluded from Git and deployment. The 22 pouch views have the correct product names and pack sizes; none has sample wording. The 33 ingredient views match their product forms.

Development and production each added 11 products, preserved all 91 existing product records, preserved the six existing categories and commerce settings, and reached 102 products. A repeat seed added zero products in each database. All 11 stored main image URLs returned WebP images successfully in each database. Local verification reports are in ignored backups/dehydrated-2026-10-18/.

Local checks: 141 tests passed, lint passed, TypeScript passed, and the production build passed. The category page shows all 11 individual prices and pack sizes. The banana flour gallery has five loaded images; the fifth image can be selected, keyboard selection works, and the page fits 320 px without horizontal overflow. Pantry pages omit the shared fresh crop banner, crop nutrition links and unrelated recipe suggestions. Fresh crop pages retain these sections.

Website publication and live acceptance are the remaining checks.
