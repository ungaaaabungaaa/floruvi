# Pantry weights and inclusive prices — 20 October 2026

## Owner decision

Use one weight control for all 11 pantry products in the India store. Steps are 250 g, 500 g, 1 kg, then 500 g steps through 3 kg, then 1 kg steps. The numeric validation limit is 999 kg. The 250 g and 500 g choices use glass jars. Larger weights say “Bulk”. There is no separate jar count. Adding the product sets its total selected weight in the basket; a second click does not double it.

Show “Inclusive of GST and taxes”. Remove “estimated” and “bulk packet”. Keep existing photos. Product descriptions contain the food description without a repeated fixed pack size or price. Export stores retain their existing pack controls and market pricing rules. India weight lines cannot be checked out after switching to an export market; remove them and choose the export pack.

## Price basis and tax evidence

The owner asked to add applicable taxes to the prices supplied on 18 October. Those prices are treated as the base price before the new tax adjustment. Larger weights use a proportional price; no separate jar fee or bulk discount was supplied. Round to whole paise once at the selected weight, not from a rounded 250 g price. No second tax is added at checkout. Delivery remains separately displayed.

Verified against the Gazette and CBIC on 20 October 2026:

- [Notification 10/2025, official Gazette](https://egazette.gov.in/WriteReadData/2025/266210.pdf): Schedule entry 38 exempts HSN 0712 plain dried vegetables, including powder, not further prepared. Apply to plain onion powder/flakes, garlic, tomato, beetroot, carrot and spinach. This classification assumes single-ingredient dried vegetables, without further preparation or additives. Fresh vegetables are exempt by product classification, not by the use of banana-leaf wrapping.
- [Notification 9/2025 Integrated Tax (Rate), CBIC-hosted copy](https://courier.cbic.gov.in/ECCS/advisory/2025/NOTIFICATION%20NO.%209_2025-INTEGRATED%20TAX%20(RATE)%20-1759486719.pdf): Schedule I is 5%. Entry 42 covers dried ginger and turmeric under 0910; entry 56 covers pre-packaged and labelled Chapter 8 fruit flour under 1106. Apply 5% to banana flour, ginger powder and turmeric powder.
- The exemption notification defines pre-packaged and labelled retail goods as packs of not more than 25 kg/25 litres. Banana flour above 25 kg in **one bulk pack** uses its base price without the 5% uplift. Several smaller retail packs are not this exemption. The owner specified one larger packet for bulk orders; fulfilment must preserve that pack basis.
- Moringa: classification remains unconfirmed. The owner has no supplier HSN and explicitly asked to leave it. Preserve ₹599 per 250 g; do not assign an HSN or claim a confirmed exemption. Resolve this before tax invoicing. Payments remain subject to the existing provider/owner gates.

| Product | 250 g total | 500 g total | Treatment |
| --- | ---: | ---: | --- |
| Green banana flour | ₹393.23 | ₹786.45 | 5% |
| Onion powder | ₹329.00 | ₹658.00 | Exempt, plain dried vegetable |
| Onion flakes | ₹329.00 | ₹658.00 | Exempt, plain dried vegetable |
| Garlic powder | ₹436.25 | ₹872.50 | Exempt, plain dried vegetable |
| Ginger powder | ₹450.45 | ₹900.90 | 5% |
| Turmeric powder | ₹277.73 | ₹555.45 | 5% |
| Moringa leaf powder | ₹599.00 | ₹1,198.00 | Existing price retained; HSN pending |
| Tomato powder | ₹598.75 | ₹1,197.50 | Exempt, plain dried vegetable |
| Beetroot powder | ₹849.00 | ₹1,698.00 | Exempt, plain dried vegetable |
| Carrot powder | ₹559.00 | ₹1,118.00 | Exempt, plain dried vegetable |
| Spinach powder | ₹629.00 | ₹1,258.00 | Exempt, plain dried vegetable |

## Data and release

`dehydrated:updatePricing` is an internal maintenance mutation. It requires an audit of all 11 products, compares current prices and descriptions, and updates the batch atomically. Its revision guard prevents applying tax twice and rejects later owner edits. Only prices, descriptions and the price revision change. Existing images, stock, details, customer records, orders and payment records are preserved.

Stored prices retain their original pack basis for old baskets. The public India catalogue displays 250 g prices and supplies the original price basis for the weight calculation. Weighted basket lines carry `weightGrams` and quantity 1. The checkout-review route and order creation calculate the same total from server-owned product data. Saved orders retain the selected weight and pack type in `packLabel`. Availability enquiries also contain that weight.

Development public reads bypass the catalogue cache to show current edits. Production still caches public reads, and needs the `catalogue` tag invalidated after the data change. Deployment and public readback are separate from tests.
