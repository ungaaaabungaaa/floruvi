# Floruvi Farm

A fast farm storefront for household buyers (B2C) and business buyers (B2B).

[Open the website](https://floruvi.vercel.app)

The first release must help people buy products or contact the farm. Development has a one-week target. After launch, the main work moves to sales, advertising, and farm growth.

## Current state

The public application is built with Next.js and Convex. It includes the home page, a searchable 91-product catalogue, six categories, crop details, business and personal enquiry forms, farm information, 88 recipes with detail pages, stored in Convex, health and nutrition, growing methods, sustainability, and real talk.

The design follows the owner’s photographic references: warm ivory, forest green, serif headings, large images, and simple product cards. Generated image sources for all products, the editorial pages, and the carrot brand mark are in `src/assets`, together with their prompts. Shared styles in `app/globals.css` support later Figma refinements.

All 91 products have pack prices, including six live microgreen trays. Prices use retail benchmarks plus 40%; unmatched varieties use documented category comparators. Delivery is ₹99 across India with no PIN-code restriction. Single, Dual and Family boxes have defined contents and prices. See [launch pricing](docs/15-live-trays-and-pricing.md) and the [price sheet](docs/pricing-benchmarks.csv). A persistent basket and three-step checkout send a real availability enquiry. Box requests offer Single, Dual, and Family sizes with daily, weekly, or every-two-weeks delivery. They do not activate recurring billing. Email/phone verification and Razorpay are visible but disabled until provider integration and sale details are ready. Chat is hidden at the owner’s request. Its code is retained for later OpenRouter work. Live operators, translation, and LLM replies are not connected.

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

## Stack and later services

| Need | Choice |
| --- | --- |
| Website | Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui |
| Data, backend functions, stock, scheduled work | Convex |
| File storage | Convex File Storage |
| Customer identity and sessions | Better Auth through the Convex component |
| Email codes and transactional email | Resend |
| Phone codes | Twilio SMS through Better Auth; prove local delivery first |
| Payments | Razorpay Standard Checkout |
| Website hosting | Vercel Pro |
| Website, WhatsApp, and Instagram inbox | Crisp Essentials, subject to the trial checks |
| Future chat model access | OpenRouter; model and tool access to be decided later |
| Analytics and errors | PostHog |
| Optional customer browser notifications | OneSignal |

Use one application and one backend. Do not add WordPress, a custom chat inbox, an ERP, or a separate service for every feature.

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
- Supply prices for the remaining 15 products. Delivery across India and the ₹99 flat fee are confirmed.
- Confirm whether B2B starts with a quote request. This is the proposed first release.
- Replace illustrative assets with actual harvest and facility photos when available.
- Verify Arabic translation, original-message access, and channel connections during the Crisp trial.

## Repository and deployment

The remote repository is the source backup. A GitHub push does not prove a deployment. Vercel project: `thehelds-projects/floruvi`.

Convex development is `efficient-toad-585`; production is `polished-mosquito-828`. Both are in EU West. Vercel Preview uses development data, and Vercel Production uses production data. The two environments have separate enquiry keys.

Automatic Git deployments need the owner's GitHub login connection in Vercel. The CLI could create the project but could not link the repository because that connection is missing. CLI deployments remain available. Follow [the application setup steps](docs/08-running-the-app.md) before connecting production builds.

Prices and provider features were checked on 14 September 2026. Source links are next to the relevant claims in the documents. Recheck them before purchase.
