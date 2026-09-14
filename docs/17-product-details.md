# Product detail refresh

Owner reference: 15 September 2026. Keep this page review local until approved.

- Remove breadcrumbs. Use a large gallery with side thumbnails on desktop and a thumbnail row on phones.
- Preserve pack price, quantity, basket and business enquiry links.
- Add short product-specific flavour, preparation, storage and serving information for all 91 products. Store the new content in Convex with an additive seed that preserves owner edits.
- Separate culinary reasons from nutrition education. Do not publish organ-health promises, pesticide claims or measured nutrient values without evidence.
- Link existing recipes directly where they contain the product. Label compatible substitutions and serving ideas clearly.
- Generate six botanical banner assets, selected consistently by product. Use existing open-source Lucide SVG icons and shared product cards.
- Check catalogue coverage, recipe links, duplicate-free recommendations, responsive layout, gallery and basket controls.

Nutrition references: USDA MyPlate vegetable group; Penn State Extension, The ABCs of Microgreens; University of Minnesota Extension, Edible Flowers. Notes describe food groups and preparation, not laboratory results for Floruvi harvests.

## Review changes and local checks

All 91 development records are populated. Production is unchanged. The owner requested removal of image disclaimers across the storefront, five hero icons, a longer description, and no links or delivery note below the product basket button. Editorial banners now have no buttons; this rule is recorded in AGENTS.md.

The 24-test suite and Webpack production build passed. Desktop and 390px phone checks confirmed the gallery changes image, five recipe links, four related products and no horizontal overflow. A soft mobile banner overlay keeps text readable over the cropped photo. Nutrition education for selected foods uses NIH Office of Dietary Supplements fact sheets; food-group guidance is not measured harvest nutrition.

On approval, deploy Convex before the website and run `seed:productDetails` in production with its default arguments. This fills missing details and preserves existing records. The optional `refresh` argument is for deliberate editorial replacements only; it was used on the development records created during this review.

The next review expands every product to six points: flavour, uses, preparation, food pairings, a serving tip and storage. Pairings and tips use crop-specific or compatible food-family advice, with separate handling for live trays, wheatgrass and edible flowers. `seed:productDetailPoints` appends the two new points while preserving existing content. Development updated 91 products; a repeat updated zero. Coverage tests, lint, TypeScript and the local spinach page check passed. Production is unchanged.

## Approved publication

Owner approved commit, push and production seeding. Final hero has four icons. Direct recipe links no longer repeat “Made with this crop”; serving inspiration remains labelled. Production Convex deployed to `polished-mosquito-828`; 91 product detail records added and verified against seed content. All pre-existing production product fields were verified unchanged. The follow-up points seed updated zero records because the full seed already included them. Final checks: 24 tests, lint and Webpack production build passed; final caption-only edit passed lint. Website deployment remains a separate check after GitHub push.

## Next local hero review

The top block now follows the supplied desktop/mobile references: thumbnails below the image, purchase controls above the four icons, three compact recipe links and an existing Convex storage tip. Recipe gallery images link to their matching recipe. Breadcrumbs and stock badges remain absent; lower sections are unchanged.

Wishlist hearts and a header menu use browser local storage without accounts. The header count shares the basket badge style and updates on add/remove and cross-tab storage events. Browser checks confirmed 1 → 0 → 1, persistence after reload, the saved-product link, matching recipe-image links and no mobile overflow. Lint and TypeScript passed. These changes are local; checkout account sync is future work.

Owner approved publication of the hero and wishlist changes. Fixed the mobile storage-section overlap by replacing the hero grid's percentage row gap with 30px while preserving the 5% column gap. At 390px and 430px, the next section starts 35px below the storage card with no horizontal overflow.

Mobile follow-up: the existing product quantity and basket controls stay fixed at the bottom at phone widths, with safe-area padding and footer clearance. Verified visible before/after scrolling at 390px, fitting at 320px without overflow, and remaining inline on desktop. No duplicate basket controls or quantity state were added.
