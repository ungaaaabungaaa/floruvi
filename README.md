# Floruvi Farm

A fast farm storefront for household buyers (B2C) and business buyers (B2B).

The first release must help people buy products or contact the farm. Development has a one-week target. After launch, the main work moves to sales, advertising, and farm growth.

## Current state

Planning only. There is no application, database deployment, payment setup, or live website yet.

Confirmed on 14 September 2026:

- Use Convex for the reactive database and file storage.
- Let visitors browse, use the cart, and contact the farm without an account.
- Offer both email and phone codes on the final checkout page. The buyer chooses one method.
- Use Razorpay for launch. Allow Stripe to be added later.
- The owner directs the visual design.
- Use managed services to keep development and maintenance small.
- Back up project work to [ungaaaabungaaa/floruvi](https://github.com/ungaaaabungaaa/floruvi).

The other service choices below are proposals for review. Provider accounts and approvals are not verified.

## Proposed stack

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
| Small chatbot intent classifier | Gemini 3.1 Flash-Lite on a paid API project |
| Analytics and errors | PostHog |
| Optional customer browser notifications | OneSignal |

Use one application and one backend. Do not add WordPress, a custom chat inbox, an ERP, or a separate service for every feature.

## Read in this order

1. [Stack, alternatives, and cost](docs/01-stack.md)
2. [Customer journeys and data rules](docs/02-product-and-checkout.md)
3. [Accounts and setup checklist](docs/03-accounts.md)
4. [Chat, translation, and AI access](docs/04-chat.md)
5. [One-week delivery plan](docs/05-delivery-plan.md)
6. [Design, SEO, analytics, and launch checks](docs/06-quality-and-growth.md)
7. [Project instructions](AGENTS.md) and [skill sources](skills/README.md)

## Decisions still needed

- Accept the proposed service costs, especially Crisp.
- Confirm the launch delivery area, product pack sizes, stock, delivery fees, and minimum order.
- Confirm whether B2B starts with a quote request. This is the proposed first release.
- Supply the first product photos and direct the visual design.
- Verify Arabic translation, original-message access, and channel connections during the Crisp trial.

## Repository and deployment

The remote repository is the source backup. A GitHub push does not prove a deployment.

After the stack is accepted and the app is built, connect the repository to Vercel. Keep development, preview, and production data separate. Follow [the deployment steps](docs/05-delivery-plan.md#deployment-procedure).

Prices and provider features were checked on 14 September 2026. Source links are next to the relevant claims in the documents. Recheck them before purchase.
