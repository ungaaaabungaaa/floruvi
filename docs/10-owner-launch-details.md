# Details needed to open online ordering

The public pages, images, basket, and checkout screens are built. The basket sends a private availability enquiry to Convex. No payment or customer account is created yet.

## 1. Products for the first sale

Send a short list of the crops you can supply now. The full 85-crop catalogue is a growing reference, not live stock.

| Crop | Pack size / unit | Price | Stock or weekly capacity | Harvest days |
| --- | --- | --- | --- | --- |
| Your crop | e.g. 100 g | Your price | Your quantity | Your days |

Confirm currency, whether prices include tax, business tax details where applicable, and any B2B minimum quantity. We will use these values on the server for stock and payment checks.

## 2. Delivery rules

- Cities and postal codes served.
- Delivery fee, free-delivery threshold, and minimum order.
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
