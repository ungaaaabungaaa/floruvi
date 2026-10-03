# Razorpay payments

Built 28 September 2026 with the official `razorpay` Node SDK (2.9.8). Payments stay **off** until the owner adds the keys and turns on the switch in `/admin`.

## What the customer sees

1. Customers in India fill in their details and delivery area, then see **Pay ₹…** on the review step.
2. Razorpay Checkout opens (UPI, cards, net banking, wallets). Its script loads only at this moment.
3. After payment, the page shows the order number, for example `FL-7K3P9QXM`. Razorpay emails its own payment receipt.
4. Export countries do not pay online. Their checkout still sends a request, and the farm quotes delivery.

The delivery address is required (owner update, 3 October 2026). A 6-digit PIN code is required for paid orders.

## How it is protected

- **Prices come from the server.** The browser sends only product slugs, quantities and contact details. Convex prices the basket from stored prices, checks stock, adds the ₹99 delivery fee and saves the order in paise before Razorpay sees an amount.
- **Payment is checked twice.** The checkout result must carry a valid Razorpay signature. Then Convex asks Razorpay for the payment and accepts it only if it is captured, belongs to this order and has the exact amount and currency. A mismatch is marked "Check payment", never "Paid".
- **The webhook confirms payments** even if the customer closes the tab. Razorpay signs each event; unsigned or changed events are rejected. Repeated or late events change nothing: an order is marked paid once, the owner alert is sent once, and a late "failed" event never undoes a payment.
- **Keys live only in Convex.** Vercel never holds the Razorpay secret. The key ID reaches the browser only when a payment starts.
- **Limits:** 10 payment starts an hour per address, 6 per email and 300 in total, counted on the server.
- **Test keys are labelled.** Orders made with `rzp_test_` keys show "Test" in `/admin` and "TEST · no money moved" in alerts.

Code: `convex/orders.ts` (pricing, limits, order state), `convex/payments.ts` (SDK calls), `convex/paymentsHttp.ts` (routes and webhook), `lib/razorpay.ts` (signature and state rules, with tests in `tests/payments.test.ts`), `app/api/payments/*` and `components/checkout.tsx`.

## Owner setup

Run the commands in the project folder, one at a time. Secrets are piped, so they do not appear in shell history.

### 1. Before Razorpay can activate your account

Razorpay checks the website during KYC. It needs these pages: Contact, Terms, Privacy, Cancellation & refunds, and Shipping/delivery.

- [x] **Policy pages** (28 September 2026, all 10 languages, from the owner's decisions): Terms of service, Privacy notice (Razorpay, order alerts, chat), Cancellation & refund policy (no cancellation after payment; full refund only for our mistakes, late delivery or no delivery; report within 24 hours; refunds in 5–7 working days) and a new **Shipping & delivery policy** at `/shipping` (every PIN code in India, within 2 days, flat ₹99, no cash on delivery). The FAQ delivery answers match. The texts work with payments on or off.
- [ ] **Business details on the site.** Set `BUSINESS_NAME`, `SUPPORT_EMAIL`, `SUPPORT_PHONE` and `BUSINESS_ADDRESS` in Vercel (Production) and redeploy. The Contact page and footer then show them. Razorpay checks for these.

### 2. Test mode

1. In the Razorpay Dashboard, switch to **Test Mode**.
2. Open **Account & Settings → API Keys** and generate a key. Copy the key ID and the secret.
3. Set them in Convex production:

   ```sh
   pnpm exec convex env set RAZORPAY_KEY_ID rzp_test_XXXXXXXX --prod
   pbpaste | pnpm exec convex env set RAZORPAY_KEY_SECRET --prod
   ```

   (Copy the secret first. `pbpaste` sends the clipboard, so the secret is not typed on screen.)
4. Open **Account & Settings → Webhooks → Add new webhook**:
   - URL: `https://polished-mosquito-828.eu-west-1.convex.site/razorpay/webhook`
   - Secret: a new random value. Make one with `node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"`, copy it, and paste it into Razorpay.
   - Events: `payment.captured`, `payment.failed`, `order.paid`.
5. Put the same webhook secret in Convex: `pbpaste | pnpm exec convex env set RAZORPAY_WEBHOOK_SECRET --prod`.
6. Keep **automatic capture** on (Razorpay's default). The site also captures a payment that is only authorised.
7. Deploy the backend: `pnpm exec convex deploy`, and answer `y`.
8. In `https://floruvi.com/admin`, turn **Online payment** on. The panel shows "Test keys".
9. Buy something small. In test mode, UPI ID `success@razorpay` succeeds and `failure@razorpay` fails. Razorpay's "Test card details" page lists test cards.
10. Check that `/admin` shows the order as **Paid** and that the Telegram alert arrived.

### 3. Go live

1. Switch the Dashboard to **Live Mode** and generate live keys.
2. Replace `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in Convex with the live values.
3. Add a second webhook in Live Mode (same URL and events, a new secret), and replace `RAZORPAY_WEBHOOK_SECRET`.
4. Make one real ₹1–₹100 payment, then refund it in the Razorpay Dashboard.

To stop payments at any time, turn **Online payment** off in `/admin`. Checkout returns to sending requests at once.

## Local and preview testing

The webhook goes to Convex, not to Vercel, so the development backend can receive test webhooks while the site runs on your computer. Use `https://efficient-toad-585.eu-west-1.convex.site/razorpay/webhook` for a test-mode webhook, and set the same three variables without `--prod`.

Checks on 28 September 2026 (development backend, fake keys, no real Razorpay account):

- Admin switch on and off; the switch stays disabled without keys.
- Checkout shows **Pay ₹309** for an India basket, keeps export baskets on requests, and rejects a 5-digit PIN code.
- With fake keys, Razorpay refuses the order and checkout shows "Online payment is not available right now".
- Webhook: unsigned, wrongly signed and changed bodies get 401. A signed failure, then a capture twice, then a late failure left one paid order with one alert.
- Not yet tested: a real Razorpay test-mode payment. That needs your test keys.

## Not built yet

- Refunds from `/admin` (use the Razorpay Dashboard).
- Customer email receipts from Floruvi (Razorpay sends its own).
- Cash on delivery (the refund policy says it is not offered).
- Online payment for export countries.
- SMS or email codes at checkout (waiting for MSG91 and DLT).
