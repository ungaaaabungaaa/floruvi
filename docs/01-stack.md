# 1. Stack and cost

Status: Convex is confirmed. Other choices are proposed. Checked: 14 September 2026.

## Recommended approach

Use Next.js for the public site and small farm dashboard. Use Convex for data, server functions, storage, and scheduled tasks. Buy the inbox and message delivery services.

This keeps the custom code focused on products, delivery rules, checkout, and a small chatbot connector.

| Layer | Proposed choice | Reason |
| --- | --- | --- |
| Web | Next.js App Router + TypeScript | Server-rendered product pages and a small interactive checkout |
| UI | Tailwind CSS + shadcn/ui | The owner can direct each component and style |
| Backend | Convex | Reactive stock and dashboard updates; one place for business rules |
| Auth | Better Auth + official Convex component | One identity owner for email and phone codes |
| Email | Resend | Codes, receipts, and lead alerts |
| SMS | Twilio Programmable Messaging | Send Better Auth's phone code through a provider callback |
| Payment | Razorpay Standard Checkout | Provider-managed payment UI and methods |
| Hosting | Vercel Pro | Direct Next.js and GitHub deployment path |
| Support | Crisp Essentials | Managed inbox and translation; no custom operator dashboard |
| LLM | Gemini 3.1 Flash-Lite, paid API | Classify a request into a small list of permitted actions |
| Analytics | PostHog | Funnel, attribution, errors, and controlled replay in one service |
| Push | OneSignal | Managed browser subscriptions and sends |

[shadcn supports Next.js](https://ui.shadcn.com/docs/installation). NextUI is now [HeroUI](https://v2.heroui.com/docs/guide/nextui-to-heroui). Choose one UI base; shadcn is the recommendation because the owner wants direct design control.

The official [Convex + Better Auth plugin list](https://labs.convex.dev/better-auth/supported-plugins) includes both Email OTP and Phone Number. Prove their combined Next.js flow on day 1. Better Auth is a library in our backend, not a separate paid identity account.

Use Better Auth to issue and verify phone codes, with Twilio only delivering SMS. Do not add a second OTP verifier. Confirm the intended India delivery route, sender requirements, cost, and delivery to real handsets with [Twilio's India guidance](https://www.twilio.com/en-us/guidelines/in/sms). If that route is unsuitable, evaluate MSG91 as a replacement before locking the SMS provider. Do not run both by default.

## Alternatives considered

| Approach | Trade-off | Decision |
| --- | --- | --- |
| Next.js + Convex + managed inbox | Some custom commerce rules; little infrastructure to operate | Recommended |
| Hosted commerce platform | Less order-management code, but its checkout and platform rules constrain the requested flow | Keep as a fallback business decision if custom checkout exceeds the time budget |
| Next.js + self-hosted support tools | Lower subscription cost may create deployment, upgrade, backup, and translation work | Exclude from week 1 |

WordPress and headless WooCommerce are outside the requested approach. Supabase was considered and rejected by the owner.

## Storage and baseline cost

Use Convex File Storage directly. Set an application storage target of at most 20 GB. Resize product images before upload and serve suitable image sizes. Start without customer file uploads.

Convex lists 1 GB of included file storage on Free/Starter. Starter can meter additional use. The listed base-region file rate is $0.033 per extra GB per month, so 20 GB totals about $0.63 in storage overage. This is not the full backend bill: data egress, functions, database use, region, and other meters are separate. Professional starts at $25 per developer/month and includes 100 GB of file storage and daily backups. [Convex pricing](https://www.convex.dev/pricing).

Recommendation: use Free for development, then Starter with billing and usage alerts for an initial small launch. Before live orders, choose and test the backup process. Use Professional if managed daily backups are preferred. A GitHub backup contains source code, not customer data or uploaded images.

| Service | Planning allowance | Limit or condition |
| --- | --- | --- |
| Vercel Pro | From $20/month | One developer; usage can add cost. Hobby is for non-commercial personal use. [Pricing](https://vercel.com/pricing) |
| Convex | $0 base on Starter, plus usage | Optional $25/developer/month Professional. See storage calculation above. |
| Crisp Essentials | $95/workspace/month | Translation and API suitability must pass the trial. [Pricing](https://crisp.chat/en/pricing/) |
| Resend | Free initially | 3,000 emails/month, 100/day. Upgrade before codes plus receipts exhaust the daily limit. [Pricing](https://resend.com/pricing) |
| Twilio SMS | Usage-based | Obtain the route-specific quote and test delivery. |
| PostHog | Start within free allowances | Set limits for each enabled product. [Pricing](https://posthog.com/pricing) |
| OneSignal | Free initially | Web push: at most 10,000 subscribers per send on Free. [Pricing](https://onesignal.com/pricing) |
| Gemini API | Usage-based | Set a small application quota and a billing alert. Paid-tier data terms apply. [Billing](https://ai.google.dev/gemini-api/docs/billing) |
| Razorpay | Transaction fees | Confirm the merchant's approved rate and methods before launch. |

Fixed-service starting point: about **$115/month with Convex Starter**, or **$140/month with Convex Professional for one developer**. Add provider usage, SMS, payment fees, domain charges, tax, and foreign-exchange costs. These are estimates, not a quoted total.

Cloudinary is an alternative if media becomes a separate need. Its [Free plan](https://cloudinary.com/pricing) has 25 monthly credits. Credits combine storage, delivery, and processing; they are not a promise of 25 GB free storage plus unlimited delivery. [Credit rules](https://cloudinary.com/documentation/billing_and_plans). It is not needed in the proposed stack.

## Stripe later

Keep payment records provider-neutral: provider, provider order ID, provider payment ID, amount in minor units, currency, status, and timestamps. Put Razorpay-specific code in one module. Add a second module only when Stripe is approved and needed.

International payments also need approved business eligibility, shipping destinations, currency rules, and tax treatment. Stripe accounts in India are currently [invite-only](https://support.stripe.com/questions/stripe-accounts-are-invite-only-in-india?locale=en-GB). A future integration cannot guarantee account activation.
