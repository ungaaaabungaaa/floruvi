# Floruvi Farm

A fast farm storefront for household buyers (B2C) and business buyers (B2B).

[Open the website](https://floruvi.vercel.app)

The first release must help people buy products or contact the farm. Development has a one-week target. After launch, the main work moves to sales, advertising, and farm growth.

## Current state

The public application uses Next.js & Convex. It includes the home page, searchable 91-product shop, crop details, vegetable boxes, basket, enquiry checkout, 88 recipe pages, FAQ, privacy, a wishlist page & one contact form for home or business requests. Standalone category, nutrition, sustainability, Delivery & Our farm pages have been removed. Category browsing stays inside the shop.

The design follows the owner’s photographic references: warm ivory, forest green, serif headings, large images, and simple product cards. Generated image sources for all products, the editorial pages, and the carrot brand mark are in `src/assets`, together with their prompts. Shared styles in `app/globals.css` support later Figma refinements.

All 91 products have pack prices, including six live microgreen trays. Prices use retail benchmarks plus 40%; unmatched varieties use documented category comparators. Delivery is ₹99 for baskets containing individual produce, with no PIN-code restriction. Box-only baskets have no extra delivery charge. Single, Dual and Family boxes have defined contents and prices. See [launch pricing](docs/15-live-trays-and-pricing.md) and the [price sheet](docs/pricing-benchmarks.csv). A persistent basket and three-step checkout send a real availability enquiry. Box requests offer Single, Dual, and Family sizes with Once, Weekly, or Monthly delivery. They do not activate recurring billing. Email/phone verification and Razorpay are visible but disabled until provider integration and sale details are ready. Chat is hidden at the owner’s request. Its code is retained for later OpenRouter work. Live operators, translation, and LLM replies are not connected.

The site is published in 32 country & language versions: India English at the existing URLs, plus Arabic, German, Japanese, Dutch, Nepali, Bengali, Malay, Sinhala, Uzbek & English versions for 16 export countries. Export prices are local retail benchmarks + 40% in each currency; international delivery is quoted after review. See [languages, countries & search](docs/21-languages-and-seo.md) and [international prices](docs/20-international-pricing.md).

The brand tagline is **Freshness worth growing**. See [details needed from the owner](docs/10-owner-launch-details.md) and [checkout implementation](docs/09-site-and-checkout.md).

See [build and verification notes](docs/07-public-build.md) and [running the application](docs/08-running-the-app.md).

Confirmed on 14 September 2026:

- Use Convex for the reactive database and file storage.
- Let visitors browse, use the cart, and contact the farm without an account.
- Offer both email and phone codes on the final checkout page. The buyer chooses one method.
- Use Razorpay for launch. Allow Stripe to be added later.
- The owner directs the visual design.
- Use managed services to keep development and maintenance small.
- Back up project work to [ungaaaabungaaa/floruvi](https://github.com/ungaaaabungaaa/floruvi).

The other service choices below are proposals for review. Provider accounts and approvals are not verified.

## Service setup checklist

Status checked 15 September 2026. ✅ = connected or implemented. ⬜ = not connected; action still needed. Deferred services are optional, not launch requirements. Keep credentials in provider settings, never in this repository.

| Status | Service / feature | What remains |
| --- | --- | --- |
| ✅ | Next.js storefront | Shop, boxes, recipes, FAQ, privacy & one contact page are implemented. |
| ✅ | Convex database & file storage | Development & production projects are connected. Enquiry submissions are saved privately. |
| ✅ | Vercel hosting | Production runs at https://floruvi.vercel.app. GitHub is connected to the production branch `main`. |
| ✅ | GitHub source backup | Repository: `ungaaaabungaaa/floruvi`; changes can be committed & pushed. |
| ✅ | Local basket & wishlist | Saved in the visitor’s browser. No account sync yet. |
| ⬜ | **Enquiry notification email — Resend** | Create/connect Resend, verify a sending domain, configure an API key & sender address, implement server-side notifications after a successful form save, then verify delivery to both owner inboxes. Deferred at the owner’s request; **forms save to Convex but do not send email yet**. |
| ✅ | GitHub ↔ Vercel connection | Repository `ungaaaabungaaa/floruvi` is linked to production branch `main`; verified through Vercel on 15 September 2026. |
| ✅ | Automatic Vercel Git deployments | Verified 15 September 2026: push `fc749c1` created a ready Git-sourced production deployment; subsequent push `1868fbe` also triggered a build. Push to `main` to deploy. |
| ⬜ | Customer accounts — Better Auth | Connect Convex authentication, verify login/session behaviour & add basket/wishlist sync when an account is created during checkout. Guest browsing stays available. |
| ⬜ | Email verification codes — Resend | Configure sender/domain & server-side code delivery, expiry, request limits & verification. Separate from owner enquiry notifications. |
| ⬜ | Phone verification codes — SMS provider | Select/configure a provider such as Twilio, complete local sender/template requirements & test delivery before enabling phone codes. |
| ⬜ | Payments — Razorpay | Activate the merchant account, add test credentials, implement payment verification & webhooks, test checkout, then enable live credentials. No online payments or recurring billing are active. |
| ⬜ | Custom domain | Choose the public domain, connect DNS & verify HTTPS. The Vercel domain works now. |
| ⬜ | Business & privacy setup | Confirm legal business details, a direct privacy contact, enquiry retention period, fulfilment terms & refund/cancellation policy. |
| ⬜ | Analytics / error monitoring — optional | PostHog was proposed. Decide whether it is needed, configure it & update the privacy notice before collecting events. |
| ⬜ | Shared support inbox — deferred | Crisp was proposed for website/WhatsApp/Instagram support. Review need & cost first; no connection is active. |
| ⬜ | AI chat — deferred | OpenRouter was proposed. Chat remains hidden; do not enable without a separate decision. |
| ⬜ | Browser push — optional | OneSignal was proposed. Confirm need & permission flow before integrating. |

### Enquiry email acceptance checklist

One contact form at `/contact` serves home & business enquiries. The old `/wholesale` URL redirects there. Checkout requests continue to use the same private enquiry submission endpoint.

- [ ] Configure a verified sending address & private Resend API key.
- [ ] Send each successfully saved form submission to **both** `samx123786@gmail.com` & `syed_abdul_muqeeth@proton.me`.
- [ ] Include all submitted details: name, business name if supplied, email, phone, city, produce/box interest, quantity/frequency, message, submission reference/time & consent time. Do not email the hidden spam-trap field or internal request hashes.
- [ ] Set Reply-To to the visitor’s validated email address.
- [ ] Record email status & retry failed notifications without duplicating the saved enquiry or previously sent email.
- [ ] Verify both inboxes receive a clearly labelled test submission before calling the email feature live.
- [ ] Update the privacy notice to describe notification email processing when enabled.

Use one application & one backend. Add services only when their feature is ready to be used.

## Read in this order

Start with the [current page map](docs/14-page-map.md) for a folder view of every customer page.

1. [Stack, alternatives, and cost](docs/01-stack.md)
2. [Customer journeys and data rules](docs/02-product-and-checkout.md)
3. [Accounts and setup checklist](docs/03-accounts.md)
4. [Chat, translation, and AI access](docs/04-chat.md)
5. [One-week delivery plan](docs/05-delivery-plan.md)
6. [Design, SEO, analytics, and launch checks](docs/06-quality-and-growth.md)
7. [Project instructions](AGENTS.md) and [skill sources](skills/README.md)

## Decisions still needed

- Accept the proposed service costs, especially Crisp.
- Maintain the current product prices. Individual-produce baskets have a ₹99 delivery fee; box-only baskets have no extra delivery charge.
- Confirm whether B2B starts with a quote request. This is the proposed first release.
- Replace illustrative assets with actual harvest and facility photos when available.
- Verify Arabic translation, original-message access, and channel connections during the Crisp trial.

## Repository and deployment

The remote repository is the source backup. A GitHub push does not prove a deployment. Vercel project: `thehelds-projects/floruvi`.

Convex development is `efficient-toad-585`; production is `polished-mosquito-828`. Both are in EU West. Vercel Preview uses development data, and Vercel Production uses production data. The two environments have separate enquiry keys.

Vercel is connected to `ungaaaabungaaa/floruvi`, with `main` as the production branch (verified 15 September 2026). CLI deployments also remain available. Follow [the application setup steps](docs/08-running-the-app.md) before connecting production builds.

Prices and provider features were checked on 14 September 2026. Source links are next to the relevant claims in the documents. Recheck them before purchase.
