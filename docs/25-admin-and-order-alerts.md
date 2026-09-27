# Owner admin panel & order alerts

Built 28 September 2026. Provider research: [notifications, OTP & chat](23-notifications-otp-chat-research.md).

## What it does

- **`/admin`** shows all orders & enquiries (newest 200): customer, phone, email, delivery area, items, basket total, payment status and alert status. It also has an **In stock / Out of stock** switch for every product. No quantities are tracked.
- **Out of stock** products stay on the site with an "Out of stock" label. They cannot be added to a basket, and the server basket check blocks checkout if one is already in a basket.
- **Website chat switch:** shows or hides the chat button for all visitors (hidden by default). Today it shows the existing catalogue guide on the English site versions. A change reaches visitors within about a minute.
- **Order alerts:** each saved enquiry sends a Telegram message and an email to the owner, when those channels are set up. A failed channel retries after 1 and 5 minutes. A sent channel is never sent twice. The admin panel shows each result: sent, failed or off.

Payment is not taken online yet, and checkout does not ask for a street address. The panel says so on every order. Razorpay payment details will appear here when payments are built.

## Security

- **Sign-in:** email, password, Aadhaar number (12 digits), date of birth and 10-digit mobile number. All five are hashed together with scrypt (N=2^17, r=8, p=1, 128 MiB) into one value, `ADMIN_CREDENTIAL_HASH`. The details themselves are never stored. One combined hash means a leak cannot be cracked one weak field at a time, and a failed sign-in never says which field was wrong.
- **Where the check runs:** in a Convex Node action. The Next.js server calls Convex HTTP routes with `ADMIN_API_SECRET`; the Convex functions behind them are internal, so nobody can call them from a browser.
- **Sign-in limits:** 10 attempts an hour from one address and 30 an hour in total. They are counted before the check, so parallel guesses cannot slip past. A successful sign-in clears the address's count.
- **Session:** a random 256-bit token in an httpOnly, SameSite=Lax cookie (`__Host-` prefixed and Secure on the live site). Convex stores only its SHA-256 hash and checks it on every call. "Keep me signed in for 14 days" is ticked by default; without it, the cookie ends with the browser and the server ends the session after 12 hours. Sign out deletes the session on the server.
- The admin pages send `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet` (as do `/api/` responses), are never linked from public pages or listed in the sitemap, and sit outside the country-version routing. They are deliberately not named in `robots.txt`, because that file is public and scrapers read it to find hidden paths.
- Aadhaar numbers, dates of birth and phone numbers are not secret, so the password carries most of the protection. Use a long passphrase on the live site. A later step could add an authenticator-app code.

Assumption, not yet confirmed by the owner: these owner sessions are managed in Convex. AGENTS.md assigns identities & sessions to Better Auth. That still applies to customer phone sign-in, which is not built yet.

## Set up the live site

1. **Make the secret.** Run `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`. Put the value in Vercel (Production) as `ADMIN_API_SECRET`, and pipe the same value into `pnpm exec convex env set ADMIN_API_SECRET --prod`.
2. **Make your sign-in hash.** Run `pnpm admin:hash`, answer the five questions (the password & Aadhaar are hidden), then set the printed value: `pnpm exec convex env set ADMIN_CREDENTIAL_HASH '<value>' --prod`.
3. **Set the site link for alerts:** `pnpm exec convex env set SITE_URL https://floruvi.vercel.app --prod` (or the custom domain).
4. **Deploy Convex first, then the site:** `pnpm exec convex deploy`, then push to `main`. The site works before step 4 is done, but `/admin` shows "not available" until both sides share the secret.

To change the password later, repeat step 2. To sign out everywhere, change `ADMIN_API_SECRET` in both places or delete rows in the `adminSessions` table.

## Connect Telegram (free, recommended first)

1. In Telegram, open **@BotFather**, send `/newbot` and follow the steps. Copy the bot token.
2. Open your new bot and send it any message (or add it to a group with the people who handle orders).
3. Open `https://api.telegram.org/bot<TOKEN>/getUpdates` in a browser. Copy `chat.id` from the result (group IDs start with `-`).
4. Set both in Convex: `TELEGRAM_BOT_TOKEN` and `TELEGRAM_OWNER_CHAT_ID` (add `--prod` for the live site).

## Connect email (Resend free plan: 3,000 emails a month, 100 a day)

1. Create a Resend account with the address that should receive alerts. Create a **sending access** API key.
2. Set in Convex: `RESEND_API_KEY`, `ALERT_EMAIL_FROM` (`onboarding@resend.dev` until a domain is verified) and `OWNER_ALERT_EMAILS` (comma-separated).
3. Until a domain is verified in Resend, it only delivers to the Resend account's own address. Verify the domain when the custom domain is live, then add the second inbox.

The reply-to address of each alert email is the customer's email.

## Before switching alerts on

Update the privacy notice: enquiry details are sent to the owner through Telegram and email. The README email checklist already lists this.

## Local testing

`.env.local` has a development `ADMIN_API_SECRET`, and the development Convex deployment has a matching secret and a test sign-in hash. The local test details are noted in `.env.local`. Tests: `pnpm test` covers the hash, tampered and weak hashes, alert escaping and the out-of-stock rule. Live checks on 28 September 2026 covered sign-in, wrong details, the 11th-attempt limit, forged tokens, sign-out revocation, the stock switch on the product page, the shop and the basket check, and alert status with no channel and with a failing channel.
