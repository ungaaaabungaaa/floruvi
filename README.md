# Floruvi Farm

Fresh produce store for homes and businesses. Live: [floruvi.com](https://floruvi.com) · Owner panel: [floruvi.com/admin](https://floruvi.com/admin)

## 1. Keys to add

Never put key values in this repo.

- **Vercel:** Settings → Environment Variables → Production. Mark secrets Sensitive, then redeploy.
- **Convex:** `pbpaste | pnpm exec convex env set NAME --prod` (copy the value first, so it is not typed on screen).

| Key | Where | Needed for | Get it from | Status |
| --- | --- | --- | --- | --- |
| `ADMIN_CREDENTIAL_HASH` | Convex | Admin sign-in | `pnpm -s admin:hash \| pnpm exec convex env set ADMIN_CREDENTIAL_HASH --prod` | ⬜ |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_OWNER_CHAT_ID` | Convex | Order alerts | Telegram @BotFather ([steps](docs/25-admin-and-order-alerts.md)) | ⬜ |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Convex | Payments | Razorpay → API Keys (test keys first) | ⬜ |
| `RAZORPAY_WEBHOOK_SECRET` | Convex | Payments | Razorpay → Webhooks ([steps](docs/29-razorpay-payments.md)) | ⬜ |
| `SUPPORT_EMAIL`, `SUPPORT_PHONE`, `BUSINESS_ADDRESS` | Vercel | Contact page, footer & search data (Razorpay checks them) | You | ⬜ |
| `INSTAGRAM_URL`, `FACEBOOK_URL` (optional `YOUTUBE_URL`, `LINKEDIN_URL`, `X_URL`) | Vercel | Footer links & Google's brand profile (`sameAs`). Full `https://` address | Your profile pages | ⬜ |
| `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION` | Vercel | Search Console / Bing ownership (HTML-tag method; only the code in `content="…"`). Not needed with DNS verification | Search Console, Bing Webmaster Tools | ⬜ |
| `OPENROUTER_API_KEY` | Vercel | AI chat (GPT-6 Luna, backup Gemini 3.1 Flash-Lite) | openrouter.ai → set the key's monthly limit to **US$5** | ⬜ |
| `CHAT_MONTHLY_BUDGET_USD`, `CHAT_DAILY_LIMIT_PER_CHAT_USD` | Convex | Optional: chat spend limits (defaults $5 a month, $0.05 per chat a day) | – | Optional |
| `OPENAI_API_KEY`, optional `EXA_API_KEY` and `APOLLO_API_KEY` | Convex | Admin buyer, tender, export and contact research | Provider dashboards; [Growth setup](docs/31-growth-tools-plan.md#setup-the-built-workspace) | Needs setup |
| `GROWTH_RESEARCH_ENABLED`, `GROWTH_MONTHLY_BUDGET_USD`, `GROWTH_APOLLO_MONTHLY_CREDITS` | Convex | Research activation and limits | Defaults: off, US$10/month, zero Apollo credits | Needs owner limits |
| `GROWTH_MCP_TOKEN` | Vercel + Convex | Scoped Codex read and draft tools | A dedicated random token; [setup](docs/31-growth-tools-plan.md#setup-the-built-workspace) | Optional |
| `GROWTH_MERCHANT_FEED_ENABLED` | Convex | Eligible India offers at `/feeds/google.xml` | Enable after live checkout and listing review | Off by default |
| SMS gateway keys | Convex | SMS codes from your SIM | [Own-SIM SMS codes](docs/30-own-sim-sms-otp.md) | Later |
| `CONVEX_DEPLOY_KEY` | Vercel | Optional: deploy Convex on every push (build command `pnpm build:vercel`) | Convex dashboard → Settings | Optional |
| `BUSINESS_NAME` = Floruvi | Vercel | Contact page & footer | – | ✅ |
| `ADMIN_API_SECRET`, `LEAD_INGEST_SECRET` | Vercel + Convex | Site ↔ backend | – | ✅ |
| `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL`, `NEXT_PUBLIC_SITE_URL` | Vercel | Site | – | ✅ |
| `SITE_URL` | Convex | Links in alerts | – | ✅ |

## 2. To do (you)

- [x] **Backend deployed:** the Growth schema and functions are on the existing production Convex project. Provider credentials and owner setup remain separate (table above).
- [ ] **Razorpay:** finish KYC & bank details → add the keys & webhook → turn **Online payment** on in `/admin` → one test order → live keys. Policy pages are done. [Guide](docs/29-razorpay-payments.md)
- [ ] **Alerts:** create the Telegram bot (orders, payments and chat hand-offs). [Guide](docs/25-admin-and-order-alerts.md)
- [ ] **Chat:** OpenRouter key (US$5 monthly limit) → turn **Website chat** on → test 20–50 questions (English, Hindi, Arabic). Spend per chat shows in `/admin/chats`. [Guide](docs/26-chatbot-plan.md)
- [ ] **SMS codes:** set up an old Android phone with your Floruvi SIM as the SMS gateway. [Guide](docs/30-own-sim-sms-otp.md)
- [ ] **Stock:** mark products in or out of stock in `/admin`.
- [ ] **Testimonials:** collect real ones with permission, then replace the current quotes.
- [ ] **Claims:** say "organic" or "pesticide-free" only with a certificate or lab report. Check "No harmful chemicals" and "Locally grown".
- [ ] **Photos:** replace the generated images with real farm and product photos.
- [ ] **Search:** verify the site in Google Search Console and Bing, submit `/sitemap.xml`.
- [ ] **Registrations:** FSSAI and GSTIN (IEC and APEDA for export), with a professional. Trademark check for "Floruvi".
- [ ] **Translations:** a native speaker reviews a language before you advertise in that country.
- [ ] **Growth:** open `/admin/growth`, enter the supply profile, then configure and test the selected APIs. The workspace includes 11 buyer groups, defence/public tenders, OpenAI/Exa research, Apollo contacts, drafts and Codex access. [Setup and remaining gates](docs/31-growth-tools-plan.md#setup-the-built-workspace). Channel readiness records do not connect marketplace accounts; GA4/PostHog events and sales delivery are later work.

## 3. Build next (dev)

- [ ] Phone sign-in with SMS codes at checkout and in the chat; the basket and wishlist follow the verified number.
- [ ] Distance-based delivery charge (replaces the flat ₹99).
- [ ] "Share your experience" form for real testimonials, shown after your approval.
- [ ] Free gifts at ₹2,000 and ₹5,000. Needs your answers. [Plan](docs/27-free-gifts-plan.md)
- [ ] Validate product delivery and return search data in Google Rich Results Test. Review and enable the gated Google Merchant feed; Meta catalogue sync remains later work. [Catalogue SEO](docs/32-programmatic-seo.md)
- [ ] Wholesale quote page; WhatsApp for the chat (later).

## Shipping: things to watch

Now: every PIN code in India, within 2 days, flat ₹99, no cash on delivery, refunds only for our mistakes.

- Real cost per delivery above ₹99 for far PIN codes → build the distance charge.
- A late order (over 2 days) must be refunded → count late orders every week.
- Greens wilt in heat → insulated packs; send test parcels to new regions.
- Couriers may refuse fresh produce → get written approval first.
- No cash on delivery → watch how many people leave at checkout.

## More

[Backlog](docs/24-backlog.md) · [Shipping & languages](docs/28-shipping-and-languages-research.md) · [Search](docs/21-languages-and-seo.md) · [Run locally](docs/08-running-the-app.md) (`pnpm install`, `pnpm dev`) · [Project rules](AGENTS.md)
