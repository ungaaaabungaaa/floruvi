# Homepage chapters — 15 September 2026

## Owner request and design

Replace the homepage below the hero, using the owner's nutrition and vegetable references. Keep the six-slide hero and footer. Use short copy, warm paper backgrounds, large serif headings, real product links, and image-led sections.

The page now contains:

1. Nutrition introduction, botanical body artwork, adult fruit-and-vegetable guidance, and four nutrient benefit cards.
2. Five fresh vegetables with the shared product cards and purchase controls.
3. Fitness editorial with an adult athlete, cropped without a face, and food, movement, and rest copy.
4. Four nutrition-led links to carrots, spinach, bell peppers, and leafy greens.
5. Meal editorial and three working recipe links.
6. Single, Dual, and Family box links to the existing availability enquiry flow.
7. Closing shop and business enquiry links.

Editorial banners contain images and text only. The copy does not promise a particular body shape, cure, or medical-cost saving. Nutrition benefits describe a varied diet over time. The botanical silhouette is conceptual artwork, not an anatomy chart. The fitness picture is illustrative, not a customer result.

## Assets and implementation

Three new generated images and their exact prompts are in `src/assets/home-story/generation.json`. The approved hero asset set and footer were preserved. The rejected woman portrait is not used.

The page reuses the catalogue, recipe data, product cards, box definitions, and existing routes. Catalogue and recipe reads run in parallel. No package or backend contract was added.

The local image service stalled on browser-format requests for the three older recipe PNGs at desktop sizes. PNG responses succeeded while equivalent WebP-negotiated requests timed out. Converted these photos to WebP and updated the shared recipe-image mapping. Original PNG files remain available. The new recipe images load on desktop and mobile, including the recipe detail page.

The header now checks the scroll position after mount so that a refresh partway down the page applies its paper background.

## Nutrition sources

- [WHO healthy diet](https://www.who.int/news-room/fact-sheets/detail/healthy-diet): adult target of at least 400 g of fruit and vegetables, excluding potatoes and other starchy roots.
- [NIDDK food and constipation](https://www.niddk.nih.gov/health-information/digestive-diseases/constipation/eating-diet-nutrition): fibre and fluids.
- [NIH vitamin A](https://ods.od.nih.gov/factsheets/VitaminA-Consumer/): normal vision and provitamin A vegetables.
- [NIH vitamin C](https://ods.od.nih.gov/factsheets/VitaminC-Consumer/): immune function and collagen formation.
- [NIH folate](https://ods.od.nih.gov/factsheets/Folate-Consumer/): DNA and cell division.

These sources are linked beside the page's nutrition copy. No product-specific laboratory nutrient values are claimed.

## Local verification

- Lint and TypeScript passed.
- All 26 existing tests passed.
- Production compilation passed with `next build --webpack`.
- Browser checks covered desktop, 390 px, and 320 px layouts, with no horizontal overflow.
- Inspected each new section, image loading, and the unchanged footer. Confirmed all three recipe photos load on desktop and mobile after the format fix.
- Opened the salad recipe with the keyboard. The other new product, recipe, box, and contact destinations returned HTTP 200 in local checks.
- Reduced-motion rules disable the new hover transforms and transitions.

Confidence is high for the local page. These checks do not establish production deployment, provider readiness, medical outcomes, or conversion performance. The next useful check is owner review of the page in the local preview. Unrelated edits to checkout, basket, enquiry, and product details remain outside this change.
