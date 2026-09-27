# Floruvi Farm

A fast farm storefront for household buyers (B2C) and business buyers (B2B).

[Open the website](https://floruvi.com)

The first release must help people buy products or contact the farm. Development has a one-week target. After launch, the main work moves to sales, advertising, and farm growth.

## Owner checklist

Updated 28 September 2026. Tick items as they are done. **(You)** = only the owner can do it. **(Dev)** = development work, usually waiting on a (You) item above it. Details: [backlog](docs/24-backlog.md).

### 1. Sign up and set up first — these block selling

- [ ] **(You) OTP platform:** sign up with [MSG91](https://msg91.com/in/pricing/otp) (about ₹0.25 per code + GST). Start **TRAI DLT registration** at the same time: principal entity (about ₹5,000 + GST), sender header and a 6-digit OTP template. It takes several working days. Backup: Fast2SMS. See [OTP research](docs/23-notifications-otp-chat-research.md).
- [ ] **(You) Confirm phone-only checkout:** name + 10-digit mobile + SMS code, address optional, no customer email. This replaces the email + phone plan in AGENTS.md.
- [ ] **(You) Payment gateway — Razorpay:** the code is ready. Finish KYC and bank details, update the Terms and Privacy notice, add a delivery policy page, then put the test keys and webhook secret in Convex and turn **Online payment** on in `/admin`. Go live with live keys after one test order. Step by step: [Razorpay payments](docs/29-razorpay-payments.md).
- [ ] **(You) Live admin panel:** `ADMIN_API_SECRET` (Vercel + Convex) and `SITE_URL` are set. Still to do: run `pnpm exec convex deploy` (answer y), then `pnpm -s admin:hash | pnpm exec convex env set ADMIN_CREDENTIAL_HASH --prod` with your real details and a new 12+ character password. See [admin & order alerts](docs/25-admin-and-order-alerts.md).
- [ ] **(You) Order alerts:** create the Telegram bot and chat ID, and a Resend key. Put them in Convex production.
- [ ] **(You) Privacy notice:** add the Telegram/email alerts now, and SMS codes, payments and chat storage when those go live. Choose how long to keep enquiries and chats.
- [ ] **(You) Business details:** legal and trading name, address, support email and phone/WhatsApp, GSTIN, and your FSSAI registration or licence number (shown on the site once you have it).
- [ ] **(You) Real stock and delivery:** set in/out of stock in `/admin`. Confirm delivery areas, days, cut-off time and lead time, and box contents and substitution rules ([owner details](docs/10-owner-launch-details.md)).

### 2. Build next (Dev)

- [ ] **Phone sign-in at checkout** with 6-digit SMS codes (Better Auth + MSG91). The cart and wishlist sync to the verified number. *Needs:* MSG91 + DLT.
- [ ] **Chatbot on OpenRouter:** SMS-code sign-in, stored chats, product search and add-to-basket, human hand-off, an `/admin/chats` inbox, minimal design, same on/off switch. *Needs:* your approval of the [chatbot plan](docs/26-chatbot-plan.md).
- [ ] **OpenRouter setup:** account, API key in Convex, monthly spend cap (proposal: US$10), model `qwen/qwen3.7-flash` with a fallback ([costs](docs/23-notifications-otp-chat-research.md)).
- [ ] **Chatbot languages:** English first, then Hindi, Arabic and the other site languages, each after a 50-question test.
- [ ] **Free goodies:** recipe card at ₹2,000 and hemp tote at ₹5,000 ([plan](docs/27-free-gifts-plan.md)). *Needs:* your answers to its 6 questions, supplier quotes and the two images. Optional later: loyalty points instead of, or with, gifts.
- [ ] **Wholesale & export tools:** bulk quote page, downloadable catalogue and spec sheets, Google Merchant Center and Meta product feeds.
- [ ] **WhatsApp channel** for the chatbot (later; needs Meta business verification).

### 3. Search, marketing & sales channels (You)

- [ ] Verify the site in Google Search Console and Bing Webmaster Tools, and submit `/sitemap.xml` ([search notes](docs/21-languages-and-seo.md)).
- [ ] Verify `floruvi.com` in Resend (then add the second alert inbox) and use it for the Search Console property. The domain is connected and is now the site's single public address.
- [ ] Decide on the homepage testimonials and the "No harmful chemicals" / "Locally grown" lines: use real, consented quotes and proven facts, or remove them.
- [ ] Say "organic" or "pesticide-free" only with NPOP or PGS-India certification, or a lab residue report.
- [ ] Replace the generated images with real farm and product photos.
- [ ] Ask native speakers to review the nine translations before running ads in those countries.
- [ ] Answer the open search decisions: category pages, duplicate English/Arabic versions, homepage title, product breadcrumb, mobile Contact link ([search notes](docs/21-languages-and-seo.md)).
- [ ] Social accounts, marketplaces and B2B buyers: follow the 30-day plan in the [growth channels research](docs/22-growth-channels-research.md) (Instagram, Facebook, LinkedIn, Google Merchant Center, Blinkit, Zepto, Instamart, IndiaMART and others).
- [ ] Optional: a Google Business Profile, if there is a real location or service area.

### 4. Registrations for selling & export (You, with a professional)

- [ ] FSSAI, GSTIN, IEC (DGFT), APEDA RCMC and phytosanitary certificates, as needed for your sales and export plan ([growth channels research](docs/22-growth-channels-research.md)).
- [ ] Company and trademark checks for "Floruvi" ([name check](docs/floruvi-name-search-2026-09-26.md)).

### Done

- [x] Storefront: 91 products, boxes, 88 recipes, FAQ, contact, terms and refunds, in 32 country and language versions.
- [x] Blinkit-style cart pill, red wishlist heart, search and AI-visibility pass, `/llms.txt`.
- [x] Admin panel at `/admin`: orders, per-product stock switch, website chat switch (needs the live setup above).
- [x] Order alerts by Telegram and email (need the keys above).
- [x] Razorpay payments for India: server-side totals and stock check, signature and capture checks, signed webhook, paid orders and a payment switch in `/admin`, paid-order alerts ([guide](docs/29-razorpay-payments.md)). Off until the keys are set.
- [x] Custom domain `floruvi.com` as the single public address (canonical links, sitemaps, redirects).
- [x] Plans & research: [chatbot](docs/26-chatbot-plan.md), [free gifts](docs/27-free-gifts-plan.md), [notifications, OTP & LLMs](docs/23-notifications-otp-chat-research.md), [growth channels](docs/22-growth-channels-research.md).

## Current state

The public application uses Next.js & Convex. It includes the home page, searchable 91-product shop, crop details, vegetable boxes, basket, enquiry checkout, 88 recipe pages, FAQ, privacy, a wishlist page & one contact form for home or business requests. Standalone category, nutrition, sustainability, Delivery & Our farm pages have been removed. Category browsing stays inside the shop.

The design follows the owner’s photographic references: warm ivory, forest green, serif headings, large images, and simple product cards. Generated image sources for all products, the editorial pages, and the carrot brand mark are in `src/assets`, together with their prompts. Shared styles in `app/globals.css` support later Figma refinements.

All 91 products have pack prices, including six live microgreen trays. Prices use retail benchmarks plus 40%; unmatched varieties use documented category comparators. Delivery is ₹99 for baskets containing individual produce, with no PIN-code restriction. Box-only baskets have no extra delivery charge. Single, Dual and Family boxes have defined contents and prices. See [launch pricing](docs/15-live-trays-and-pricing.md) and the [price sheet](docs/pricing-benchmarks.csv). A persistent basket and three-step checkout send a real availability enquiry. Box requests offer Single, Dual, and Family sizes with Once, Weekly, or Monthly delivery. They do not activate recurring billing. Customers in India can pay by Razorpay once the owner adds the keys and switches payments on in `/admin`; until then, and for export countries, checkout sends a request. Email/phone verification is not connected yet. The owner's admin panel at `/admin` lists orders and switches product stock and the website chat. Chat is hidden until the owner switches it on; today it is a simple English catalogue guide, and the OpenRouter bot is planned. Live operators, translation, and LLM replies are not connected.

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
| ⬜ | **Order alerts — Telegram & email (Resend)** | Built 28 September 2026: every saved enquiry alerts the owner by Telegram & email, with retries. Add the bot token, chat ID & Resend key in Convex, then send a test enquiry. See [admin & order alerts](docs/25-admin-and-order-alerts.md). Update the privacy notice before switching alerts on. |
| ⬜ | **Owner admin panel** | Built 28 September 2026 at `/admin`: orders, per-product stock switch, five-detail sign-in with a 14-day session. Set `ADMIN_API_SECRET` (Vercel + Convex) and `ADMIN_CREDENTIAL_HASH` (Convex), then deploy Convex. |
| ✅ | GitHub ↔ Vercel connection | Repository `ungaaaabungaaa/floruvi` is linked to production branch `main`; verified through Vercel on 15 September 2026. |
| ✅ | Automatic Vercel Git deployments | Verified 15 September 2026: push `fc749c1` created a ready Git-sourced production deployment; subsequent push `1868fbe` also triggered a build. Push to `main` to deploy. |
| ⬜ | Customer accounts — Better Auth | Connect Convex authentication, verify login/session behaviour & add basket/wishlist sync when an account is created during checkout. Guest browsing stays available. |
| ⬜ | Email verification codes — Resend | Configure sender/domain & server-side code delivery, expiry, request limits & verification. Separate from owner enquiry notifications. |
| ⬜ | Phone verification codes — SMS provider | Select/configure a provider such as Twilio, complete local sender/template requirements & test delivery before enabling phone codes. |
| ⬜ | Payments — Razorpay | Activate the merchant account, add test credentials, implement payment verification & webhooks, test checkout, then enable live credentials. No online payments or recurring billing are active. |
| ✅ | Custom domain | `floruvi.com` is connected (28 September 2026). `NEXT_PUBLIC_SITE_URL` is `https://floruvi.com`, so canonical links, sitemaps and hreflang use it; `floruvi.vercel.app` and `www.floruvi.com` redirect to it (308). |
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
