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
- The small consent notice is inline in the footer, with no fixed overlay or automatic dialog. Shopping is available after decline. Detailed settings open only on request. The separate privacy link strip is 60 px high, with a 44 px touch target.
- The privacy control in the footer can withdraw consent. Withdrawal stops recordings, clears analytics persistence, and keeps the essential consent choice.
- Do Not Track and Global Privacy Control keep optional analytics off.
- Analytics uses a random browser identifier after consent. Person profiles, account identification, click autocapture, heatmaps, automatic surveys, flag evaluation, console logs and network capture are disabled.
- Only known event and property names pass the final send filter. Search parameters, hashes, free text, contact details, order IDs and payment data are excluded.
- The final filter preserves the required public ingestion `token`. Removing it prevents event delivery. The regression test checks this field.
- Campaign attribution accepts only named source/medium values and the published campaign `floruvi_launch`. Full query strings, `gclid`, `fbclid`, search terms and unknown values are dropped. Extend the fixed campaign vocabulary during the ads setup. Native automatic campaign/referrer persistence is off; only the sanitized labels persist after consent.
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

A full reload starts a new client lifecycle. Open the QA URL again before a reload or new test visit. The project also excludes the known QA browser by its anonymous device ID. Keep that event filter and the existing internal-user cohort. Do not identify test visitors or create person profiles to filter them.

Verify four separate outcomes after a change: local privacy tests, production build, exact-commit Vercel deployment, and received live events. A saved dashboard with zero events does not prove a working connection.

## Saved dashboards and acceptance: 18 November 2026

- [Storefront and acquisition](https://us.posthog.com/project/745889/dashboard/2373712) is the primary dashboard. It includes daily consenting visitors, top products, public pages, campaign sources, referring domains, devices and an ordered product → basket → checkout funnel within one day.
- [Site health](https://us.posthog.com/project/745889/dashboard/2373730) includes redacted errors and separate P90 LCP, INP, FCP and CLS charts. Timing values are milliseconds; CLS is a score.
- Both dashboards use the last 30 days and exclude internal traffic. Each of the 12 saved charts ran without query warnings. Customer results were zero after test exclusions. The unused starter examples are unpinned.
- A live internal visit completed all three funnel steps: one visitor viewed a product, added it to the basket and entered checkout. The test basket was then cleared. No lead, order or payment was submitted.
- Live event delivery returned HTTP 200. PostHog received pageviews, product views, basket additions, checkout starts, numeric web metrics and a redacted test error. The test error's original message was absent.
- After decline, a fresh public page made zero PostHog requests. Basket use still worked. The first-visit state had no open dialog and made zero PostHog requests.
- Optional replay is enabled in the project, with masking, private-route exclusions, a 10% sample, a 10-second minimum and 30-day retention. The recorder script loaded after explicit replay consent. No saved recording was returned during QA, so playback acceptance remains unverified. Do not claim that all sessions are recorded.
- Billing was rechecked: Free plan, no customer/card record and no active paid subscription. Surveys remain disabled.

The owner requested regional consent rules. The current release still uses opt-in globally. Do not infer visitor location from the selected store country or language. A later regional rule needs verified request-country input, a policy for each served country, an opt-in fallback for unknown locations, and opt-in replay everywhere. Do not treat every country outside the EU and UK as automatically exempt.

## Remaining provider acceptance

1. Confirm one saved, masked public-page recording and verify that private forms are absent. Keep normal sampling at 10%; do not increase it just to force a test.
2. With Razorpay, add `purchase_completed` and `refund_completed` from verified, deduplicated payment records. Verify order value in minor units, currency, consent/attribution policy and test-mode exclusion. Then add paid conversion, revenue, refunds and campaign return charts. Browser clicks must not generate these events.
3. Apply regional consent only after its country policy is defined and tested. The existing global opt-in policy remains active.

Official references: [Next.js error tracking](https://posthog.com/docs/error-tracking/installation/nextjs), [replay privacy](https://posthog.com/docs/session-replay/privacy).
