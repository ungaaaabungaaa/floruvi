# Retail pricing and delivery

Research date: 14 September 2026. Method: Exa search, page reads, and retailer product-variant feeds. This is a premium retail benchmark sample, not a statistical city average. Markets checked: Delhi NCR, Mumbai, Bengaluru, Chennai, and Hyderabad.

## Decisions

- Floruvi product price = comparable retail pack price × 1.40, rounded to the nearest paise. This is a 40% markup, not a 40% margin. No extra psychological rounding.
- Prefer hydroponic retail for the main hydroponic crops. Use premium specialist or organic retail for other crops. Match the crop and stated pack; do not substitute seeds, dried herbs, wholesale crates, or mixed flowers for an individual fresh crop.
- Use the selected variant's listed selling price. Exclude crossed-out MRP, new-user codes, basket discounts, and wholesale offers. Retailer variant feeds take precedence over older search snippets.
- Flat delivery: ₹99 for each delivery, with no free-delivery threshold. This is a Floruvi launch policy selected from local retail delivery references, not a courier quote. Owner confirmed delivery across India with no PIN-code restriction. Repeated box deliveries incur the fee each time; box billing is not active.
- Each displayed price is for the pack shown. A weight range or bunch remains a range or bunch; do not imply a fixed weight. The reference cultivar/colour is recorded in the sheet for packing review.
- Unmatched crops remain price-on-request. A partly priced basket has no complete total. Box contents are not yet defined, so box prices remain on request.
- Existing stock and availability stay unchanged. Listed prices do not activate payment or reserve produce. Some specialist benchmarks are currently sold out; these remain identified in the sheet and need a price recheck before sales open.

## Sources

The machine-readable [pricing sheet](pricing-benchmarks.csv) records each selected product, pack, retailer, city, source URL, source availability, retail price, and Floruvi price. The seed input is `convex/pricingData.ts`.

- [OnlyHydroponics Delhi](https://onlyhydroponics.in/collections/all) and [Bengaluru](https://www.blr.onlyhydroponics.in/collections/all): hydroponic pack comparisons.
- [Trikaya](https://trikaya.net/collections/vegetables): specialist vegetables and fresh herbs, serving Mumbai and Bengaluru.
- [Kedia Organic](https://www.kediaorganic.com/collections/farm-fresh): Mumbai fresh vegetables, named pack sizes and bunch weight ranges.
- [Green Goblin](https://green-goblin.in/): Chennai specialist produce and microgreens. Some single-variety microgreens are sold out; a listed price is not proof of current supply.
- [Yodeli green oakleaf](https://yodeli.in/products/truganic-organic-green-leafy-vegetables-hydroponic-oakleaf-lettuce): ₹80 for 75 g in Mumbai.
- [Greend delivery](https://greendindia.com/pages/doorstep-delivery): ₹85 for orders ₹100–599 within 20 km, ₹100 for orders ₹399–999 within 30 km, and ₹120 for orders ₹499–1199 beyond 30 km. Their order thresholds and free-delivery rules differ from Floruvi's flat policy.

## Checks and limits

Search covered 152 requested result slots, with repeats and unsuitable results. A result slot is not a verified unique source. Retailer product feeds were then read through Exa to resolve pack variants and stale prices. BageechaBox's new fresh microgreen pages show prices but omit pack sizes; those prices were not assigned to unspecified packs. Wholesale, seed, dried-product, overseas, and unclear mixed-flower results were rejected.

Confirm the first delivery city/postcodes, actual harvest list, pack fulfilment, box contents, tax treatment, and delivery operating cost before accepting payment. No retailer certification, delivery promise, or health claim transfers to Floruvi.

## Apply safely

Deploy Convex functions, run `seed:catalogue`, then `seed:pricing` in development and with `--prod`. The pricing seed fills absent prices only and preserves existing owner prices. It aborts for missing crop slugs. Repeat runs must make no changes. Edit prices in the Convex dashboard for future owner overrides; do not silently resynchronise competitor prices.

Keep provider activation separate. Checkout totals come from the server's Convex read. Browser prices and totals are rejected.

## Prices still needed

Lollo bionda lettuce, baby kale, tatsoi, mizuna, mustard greens, watercress, lemon balm, chervil, red cabbage microgreens, kale microgreens, beet microgreens, coriander microgreens, fenugreek microgreens, kohlrabi microgreens, garden cress microgreens, beefsteak tomatoes, viola flowers, pansy flowers, calendula petals, and borage flowers.

These 20 remain enquiry-only with no numeric price. Their generic cousins, mixed packs, seed prices, or overseas prices were not treated as exact matches.

## Verification — 14 September 2026

- Development and production each returned 85 crops, 6 categories, 65 priced crops, and ₹99 delivery.
- In each environment, the first pricing seed added 65 prices and the delivery setting. The repeat seed added zero and preserved all 65 values.
- All 15 tests passed. Type checking, lint, and the local production build passed.
- The real review endpoint returned ₹277.20 produce + ₹99 delivery = ₹376.20 for two 100 g curly kale packs. Payment and code verification stayed disabled.
- Browser checks confirmed the same total in the basket and checkout, and no horizontal overflow at 390 px for the basket and catalogue.
- Provider payments, stock reservation, tax treatment, actual delivery cost, and the 20 unmatched crops are outside this verified slice.

## Storefront refresh update

Five additional verified benchmarks bring the priced catalogue to 70 of 85 products. See [the refresh record](13-storefront-refresh.md) and the updated CSV. The seed preserves all 65 earlier prices.
