# Free gifts at basket amounts — plan

Status: plan for owner approval, 28 September 2026. Nothing is built, and no images are generated yet (prompts are below). The owner will say when to add the gifts, at which amounts, and which items unlock them.

## Proposal

| Tier | Unlocks at (basket, before delivery) | Gift | Notes |
| --- | --- | --- | --- |
| 1 | ₹2,000 | **Floruvi recipe card** | Printed A6 card with one seasonal recipe and a QR code to its recipe page. Not a gift card or voucher. |
| 2 | ₹5,000 | **Small hemp tote bag** + the recipe card | Natural hemp tote with a small Floruvi carrot mark. Call it "recycled" only if the supplier certifies it (for example with a GRS certificate). |

**Use the amount, not the number of items.** A "5 items" rule can be met with the cheapest packs (five ₹53 packs of mustard greens total ₹265), so a gift that costs more than a few rupees would lose money. An amount keeps the gift cost a small share of the order.

Optional extras for later, if the owner wants a middle tier: a fresh herb bunch from the day's harvest (India only, perishable), or a printed storage guide for leafy greens.

## Rules for the build

- The server works out gifts from the reviewed basket subtotal, before delivery — never from a total the browser sends. Boxes count towards the amount.
- Gifts are not products. They do not appear in the shop, search, sitemap or `llms.txt`, and visitors cannot add or remove them. One of each unlocked gift per order, shown at ₹0.
- If the basket falls below an amount, that gift disappears automatically.
- Each gift has an in stock / out of stock switch in the admin panel, like products ("while stocks last").
- The order request lists the gifts (for example "Free gift: recipe card × 1") so the farm packs them; the admin order view shows them.
- India only at launch. Export orders are quoted after review, and gifts would add shipping and customs work.

## What shoppers see

- **Basket:** a slim progress line — "Add ₹450 more for a free recipe card", then "Free recipe card unlocked", then "Add ₹2,800 more for a free hemp bag".
- **Checkout summary:** gift lines at ₹0 with a small image.
- **FAQ:** "Do you have free gifts?" — "Orders over ₹2,000 (before delivery) get a free recipe card; over ₹5,000, a hemp tote as well. While stocks last."
- The cart pill stays as it is. All new text is translated into the nine other languages when built.

## Cost check (get quotes first)

No supplier prices are assumed here. Ask a local printer for 1,000 A6 cards on 350 gsm card, and 2–3 suppliers for small hemp totes with a one-colour print (typical minimum 100–500). Then check: gift cost ÷ unlock amount. For example, a ₹150 bag at ₹5,000 is 3% of the order before delivery.

## Images to generate

Save as `src/assets/gifts/recipe-card.webp` and `src/assets/gifts/hemp-tote.webp`, and record the prompts in `src/assets/gift-prompts.json`. The style matches `src/assets/product-prompts.json`. These are illustrations: replace them with real photos when the card and bag exist.

**Recipe card**

> Photorealistic-natural. Floruvi gift item catalogue photograph. Square composition, top-down view, a single A6 printed recipe card centred on warm ivory lightly textured limestone, with a few fresh basil leaves and one cherry tomato beside it. Cream textured card stock, a small forest-green carrot mark in one corner, neat soft-grey placeholder lines suggesting a short recipe with no legible words. Soft natural daylight, subtle contact shadows, generous margin around the subject. Match a refined farm-to-table editorial catalogue. No readable text, brand names, watermark, border or UI.

**Hemp tote bag**

> Photorealistic-natural. Floruvi gift item catalogue photograph. Square composition, three-quarter view, a small natural undyed hemp tote bag (about 30 × 35 cm) with short handles standing on warm ivory lightly textured limestone, a bunch of fresh leafy greens showing at the top. Visible coarse hemp weave in natural beige-grey, a small forest-green carrot mark printed near the lower corner. Soft natural daylight, subtle contact shadows, generous margin around the subject. Match a refined farm-to-table editorial catalogue. No readable text, watermark, border or UI.

## Build outline (after approval, about one day)

1. Convex: a small gifts setting (name, unlock amount in INR paise, in stock) with admin switches.
2. `lib/pricing.ts`: the basket review returns unlocked gifts and the amount to the next one (India only).
3. Basket progress line, checkout lines, order-request text, admin order view, FAQ entry, translations.
4. Tests: ₹1,999 vs ₹2,000 edges, delivery excluded, boxes counted, export gets none, out-of-stock gift skipped.

## Decisions needed

1. Confirm ₹2,000 and ₹5,000, before delivery.
2. Amount only (recommended), or also a number of items.
3. Box orders: gift on the first delivery only, or on every delivery?
4. India only at launch?
5. Recipe card: one fixed recipe, or one matched to the basket?
6. Bag supplier, size, and whether it is certified recycled.
