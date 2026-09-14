# 6. Quality, measurement, and growth

## Owner-directed design

The owner chooses the visual direction. Start with a small reference set and one approved product page plus checkout layout. Reuse their spacing, type, colors, controls, and imagery across the site.

Build mobile-first. Use clear pack sizes, price, delivery information, visible stock states, and one main action per page. Keep form labels visible, preserve inputs after an error, and support keyboard use, clear focus, adequate contrast, and reduced motion. Test Arabic chat text with right-to-left layout.

Do not create a generic dashboard to fill space. The owner needs to publish a product, update stock, see an order, and respond to a lead quickly.

## Speed targets

- Public product content must be present in server-rendered HTML.
- Keep interactive code limited to areas that need it. Use Convex live queries where updates matter.
- Load chat on request or after the page's critical content. Send only sanitized public path/product context.
- Optimize product images, reserve their dimensions, and avoid large background videos.
- Cache public data with an explicit refresh policy. Never cache private customer output as public data. Recheck price and stock at purchase regardless of page cache.
- Lab target on representative mobile pages: LCP at most 2.5 seconds and CLS at most 0.1. Live field target: INP at most 200 ms at the 75th percentile. Record device, network, URL, and sample conditions. These are targets, not current measurements.
- Measure again with chat, analytics, and push integrations enabled. Do not claim that a local fast page proves live speed.

These thresholds follow [Google's Core Web Vitals guidance](https://web.dev/articles/vitals). Live field checks apply the 75th-percentile target to all three metrics.

## SEO at launch

1. Write unique product titles, descriptions, pack information, and useful delivery content based on real farm facts.
2. Use stable product URLs, canonical tags, sitemap, robots rules, and social sharing metadata.
3. Add Product/Offer and Breadcrumb structured data that match visible content. Use Organization or LocalBusiness only where its facts and eligibility fit.
4. Keep cart, checkout, account, admin, and internal search pages out of search results. Authentication must still protect private content; robots rules do not secure it.
5. Validate rendered structured data using Google's Rich Results Test. Inspect real HTML and rendered pages.
6. Verify Search Console and submit the sitemap after launch. Check indexing rather than assuming sitemap submission is sufficient.
7. Add location pages only for areas actually served, with useful distinct content. Do not mass-produce city pages or invent reviews, farm claims, organic certification, or health benefits.

Follow [Google's ecommerce structured-data guidance](https://developers.google.com/search/docs/specialty/ecommerce/include-structured-data-relevant-to-ecommerce) and [LocalBusiness guidance](https://developers.google.com/search/docs/appearance/structured-data/local-business). Structured data does not guarantee a rich result or ranking.

## PostHog event plan

Use PostHog as the primary measurement service. Start with explicit events and small dashboards. Avoid duplicate analytics SDKs.

| Event | Source | Allowed useful properties |
| --- | --- | --- |
| product_viewed | Browser | product ID, category, public path |
| product_added_to_cart | Browser | product ID, quantity |
| checkout_started | Browser | cart value, item count, currency |
| otp_requested / otp_verified / otp_failed | Auth integration, deduplicated | method, coarse error category; no code or contact value |
| payment_started | Backend | provider, amount, currency, opaque attempt ID |
| order_paid | Backend after verified capture | opaque order ID, amount, currency; stable event ID |
| lead_submitted | Backend | B2B/B2C, source page, campaign tags; no form text |
| chat_opened / chat_handoff | Browser or backend | source path, language, channel |
| product_link_clicked | Chat/link integration | product ID, channel |
| push_opted_in | Browser | platform category |

Store only allowed source/campaign tags after appropriate consent. Strip query strings that can contain contact details, tokens, or order identifiers. Use anonymous IDs before verification and a stable non-contact customer ID after it, subject to the chosen privacy settings. Clear browser identity on sign-out.

Disable replay on checkout, auth, account, admin, and chat surfaces. Mask inputs and block sensitive DOM regions on allowed pages. Keep raw chat messages, addresses, emails, phone numbers, OTPs, tokens, and payment details out of analytics and error reports. Turn off broad autocapture until its payload is checked.

The order database and Razorpay are the financial record. Browser conversion events are not proof of payment. Reconcile PostHog's paid-order event against confirmed orders and deduplicate server retries.

Dashboards: purchase funnel; B2B enquiries and qualified leads; source/campaign conversion; errors and OTP delivery; product interest. Add sanitized error alerts for payment processing, lead delivery, and code-send failure. Decide the actual consent controls for the launch market before enabling marketing tracking.

## Push notifications

Use two clear paths:

- **Owner:** Crisp's operator app alerts for new chats; transactional alerts with dashboard links for orders and leads.
- **Buyer:** optional OneSignal browser notifications for requested updates or separately consented farm offers.

Ask for browser permission after an explicit action such as “Notify me.” Do not request it on arrival or make it a checkout requirement. Support decline, later unsubscribe, and unsupported browsers. Do not put private order details on a lock screen.

On iPhone/iPad, web push needs a supported OS and the web app added to the Home Screen. Test the actual flow using [OneSignal's iOS guide](https://documentation.onesignal.com/docs/en/web-push-for-ios). Permission and delivery are not guaranteed on every device.

## Required checks before launch

- Both OTP methods: new user, returning user, resend, incorrect code, expired code, abuse limits, and account-link conflict.
- Access denial: anonymous customer, another customer, forged role, direct function call, and direct file access.
- Payments: tampered total, duplicate click, invalid signature, duplicate/out-of-order webhook, delayed capture, abandoned checkout, provider timeout, late capture after stock release.
- Stock: two buyers compete for the last pack; only valid reservations can proceed.
- Forms: spam limit, valid lead saved, failed alert retry, and no private form text in telemetry.
- Chat: all trial rows in the chat plan and prompt-injection tests.
- UI: narrow phone, desktop, keyboard-only operation, focus, errors, and slow connection.
- SEO: public HTML, canonical, robots, sitemap, structured data, and private-page exclusion.
- Operations: receipt, alerts, refund procedure, backup restore, and a controlled live order.

## First two weeks of growth

1. Speak to existing buyers and B2B prospects. Record delivery needs and repeat-order demand.
2. Publish real product photos, useful availability updates, and the farm's delivery promise.
3. Set a small owner-approved ad budget and one primary conversion per campaign. Start with the actual service area.
4. Review qualified B2B leads, paid orders, acquisition cost, repeat purchases, and response time. Do not optimize only for traffic or chat opens.
5. Add Meta or Google conversion integrations only when the chosen campaign needs them. Apply the same privacy and deduplication rules.
6. Fix the largest proven sales blocker. Add new features only when they support a measured customer need.

Installing an advertising skill does not authorize ad spend or contacting prospects. The owner controls campaign budgets, publishing, and outreach.
