# Storefront refresh — 14 September 2026

Owner decisions: offer all catalogue products across India, with no PIN-code restriction. Keep the existing payment and OTP setup gates until the providers are connected.

## Changes

- Use the shared ProductCard on home, catalogue, categories and related-product rows. Remove crop badges and category captions. Show each crop's additional photo on hover and keyboard focus; show it as a selectable product-gallery thumbnail on touch devices.
- Use the same width and proportions for the three home feature blocks. Add two related-product rows and a four-recipe row.
- Remove the price-only checkbox and its filtering behaviour. Preserve fuzzy search, category filters, sort, clear and URL state.
- Remove the planning-stock disclaimer. Show India-wide delivery.
- Each box contains butterhead lettuce, spinach, cherry tomatoes, cucumber, carrot and mint. Single includes one current retail pack of each, Dual two and Family four. Prices use the live Convex pack prices plus one delivery fee per box. The delivery schedule changes frequency, not contents or per-delivery price. No recurring payment is started.

## Image workflow

Built-in image generation produces one additional photograph for each of the 85 crop slugs. Prompt template: “One square photorealistic editorial food photograph for Floruvi. Subject exclusively [crop name] in its harvested edible form, botanically accurate cultivar, close three-quarter view on a shallow ivory ceramic plate on pale warm limestone. Natural soft side light, realistic surface texture, restrained cream and green palette with natural crop colours. No other crops, no people, no text, logo or packaging. Not a collage. Alternative closeup product gallery photograph, not overhead.”

The butterhead image uses an ivory bowl with the same lighting and materials. Originals remain in the Codex generated-images directory. Optimized images belong in `src/assets/products/gallery/`; `lib/product-gallery-images.ts` maps the files to crop slugs. These are illustrations, not evidence of a specific harvest.

All 85 additional images are connected and visually reviewed. The optimized WebP set totals 9.2 MB; original PNG files stay local and are excluded from Git and deployment.

Local checks passed: lint, TypeScript, all 17 tests, and production build. Browser checks covered equal desktop story dimensions (1216 × 420), the related rows, typo search, filter reset, three box prices, mobile overflow, and selecting an alternate product image. Production seed preserved 85 crops and 65 prices, then added five verified prices. The development seed also added the same five prices.

## Additional verified prices

Exa page reads and direct retailer variant data supplied five additional benchmarks. Apply the existing 40% markup. Variant data takes precedence over stale search snippets.

| Crop | Pack | Retail | Floruvi | Source |
| --- | --- | --- | --- | --- |
| baby-kale | 250 g | ₹437 | ₹611.8 | [Sowfresh](https://www.sowfresh.in/products/baby-kale) |
| mustard-greens | 200 g | ₹38 | ₹53.2 | [Healthy Buddha](https://healthybuddha.in/mustard-greens) |
| lollo-bionda-lettuce | 200 g | ₹50 | ₹70 | [Shreenath Agro](https://shreenathagro.com/product/lettuce-simpsons-butterhead/) |
| red-cabbage-microgreens | 50 g | ₹179 | ₹250.6 | [Nutriofarms](https://nutriofarms.com/product/red-cabbage-microgreens/) |
| kale-microgreens | 50 g | ₹179 | ₹250.6 | [Nutriofarms](https://nutriofarms.com/product/kale-microgreens/) |

The other 15 products remain price-on-request because searches returned seeds, dried herbs, wholesale offers, or no reliable matching retail pack. No substitute benchmark was invented.

Update: the remaining price gaps were filled and six live trays added. See [current launch pricing](15-live-trays-and-pricing.md).
