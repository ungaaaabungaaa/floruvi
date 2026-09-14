# Site completion and checkout pages

Scope approved 14 September 2026: extend the reference design to the other pages, generate their assets, complete the public site through checkout, and generate an image for every product without one. Keep chat hidden.

## Work sequence

1. Generate ten category/editorial assets and individual images for the 79 crops without a matching image. Keep original sources and prompts in `src/assets`.
2. Add category photography, farm-story and business imagery, nutrition art, and delivery information. Complete FAQ and useful navigation links.
3. Build an account-free persistent basket. Store only crop slugs and quantities in browser storage. Validate restored data, bound quantities and line counts, and support removal and empty states.
4. Build contact, delivery, and final checkout review. Use server catalogue data to review the basket. Keep email/phone code choices on the final step only.
5. Until real prices, stock, delivery rules and provider accounts are supplied, mark prices as unconfirmed and keep payment/code sending disabled. Never invent a price, verification, order, or payment result. Allow a real availability enquiry through the existing private Convex ingestion boundary.
6. Test data bounds, stale/unpublished crops, form failures and successful enquiry persistence, plus desktop/mobile pages. Back up to GitHub and deploy to Vercel.

## Current service boundary

Local and production configuration currently contain Convex and enquiry-ingestion settings. No Resend, SMS, or Razorpay keys are configured locally. The owner has been asked for sale data and provider readiness. Page implementation continues independently.

A saved availability enquiry is not an order. A later purchase release must implement Better Auth, both code methods, server pricing and stock reservations, Razorpay signature/capture checks, verified receipts, and the agreed delivery/policy data. Do not make adding a key alone enable an incomplete payment path.

## Verification — 14 September 2026

- All 79 missing crop sources generated; the map covers all 85 catalogue crops. Ten new category/editorial sources and a transparent carrot PNG are stored with prompts.
- New delivery/FAQ pages, basket, three checkout steps, brand placements, metadata, and privacy text are included. Chat remains hidden.
- TypeScript, ESLint, 11 tests, and the production webpack build pass.
- Local HTTP check: all 113 sitemap/page/icon targets returned 200.
- Browser check: add a crop, change quantity, reload, complete contact and delivery, select phone-code preview, and send an availability enquiry. The success screen appeared and the basket cleared. A direct development database read confirmed exactly one matching synthetic enquiry with Spinach × 2. It is labelled as QA and requires no fulfilment.
- Mobile final checkout at 390 px had no horizontal overflow. Generated crops were inspected in category sheets; product and brand placements were checked in the browser.
- Real OTP delivery, payment, stock reservations, notifications, analytics, and automated Git deployments are outside the verified boundary. Provider setup and launch details are listed in document 10.
