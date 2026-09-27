# Backlog

Owner requests recorded on 27–28 September 2026, in agreed order. AGENTS.md asks for additions to be recorded here before they are built.

| # | Work | Status | Notes |
| --- | --- | --- | --- |
| 1 | Cart pill (Blinkit style) instead of toasts | Done | Floating "View cart" pill with item count & latest items. Hidden on cart & checkout; sits above the product page's fixed cart bar on phones. |
| 2 | Search visibility pass | Done | See [languages, countries & search](21-languages-and-seo.md). Open owner decisions are listed there. |
| 3 | Owner order notifications: Telegram & email | Built; needs owner keys | Telegram bot + Resend email with retries. Setup: [admin & order alerts](25-admin-and-order-alerts.md). |
| 4 | Admin panel | Built; needs live setup | `/admin`: five-detail sign-in (one scrypt hash), 14-day session, per-product in / out of stock, all orders. Setup: [admin & order alerts](25-admin-and-order-alerts.md). |
| 5 | Phone-number checkout with 6-digit SMS OTP | Needs provider (MSG91 recommended; DLT registration first) | Name & 10-digit mobile number required, address optional, no customer email. Cart & wishlist sync to the verified number. Replaces the email + phone code plan in AGENTS.md once the owner confirms the provider. |
| 6 | Support chatbot (OpenRouter, later WhatsApp) | Plan first | Phone + OTP gate, stored chats, platform-only answers, product search & add-to-cart tools, human takeover from the admin panel. Plan must be approved before building. |
| 7 | Wholesale & export tools | Proposed | Bulk quote page (company, country, products, monthly tonnes, frequency, port/Incoterms), downloadable catalogue & spec sheets, product feeds for Google Merchant Center & Meta, certificate display once certified. |
| 8 | Social media & marketplace channels | Research | [Growth channels research](22-growth-channels-research.md). |
| 9 | Website chat on/off switch | Done | Admin "Website chat" switch, hidden by default; minimal chat button & panel. The AI bot (item 6) will use the same switch. |
| 10 | Free gifts at ₹2,000 / ₹5,000 | Plan only | Recipe card and hemp tote. [Plan](27-free-gifts-plan.md) with image prompts; owner decides amounts & timing. |
