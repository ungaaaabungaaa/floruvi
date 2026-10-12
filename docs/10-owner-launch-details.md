# Details needed to open online ordering

The public pages, images, basket, and checkout screens are built. The basket sends a private availability enquiry to Convex. No payment or customer account is created yet.

## 1. Products for the first sale

Research-based prices and pack sizes are set for 65 crops, with ₹99 flat delivery. See [the pricing sheet](pricing-benchmarks.csv). Confirm that you can supply those packs. The remaining 20 crops need prices.

Send a short list of the crops you can supply now. The full 85-crop catalogue is a growing reference, not live stock.

| Crop | Pack size / unit | Price | Stock or weekly capacity | Harvest days |
| --- | --- | --- | --- | --- |
| Your crop | e.g. 100 g | Your price | Your quantity | Your days |

Confirm currency, whether prices include tax, business tax details where applicable, and any B2B minimum quantity. We will use these values on the server for stock and payment checks.

For each subscription box, also confirm contents or weight, price per delivery, substitutions, start date rules, pause/cancellation rules, and whether billing is per delivery or prepaid.

## 2. Delivery rules

- Cities and postal codes served.
- Check the ₹99 flat fee against your delivery cost. There is no free-delivery threshold. Confirm any minimum order.
- Delivery days, order cut-off time, and expected lead time.
- Pickup option and address, if offered.
- Rules for cancellations, refunds, unavailable items, and damaged produce.

## 3. Business and website details

- Trading name and legal business name.
- Business address, public support email, and phone / WhatsApp number.
- Final domain and preferred social links.
- Real farm photos and a short farm story when available. Current images are generated illustrations.
- Who receives enquiries and how long enquiry records should be kept.

## 4. Service access

Add keys through the service dashboard or private environment settings. Do not paste secrets into chat or Git.

| Service | Needed before activation |
| --- | --- |
| Resend | Verified sending domain, sender address, and private API key |
| Phone codes | SMS provider choice and account; sender/template approval required by that provider for the destination countries |
| Razorpay | Account activation, test keys first, live keys later, and webhook secret |
| Vercel | Domain configuration; connect the GitHub account for automatic deploys if desired |
| PostHog | Project choice, public project key/host, approved events and privacy settings |
| Push notifications | Confirm whether launch needs them; provider account if enabled |

Both email and phone code options are part of the planned final checkout. A buyer chooses one code method. Live authentication and payments still need provider integration, rate limits, signature/webhook checks, stock checks, and end-to-end tests before activation.

Chat remains hidden for later OpenRouter work. It does not block the storefront launch.

## Public email addresses

Confirmed from the Lark setup chat on 12 October 2026. All five shared inboxes use the owner's existing Lark login.

| Address | Website placement |
| --- | --- |
| support@floruvi.com | Contact page and business search data |
| orders@floruvi.com | Shipping and refunds |
| marketing@floruvi.com | Shared inbox for wholesale, exports, and partnerships; not listed on Contact |
| accounts@floruvi.com | Shared inbox for invoices and billing; not listed on Contact |
| legal@floruvi.com | Privacy and terms |

The addresses are defined in `lib/site.ts`. Email links open the visitor's email app. The enquiry form continues to save requests in Convex; this change does not add automatic email delivery. External Lark sending and receiving have not been tested.

## Public social and phone links

Confirmed from the account setup chat and the owner on 12 October 2026:

- Instagram: https://www.instagram.com/floruvi/
- Facebook: https://www.facebook.com/profile.php?id=61595080272376
- Pinterest: https://www.pinterest.com/floruvifarm/
- Calls: +91 9071187879
- WhatsApp link: https://wa.me/919071187879

Social icons appear only in the footer, without a visible label. The phone number appears in Contact details, without a repeated footer phone link. The phone number also supplies business search data. Existing environment settings can override the phone and social profile defaults. WhatsApp registration and message delivery still need a phone check: Meta did not recognise the number during account setup. LinkedIn and Threads have no confirmed public profile links yet.
