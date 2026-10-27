# Honey and eggs — local review, 27 October 2026

## Owner decisions

Use three separate honey listings: raw honey, wildflower honey and single-flower honey. Each has one size control: 100 → 250 → 500 ml. Eggs use 1 → 2 → 3 → 4 dozen (12 → 24 → 36 → 48 eggs), stopping at 48 as confirmed by the owner. Use the existing flour control style. Increase each proposed honey price by exactly 75%. Keep this work local until the owner approves commit and merge.

## Start and approach

Task start: branch `main`, revision `6c86dfa`; no tracked edits. Existing untracked farm-plan, trademark-evidence and output folders belong to the owner and remain intact. Work branch: `codex/honey-eggs-local-preview`. No worktree is needed for this single local task. Architecture review is limited to the pack-size path across storage, basket validation and pricing; no database schema or provider change is planned.

Add one shared fixed-pack rule for honey and eggs. A basket line carries `packSize`, separate from pantry `weightGrams`, with quantity 1. Repeated Add/Update sets the selected total pack. The server validates the size and calculates its price from the server-owned product price. Reject unsupported sizes, mixed weight/pack lines and export use. Preserve existing pantry weight and legacy cart rules. Payment remains disabled for these new lines until backend/provider acceptance.

The review uses actual product, gallery, recipe and basket pages. An explicit `FLORUVI_PRODUCT_PREVIEW=1` flag works only in Next development. It supplies review records because both Convex deployments were disabled at the last read. It is not a production fallback. No database writes, paid orders, messages, commits or merges are authorised in this review.

## Prices

All values below are proposed net prices before GST and separately quoted delivery, not final tax-inclusive storefront offers. Product pages must say this clearly. Increase the prior net prices in integer paise once:

| Product | 100 ml | 250 ml | 500 ml |
| --- | ---: | ---: | ---: |
| Raw honey | ₹348.25 | ₹698.25 | ₹1,310.75 |
| Wildflower honey | ₹313.25 | ₹663.25 | ₹1,223.25 |
| Single-flower honey | ₹400.75 | ₹785.75 | ₹1,485.75 |

Egg review prices: ₹178 / 12, ₹356 / 24, ₹534 / 36, ₹712 / 48, using proportional pricing without an invented discount. These remain proposals. The owner requested a 75% rise for honey only. Actual margin remains unverified without supplier, packing, fees, waste and delivery costs. A 70% contribution target means cost ≤ 30% of net sales, not a 70% net-profit guarantee.

## Content and images

Explain that raw describes processing; wildflower means mixed floral sources; single-flower means a predominant named floral source. The claims can overlap. Supplier process, floral identity and actual packing must be confirmed before publication. Do not invent a named flower source, organic status or nutrition claims.

Reuse the nine corrected ml honey images as size/gallery views. Preserve the earlier six-egg draft, but use 12/24/36/48-egg images for this review. Add three short honey recipes with matching images. Link the existing egg recipes when their ingredient lists contain eggs. Keep recipe photos separate from pack-size choices. Do not change flour packaging or other proposed products in this slice.

## Acceptance

- The catalogue has three separate honey cards and one egg card.
- Plus/minus stops at each end and follows exactly each product’s allowed sizes.
- Selection changes price, pack label and matching product image.
- Add/Update preserves the chosen size in the basket and on reload; it does not duplicate or double it.
- Basket controls use the same allowed steps and the server returns the correct pack and total.
- Invalid/mixed/unknown/export pack requests are denied. Existing pantry tests still pass.
- Each product has multiple gallery images and matching recipe links.
- Check narrow mobile width, keyboard use, gallery selection and recipe navigation.
- Report local tests and browser evidence separately from CI, deployment and live acceptance.

## Publication items still needed

Owner approval; restored Convex deployments; guarded additive catalogue/recipe seed; Convex order validation for selected packs; tax classification and final inclusive prices; verified supplier claims and stock; egg cold-chain/transit testing; label and pack checks; export pricing/translations; CI and a separate live check. The development review does not establish these.

Owner follow-up: make product cards and their images taller, and tighten spacing around the name, pack size and price. Mango and lemon pickles, then oyster mushrooms, remain the next separate slice after this review.

## Approved release request

The owner approved commit, push and Vercel production deployment on 27 October 2026. The local-review strip must never appear in production. `localProductPreview()` requires both development mode and the explicit local flag; a production-mode test proves the flag cannot enable it. No production fallback to review data is permitted.

At the fresh production catalogue read, Convex still reported free-plan deployment disablement. Prepare the guarded `honeyEggs:seed` additive update and its tests, but report data sync and live publication as blocked until actual deploy/seed/readback succeeds. Do not replace databases or import development customer/auth data into production.

Safety copy checked against [CDC honey guidance](https://www.cdc.gov/infant-toddler-nutrition/foods-and-drinks/foods-and-drinks-to-avoid-or-limit.html) and [FDA egg guidance](https://www.fda.gov/media/82227/download). Recipe concepts have not been kitchen-tested.

## Release verification

159 tests, TypeScript and lint passed. All 13 selected-pack prices passed local HTTP readback; five forged/unsupported basket requests were rejected and local enquiry/payment routes stayed disabled. Browser checks confirmed size/image sync, keyboard stepping and basket persistence. The local catalogue and basket fit 320 CSS pixels with no page overflow at the observed state.

Convex accepted the production function deployment, but development and production execution remain disabled by the team’s free-plan limit. The additive seeds and catalogue reads therefore remain blocked. The production Next build failed during prerendering when Convex refused reads. The prior main revision also has a failed Vercel production build; the last successful deployment is older than main. Do not describe the new catalogue, database sync or website as live without fresh proof.
