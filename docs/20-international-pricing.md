# International prices

16 September 2026. The owner chose prices for 16 export countries based on **local retail price + 40%**. India prices do not change.

## Decisions

- Each export country shows prices in its own currency. The server calculates them. The browser never sends a price.
- Delivery outside India is **quoted after review**. International baskets show a total before delivery.
- Box prices use the same rules. A box costs the sum of its contents in that country.
- Amounts are integer minor units (ISO 4217). KWD, OMR, BHD and IQD use 3 decimals. JPY uses none.

## Method

1. Research agents collected current prices for 21 benchmark crops in each country from online grocery shops. Every price has a URL, the listed pack and the date. See [research](market-pricing/research/).
2. A manual review checked all 303 prices. Ten were excluded and four sale prices were replaced by the stated regular price. Every change has a reason in [adjustments.json](market-pricing/adjustments.json). Listings sold by count without a weight (for example a punnet of cress) could not be compared, which leaves 269 usable prices.
3. Each remaining price becomes a ratio: local price ÷ Indian retail benchmark price, for the same crop, per gram or per piece.
4. Per country, the **produce rate** is the median ratio of vegetables, fruiting crops, roots and microgreens. **Herbs** get their own median rate when a country has at least three herb prices. Herb prices differ most between India and export markets.
5. A crop that was observed directly uses the median of its own ratios. The result is limited to half to double its group rate, so one unusual listing cannot distort the price.
6. Edible flowers had no weight-based listings. They use the produce rate.
7. Price = Indian retail benchmark × rate × **1.40**, rounded **up** to a clean local step. Rounding up keeps the markup at 40% or more.

The script is [build-market-prices.ts](../scripts/pricing/build-market-prices.ts). It writes [price-table.json](../lib/markets/price-table.json) and the full sheet of 1,456 prices, [prices.csv](market-pricing/prices.csv). At runtime, `lib/markets/prices.ts` multiplies the Convex INR price by the stored rate. If the owner changes an INR price, the export prices follow it. A new product in an existing category uses the category rate.

Rounding steps: AED, SAR and QAR 0.25; KWD, OMR and BHD 0.050; IQD 250; EUR and GBP 0.05; JPY 10; NPR and BDT 5; MYR 0.10; LKR 10; UZS 500.

## Sample prices

| Country | Currency | Prices used | Butterhead lettuce, 1 head | Spinach, 250 g | Cherry tomatoes, 250 g | Sweet basil, 100 g | Radish microgreens, 50 g | Live microgreen tray |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| India (reference) | INR | — | 105 | 105 | 154 | 140 | 280 | 182 |
| UAE | AED | 22 | 11.25 | 17.50 | 17.00 | 8.50 | 35.00 | 15.25 |
| Saudi Arabia | SAR | 14 | 5.50 | 11.00 | 11.50 | 28.50 | 14.50 | 9.50 |
| Qatar | QAR | 25 | 5.25 | 10.50 | 15.25 | 31.00 | 13.75 | 9.00 |
| Kuwait | KWD | 15 | 0.600 | 0.600 | 1.150 | 1.900 | 1.600 | 1.050 |
| Oman | OMR | 13 | 0.650 | 1.300 | 1.900 | 1.700 | 1.700 | 1.100 |
| Bahrain | BHD | 15 | 0.600 | 0.300 | 0.850 | 1.750 | 1.550 | 1.000 |
| Iraq | IQD | 16 | 1,250 | 1,250 | 1,500 | 1,500 | 2,750 | 2,000 |
| Germany | EUR | 15 | 3.15 | 4.50 | 4.90 | 3.00 | 6.00 | 1.95 |
| Netherlands | EUR | 22 | 3.40 | 3.40 | 3.10 | 7.65 | 4.55 | 2.95 |
| Japan | JPY | 12 | 360 | 880 | 530 | 2,590 | 1,900 | 1,240 |
| United Kingdom | GBP | 20 | 1.20 | 1.85 | 1.20 | 3.30 | 4.85 | 0.80 |
| Nepal | NPR | 19 | 150 | 140 | 135 | 385 | 250 | 160 |
| Bangladesh | BDT | 10 | 140 | 50 | 105 | 95 | 375 | 125 |
| Malaysia | MYR | 16 | 10.40 | 15.70 | 5.80 | 16.60 | 20.90 | 13.60 |
| Sri Lanka | LKR | 16 | 610 | 180 | 480 | 680 | 810 | 530 |
| Uzbekistan | UZS | 19 | 44,000 | 44,000 | 28,000 | 28,000 | 58,500 | 48,000 |

## Confidence and limits

- These are launch prices from public listings, not quotes from Floruvi buyers or importers. They do not include freight, duty, import permits or phytosanitary costs.
- Thin data: Bangladesh (10 prices), Oman (13), Saudi Arabia (14), Kuwait (15), Iraq (16), Germany (15). Germany had only one herb price, so herbs use the produce rate there.
- Japan prices come from Rakuten Ichiba shops, because net supermarkets were not reachable. Listings with delivery included were excluded.
- Several Gulf herb listings were bunches without a stated weight. The study assumes 75 g per herb bunch. Basil in Saudi Arabia and Qatar is the most sensitive to this assumption.
- Most retailers blocked automated reading. Some prices came from search-result text; each record marks this as `search-snippet`.
- Live microgreen trays and edible flowers may face import rules in some countries. Confirm export eligibility before accepting orders.

## Update

1. Replace or add research files with the same JSON shape.
2. Record exclusions in `adjustments.json`.
3. Run `node --import tsx scripts/pricing/build-market-prices.ts`, then `pnpm test`.
4. Change the revision in the script when the method or data changes.
