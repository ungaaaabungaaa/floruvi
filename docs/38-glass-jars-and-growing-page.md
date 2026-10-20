# Glass jars and growing-page update — 20 October 2026

The owner approved 11 individual glass-jar product photos, including the printed lid strip. Each product keeps its existing pack size, price, description, use and storage instructions. Descriptions were reviewed: they contain no pouch wording or unverified health, organic or shelf-life claims. The 18 October price table in document 37 remains current; its five-image pouch gallery is superseded by one approved jar image per product.

## Storefront changes

- Replace all 11 pantry main images and remove the 44 old supporting gallery assets.
- Add three rotating jar banners and an 11-product pantry rail to the homepage. Controls sit outside the editorial image. Rotation stops for reduced motion, keyboard focus, hover and hidden pages.
- Replace the homepage category-link strip with the existing green growing-notebook section, shared without copy changes.
- Add two hydroponic lessons: water and nutrients, and seedling support. Add four fresh products in one row before the growing-page footer.
- Add “How?” beside “Let’s talk”. Use white header icons and white/green floating controls on the growing page.
- Use “Floruvi Support” and “Customer support” for chat labels. Preserve the owner's chat setting.

Hydroponic educational sources: [Oklahoma State Extension](https://extension.okstate.edu/fact-sheets/electrical-conductivity-and-ph-guide-for-hydroponics) and [University of Minnesota Extension](https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/small-scale-hydroponics). Generated illustration provenance is stored beside the optimized assets.

## Data migration

`scripts/replace-pantry-images.mjs` saves a local backup, uploads all 11 WebP images, then calls an internal owner-only mutation. The mutation compares prior image URLs before changing records, updates all 11 together, and deletes only old files no product still uses. Readback verifies exact image hashes and preservation of all other public product fields, categories and commerce settings. A repeat run with matching images performs no writes.

Do not copy customer, order or payment records between environments. Refresh the Vercel `catalogue` cache tag after production image replacement.

## Dependencies and validation

Next.js and its lint configuration are updated to 16.4.2; React and React DOM to 19.3.1. Compatible dependency updates refresh the lockfile. The critical advisory is resolved. One high advisory remains in the development lint chain (`braces`, GHSA-vfj7-8cjw-p6xm); the registry lists no patched version.

Local checks: 145 tests pass, TypeScript and lint pass, and `next build --webpack` passes. Local Turbopack could not create its helper port in the execution sandbox. Browser review covers the jar showcase, the two hydroponic sections, four white product cards, white navigation, and the floating white cart control. Production deployment and public data verification are separate release checks.

Responsive review: homepage at 320, 390, 768, 1024 and 1440 px; growing, shop, product detail, boxes, recipes, basket, wishlist, checkout, contact, FAQ and privacy at 320/768/1024 px; category, recipe detail, shipping, terms, refunds and Arabic/German/Japanese homepages at 320 px. No page-level horizontal overflow was found. The shared bottom notebook now uses one text column through 800 px, smaller fluid headings and less vertical padding. Product rails scroll within their section. Review covered public templates, not every catalogue item or private admin screen.
