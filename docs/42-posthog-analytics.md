# PostHog analytics

FLORUVI uses the US Cloud project **FLORUVI (745889)**. The previous organization was deleted by the owner. Do not reconnect the site to the old project.

## Launch baseline

The owner confirmed zero real users on 18 November 2026. PostHog project 745889 and the storefront connection already exist. An empty chart at launch is expected. Reuse this project; do not migrate, backfill or recreate it. Internal QA is not customer traffic. Recheck live data before reporting a later user count.

When a feature changes an action or funnel, update the event guide, safe properties and relevant dashboards in the same change. Verify live events with the QA marker.

## Cost controls

The selected plan is **Free**, with capped usage and no card or paid subscription. The account showed these monthly limits on 18 November 2026: 1 million analytics events, 5,000 recordings, 100,000 exceptions, 1,500 survey responses, and 1 million flag requests. Check the live billing screen before relying on future limits. Do not add a card, paid plan, add-on, managed proxy, AI task, or warehouse sync without the owner's explicit instruction.

The site sends at most 150 measurement events and five errors per page lifecycle. Recordings use a 10% sample, a 10-second minimum, and 30-day retention. These code limits reduce normal usage; they are not an abuse-proof account quota. The capped Free plan is the billing protection.

Requests go directly to PostHog. There is no Vercel analytics proxy or extra server function. Ad blockers can stop collection. We do not bypass a visitor's privacy tools.

## Consent and privacy

- The SDK loads only after analytics consent. No optional collection runs before that.
- Analytics runs only on `floruvi.com` and `www.floruvi.com`. Preview and local builds send no measurement data.
- The privacy control in the footer can withdraw consent. Withdrawal stops recordings, clears analytics persistence, and keeps the essential consent choice.
- Do Not Track and Global Privacy Control keep optional analytics off.
- Analytics uses a random browser identifier after consent. Person profiles, account identification, click autocapture, heatmaps, automatic surveys, flag evaluation, console logs and network capture are disabled.
- Only known event and property names pass the final send filter. Search parameters, hashes, free text, contact details, order IDs and payment data are excluded.
- Replay masks text, inputs and attributes. It blocks forms, private content, payment frames, video and canvas. The client checks a public route allowlist. Cloud project settings also block private routes and URLs with query strings or hashes.
- Admin uses a separate layout and has no SDK component. Cart, checkout and contact content have server-rendered `data-private` wrappers.
- Error reports remove messages, variables and external stack locations. They keep static bundle frame positions. Private source-map uploads need a separate scoped build credential; no admin key is in the website.
- Core Web Vitals send numeric LCP, INP, CLS and FCP values only. DOM attribution and raw performance entries are excluded.

## Events

| Event                   | Trigger                                    | Safe properties                               |
| ----------------------- | ------------------------------------------ | --------------------------------------------- |
| `$pageview`             | Public page entered after consent          | Sanitized public URL, device, referrer domain |
| `product_viewed`        | Product page entered                       | Product slug                                  |
| `product_added_to_cart` | Valid product or pack added                | Product slug, quantity                        |
| `checkout_started`      | Checkout page entered                      | Aggregated checkout path                      |
| `enquiry_submitted`     | Enquiry API confirms success               | Form type, market                             |
| `payment_started`       | Valid payment form submitted               | Market                                        |
| `payment_failed`        | Payment flow returns an error              | Fixed failure stage, market                   |
| `$exception`            | Consenting visitor's public-page error     | Redacted static frame locations               |
| `$web_vitals`           | Next.js reports a web metric after consent | Numeric metric value                          |

`purchase_completed` and `refund_completed` are deliberately absent. Add them from verified payment records during the Razorpay work. A browser payment click is not a sale.

## Ratings and surveys

The owner removed ratings and feedback collection on 18 November 2026. No feedback widget, form, trigger or survey event is in the site. Surveys stay disabled in the SDK and project. The unused draft survey is archived. Do not restore it without a new owner request.

## Environment and operation

Vercel uses `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com`. The project token is a public write-only ingestion key. Never add a personal or secret admin API key to browser variables.

For an internal browser check, open `https://floruvi.com/?floruvi_qa=1` before allowing analytics. Subsequent events in that client lifecycle carry `internal_test=true`; dashboard filters exclude them. That URL cannot start replay because it has a query string. Navigate to a plain public URL to check recording eligibility. Do not submit a real enquiry or charge a payment during analytics QA.

Verify four separate outcomes after a change: local privacy tests, production build, exact-commit Vercel deployment, and received live events. A saved dashboard with zero events does not prove a working connection.

Official references: [Next.js error tracking](https://posthog.com/docs/error-tracking/installation/nextjs), [replay privacy](https://posthog.com/docs/session-replay/privacy).
