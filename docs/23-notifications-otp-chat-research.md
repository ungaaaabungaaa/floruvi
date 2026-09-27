# 23. Owner alerts, phone OTP and chat: providers and costs

Status: research only. No account was created and no provider was contacted. Prices change, so check them again before you pay. Each price, limit and rule has a source link. "Not verified" means that no primary source confirmed the item.

Terms: **owner alert** = a message to the owner when an order arrives. **OTP** = the 6-digit code that proves a buyer controls a mobile number. **DLT** = the TRAI registration for Indian SMS senders. **CSW** = WhatsApp's 24-hour customer service window.

## Summary & recommendations

Checked 27 September 2026.

| Need | Recommendation | Cost | Reason |
| --- | --- | --- | --- |
| Owner alert, primary | Telegram bot to the owner's chat or a private group | Free ([Telegram](https://core.telegram.org/bots)) | Instant phone push. No domain, template or approval. |
| Owner alert, backup | Resend email through the Convex Resend component | Free: 3,000 emails/month, 100/day ([Resend](https://resend.com/pricing)) | Already in the stack. Durable retries. |
| Phone OTP, sign up first | **MSG91** server API, with our own DLT header and template | ₹0.25 per OTP (5,000 pack) down to ₹0.18, plus 18% GST ([MSG91](https://msg91.com/in/pricing/otp)) | INR billing. Accepts our code, so Better Auth stays the only verifier. Voice retry. |
| Phone OTP, backup | **Fast2SMS** DLT route | ₹0.25 down to ₹0.11 per SMS; ₹100 minimum ([Fast2SMS](https://www.fast2sms.com/bulk-sms-pricing)) | Same DLT registration. A documented switch, not a second live route ([docs/01-stack.md](01-stack.md)). |
| Chat model, try first | `qwen/qwen3.7-flash` | $0.03 input / $0.13 output per million tokens | Cheapest tool-capable model: about $0.61 per 1,000 conversations. |
| Chat model, fallback | `openai/gpt-6-luna` | $0.10 / $0.50 | Three hosts. No training on API data by default. |
| Chat model, language fallback | `google/gemini-3.1-flash-lite` | $0.25 / $1.50 | Google lists all site languages. Paid-tier data is not used to improve Google products. |
| WhatsApp | Meta Cloud API directly; a Business Solution Provider (BSP) is optional | **From 1 October 2026:** 1,000 free service replies per number per month, then ₹0.115. Utility and authentication ₹0.115. Marketing ₹0.8631 ([Meta](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing)) | No BSP fee. |

Blockers, longest first:

1. **DLT registration.** No Indian SMS provider can deliver an OTP before the business registers as a principal entity, a header and an OTP template. It needs business documents and several working days. Start it first.
2. **A custom domain.** Without a verified domain, Resend sends only to the address that owns the Resend account.
3. **Project rules.** AGENTS.md and README.md still describe email OTP plus phone OTP. Update them after the owner confirms phone-only checkout (backlog item 5).

Example month (300 orders, 500 OTPs, 1,000 web chats): Telegram ₹0, Resend $0, MSG91 about ₹148 (500 × ₹0.295 incl. GST, from a prepaid 5,000 pack), chat model $0.61–$5.54. The DLT fee is extra.

## 1. Owner order notifications

Checked 27 September 2026.

| Channel | Cost | Limits and conditions | Fit |
| --- | --- | --- | --- |
| Telegram Bot API | Free ([bots](https://core.telegram.org/bots)) | About 1 message/second per chat; 20/minute in a group ([FAQ](https://core.telegram.org/bots/faq)). Text up to 4,096 characters ([API](https://core.telegram.org/bots/api)). | **Primary** |
| Resend | Free: 3,000/month, 100/day, 3 domains ([pricing](https://resend.com/pricing)). 10 requests/second per team ([limits](https://resend.com/docs/api-reference/rate-limit)). | Without a verified domain, other recipients get a 403 error ([errors](https://resend.com/docs/api-reference/errors)). | **Backup** |
| Brevo | Free: up to 300 emails/day after Brevo approves the account ([pricing FAQ](https://www.brevo.com/pricing/)) | Unauthenticated senders are reportedly rewritten to `@brevosend.com` (help page blocked automated reading; [search excerpt](https://help.brevo.com/hc/en-us/articles/14925263522578-Comply-with-Gmail-Yahoo-and-Microsoft-s-requirements-for-email-senders)) | Alternative |
| Zoho ZeptoMail (now on the Zoho CPaaS page) | 10,000 emails per credit; first credit free; credits expire in 6 months ([Zoho](https://www.zoho.com/zeptomail/pricing.html)) | Price per credit loads by region: not verified | Alternative |
| Amazon SES | $0.10 per 1,000; new AWS customers get up to $200 credit for 6 months ([pricing](https://aws.amazon.com/ses/pricing/)) | Sandbox: verified recipients only, 200 per 24 hours, 1/second ([docs](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html)) | Too much setup |
| Gmail SMTP + app password | Free | 500 emails/day ([Gmail](https://support.google.com/mail/answer/22839)) | Not recommended |
| Discord / Slack webhooks | Free | Discord: read limits from response headers ([Discord](https://docs.discord.com/developers/topics/rate-limits)). Slack: 1/second ([Slack](https://docs.slack.dev/apis/web-api/rate-limits)). | Only if the owner uses them |
| ntfy.sh | Free; 250/day per a third party ([Toolradar](https://toolradar.com/tools/ntfy)) | "The topic is essentially a password" ([ntfy](https://docs.ntfy.sh/publish/)) | Not for customer data |
| WhatsApp Cloud API | Utility template ₹0.115; free inside a CSW only until 30 September 2026 ([Meta](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing)) | New portfolios: 250 users per 24 hours outside a CSW ([limits](https://developers.facebook.com/docs/whatsapp/messaging-limits)) | Later, with the chatbot |

Gmail SMTP is fragile. App passwords need 2-Step Verification, stop working when the Google password changes, and "aren't recommended" by Google ([Google](https://support.google.com/accounts/answer/185833)). In Convex, SMTP needs a Node.js action; a community SMTP component requires `"use node"` ([Convex](https://www.convex.dev/components/vllnt/convex-email)). Convex does not document outbound SMTP.

WhatsApp alerts: from 1 October 2026 a utility template costs ₹0.115 inside or outside a CSW. A free-form alert inside an open CSW uses the free tier of 1,000 service messages per month. The CSW opens when the owner messages the business number.

**Recommendation:** Telegram first. Resend as backup: send to the Resend account address now, and to both owner inboxes after domain verification.

### Telegram setup (owner, about 10 minutes)

1. In Telegram, open **@BotFather** and send `/newbot`.
2. Enter a name and a username that ends in `bot`.
3. Save the token in the password manager. Anyone with it controls the bot ([features](https://core.telegram.org/bots/features)).
4. Open the bot and press **Start**. Bots cannot start chats ([bots](https://core.telegram.org/bots)).
5. For a staff group: create a private group, add the bot, and send `/start@<bot_username>`. In privacy mode, bots receive commands meant for them ([features](https://core.telegram.org/bots/features)).
6. Open `https://api.telegram.org/bot<TOKEN>/getUpdates`. It works only while no webhook is set ([API](https://core.telegram.org/bots/api)).
7. Copy `message.chat.id`. Group IDs are negative; keep the minus sign.
8. Share the token and ID with the developer through the password manager.

Developer notes:

- Use `sendMessage` with `parse_mode: "HTML"`. Escape `<`, `>` and `&` ([API](https://core.telegram.org/bots/api)). Store the chat ID as a string (up to 52 significant bits). A group that becomes a supergroup gets a new ID (`migrate_to_chat_id`).
- Cloud chats use client-server encryption, not end-to-end ([Telegram FAQ](https://telegram.org/faq)). Send the order number, items, total, city and an admin-page link. Ask the owner before adding the phone number or address. Update the privacy notice.
- In the order mutation, insert one alert record per channel and schedule an internal action. Scheduling is atomic with the mutation; scheduled actions run at most once ([Convex](https://docs.convex.dev/scheduling/scheduled-functions)). Retry from a scheduled mutation that checks the record.
- For email, use the [Convex Resend component](https://www.convex.dev/components/resend). It retries durably and manages idempotency keys.

Environment variables, set in Convex with separate development and production values:

| Variable | Secret | Value |
| --- | --- | --- |
| `TELEGRAM_BOT_TOKEN` | Yes | BotFather token. Replace it in BotFather if it leaks. |
| `TELEGRAM_OWNER_CHAT_ID` | Server-only | Chat or group ID, as a string |
| `RESEND_API_KEY` | Yes | Sending-only key (Resend has API key permissions, [pricing](https://resend.com/pricing)) |
| `OWNER_ALERT_EMAILS` | Personal data | Comma-separated. Before domain verification: the Resend account address only. |
| `ALERT_EMAIL_FROM` | No | `onboarding@resend.dev` now; later an address on the verified domain |
| `RESEND_WEBHOOK_SECRET` | Yes | Only if delivery webhooks are used |

These names are proposals. Confirm them against the installed versions ([docs/03-accounts.md](03-accounts.md)). Never give a secret a `NEXT_PUBLIC_` name.

## 2. Phone OTP providers

Checked 27 September 2026.

### Rules for every Indian SMS provider

- DLT registration and PE–TM (principal entity–telemarketer) chain binding are mandatory for OTP SMS. Entity registration costs ₹5,000 + GST ([MSG91 DLT FAQ](https://msg91.com/help/dlt-registration-in-india/dlt-faqs)). Third parties describe the Jio fee as annual ([example](https://www.smscountry.com/blog/jio-dlt-registration-guide/)).
- Non-bank OTP templates use the **Service Implicit** category ([MSG91 DLT FAQ](https://msg91.com/help/dlt-registration-in-india/dlt-faqs)). Transactional-category OTPs reach DND numbers at any hour ([Fast2SMS FAQ](https://www.fast2sms.com/help/otp-sms-whatsapp-faq/)).
- TRAI's direction of 18 November 2025 requires a tag on every template variable. After 60 days, operators reject messages from untagged templates ([TRAI PR 133/2025](https://www.trai.gov.in/sites/default/files/2025-11/PR_No.133_of_2025.PDF)). Tag the code as `{#numeric#}` ([tags](https://www.fast2sms.com/help/dlt-variable-tagging/)).
- **The business registers, not the provider.** No provider here offers a verified OTP template under our brand. Fast2SMS advertises a no-DLT route with a random numeric sender and fixed templates ([Fast2SMS](https://www.fast2sms.com/OTP-SMS-via-API-without-DLT-Registration)), but its own FAQ says OTP needs DLT. Do not use that route.

### Fit with Better Auth

- The `phoneNumber` plugin calls `sendOTP({ phoneNumber, code }, ctx)`. Defaults: 6 digits, 300-second expiry, 3 attempts ([Better Auth](https://www.better-auth.com/docs/plugins/phone-number)).
- `signUpOnVerification` needs `getTempEmail`. The owner wants no customer email, so use a placeholder that is never sent to or treated as verified.
- Convex lists Phone Number as a supported plugin ([Convex](https://labs.convex.dev/better-auth/supported-plugins)). Its Next.js guide pins `better-auth@~1.6.15` ([guide](https://labs.convex.dev/better-auth/framework-guides/next)). The repository has `convex` 1.45.0 and no Better Auth package yet.
- Better Auth must be the only verifier ([docs/01-stack.md](01-stack.md)). MSG91's SendOTP API accepts our `otp` value ([client](https://github.com/craftsys/msg91-php)). Fast2SMS's DLT API takes `variables_values` ([Fast2SMS](https://www.fast2sms.com/help/how-to-send-dlt-sms-via-api/)). Do not use widgets that create and check their own codes.

### Comparison

| Provider | Price per OTP to India | DLT | Fallback channels | Abuse controls | Fit |
| --- | --- | --- | --- | --- | --- |
| **MSG91** | ₹0.25 (5,000), ₹0.22 (15,000), ₹0.20 (27,000), ₹0.19 (53,685), ₹0.18 (105,264+), plus 18% GST ([pricing](https://msg91.com/in/pricing/otp)). No widget fee ([widget](https://msg91.com/in/pricing/otpwidget)). Free credit: not verified. | Ours, mapped in MSG91 | Voice retry ([client](https://github.com/craftsys/msg91-php)); WhatsApp, email ([help](https://msg91.com/help/sendotp/why-otp-reliability-is-important-)) | reCAPTCHA in the widget only; API needs our limits | **Sign up first** |
| **Fast2SMS** | ₹0.25 (₹100–3,999 wallet) down to ₹0.11 (₹6 lakh+) ([pricing](https://www.fast2sms.com/bulk-sms-pricing)). GST not stated. | Ours | WhatsApp OTP ₹0.25 ([FAQ](https://www.fast2sms.com/help/otp-sms-whatsapp-faq/)) | Guidance only | **Backup** |
| 2Factor.in | From $0.0020 per delivered OTP; free trial ([listing](https://sourceforge.net/software/product/2Factor/)). Site blocks automated reading: not verified. | Not verified | Voice; operator failover (listing) | Not verified | Maybe later |
| Twilio Verify | $0.05 per verification ([Verify](https://www.twilio.com/en-us/verify/pricing)) + $0.0832 per India SMS ([SMS](https://www.twilio.com/en-us/sms/pricing/in)) = $0.1332 | Ours; sender ID takes 10 business days. International route: no DLT, random sender ([India](https://www.twilio.com/en-us/guidelines/in/sms)) | Voice, WhatsApp, email | Fraud Guard on by default ([Twilio](https://www.twilio.com/docs/verify/preventing-toll-fraud/sms-fraud-guard)) | Too expensive; checks its own codes |
| Exotel | Not published ([Exotel](https://developer.exotel.com/docs/sms-support/sms-pricing)) | Ours | Voice | Not verified | Enterprise sales |
| Gupshup | Not published; about ₹0.17 per a third party ([Codingclave](https://codingclave.com/blog/gupshup-sms-pricing-india-2026)) | Ours | WhatsApp | Not verified | Enterprise sales |
| Kaleyra (Tata Communications) | Custom quote ([Kaleyra](https://www.kaleyra.com/kaleyra-custom-quote/)) | Ours | Not verified | Not verified | Enterprise sales |
| Firebase Phone Auth | $0.07 per SMS to India; first 10 SMS/day free; Blaze plan ([Identity Platform](https://cloud.google.com/identity-platform/pricing), [Firebase](https://firebase.google.com/pricing)) | Not stated | None | reCAPTCHA, SMS region controls | No: a second identity system |
| WhatsApp authentication template | ₹0.115 per delivered message ([Meta](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing)) | Not needed | SMS | Meta rules | Later, second channel |

Setup time: DLT takes days (below). After DLT, MSG91 and Fast2SMS need about an hour (our estimate). Twilio needs 10 business days for a sender ID. Enterprise vendors start with a sales process.

WhatsApp OTP cautions: the text is fixed (`<VERIFICATION_CODE> is your verification code`, [Meta](https://developers.facebook.com/docs/whatsapp/business-management-api/authentication-templates)). MSG91 says Meta allows authentication templates only for verified, higher-tier accounts with 2,000+ business-initiated conversations ([MSG91](https://msg91.com/help/whatsapp/whatsapp-otp)). Meta's page did not confirm this. Plan for business verification first.

Cost at 1,000 OTPs per month: MSG91 ₹295 incl. GST; Twilio Verify $133.20.

**Recommendation:** sign up with **MSG91**. Configure **Fast2SMS** with the same DLT header and template as the backup. One setting selects the provider; do not send through both. Add WhatsApp OTP after Meta business verification.

### Sign-up and DLT checklist

Owner:

1. Collect the business PAN, a GST certificate or other business registration, the authorised person's ID, and an authorisation letter on letterhead ([list](https://www.fast2sms.com/help/jio-dlt/)).
2. Register as a principal entity on one operator portal, for example [Jio TrueConnect](https://trueconnect.jio.com). Pay ₹5,000 + GST.
3. Wait for the entity ID. One guide reports 15 minutes to 72 hours for Jio, and 24–48 hours for each template ([SMSCountry](https://www.smscountry.com/blog/jio-dlt-registration-guide/)).
4. Register a 6-letter header. Proposal: `FLORVI` (availability not checked).
5. Register one Service Implicit template without a link. Proposal: `{#numeric#} is your Floruvi checkout code. It expires in 5 minutes. Do not share it. - Floruvi`.
6. Open an MSG91 account and complete KYC.
7. Buy the smallest listed OTP pack (5,000 OTPs: ₹1,250 + GST).
8. In MSG91, add the entity ID and header.
9. In MSG91, create the OTP template with `##OTP##` and the DLT template ID ([MSG91](https://msg91.com/help/sendotp/where-to-find-the-sendotp-api-how-to-get-template-id)).
10. On the DLT portal, bind MSG91's telemarketer ID to the entity.
11. Send test codes to Jio, Airtel, Vi, BSNL and one DND number.
12. Repeat steps 8–11 for Fast2SMS. Then switch it off.

Developer:

1. Install Better Auth with the Convex component at the pinned version.
2. Configure `phoneNumber`: 6 digits, 300 seconds, 3 attempts.
3. Accept only `+91` numbers with 10 digits that start with 6–9 ([numbering](https://en.wikipedia.org/wiki/Mobile_telephone_numbering_in_India)).
4. In `sendOTP`, await the MSG91 call. Convex may not finish unawaited work ([Convex](https://docs.convex.dev/functions/actions)). Better Auth advises against awaiting because of timing attacks, but here every number takes the same send path.
5. Do not pass codes through the scheduler: Convex keeps scheduled-function arguments for 7 days ([Convex](https://docs.convex.dev/scheduling/scheduled-functions)).

| Variable (Convex) | Secret | Value |
| --- | --- | --- |
| `BETTER_AUTH_SECRET`, `SITE_URL` | First only | From the Convex guide |
| `SMS_PROVIDER` | No | `msg91` or `fast2sms` |
| `MSG91_AUTH_KEY` | Yes | MSG91 API key |
| `MSG91_OTP_TEMPLATE_ID` | No | MSG91 template linked to the DLT template |
| `FAST2SMS_API_KEY` | Yes | Backup |
| `FAST2SMS_SENDER_ID`, `FAST2SMS_DLT_MESSAGE_ID` | No | Backup |

## 3. LLMs on OpenRouter (+ WhatsApp pricing)

Checked 27 September 2026. Data comes from the [OpenRouter models API](https://openrouter.ai/api/v1/models) and its endpoint lists. Every model below supports `tools` and `tool_choice`.

| Model ID | $ per million tokens, in / out | Context | Hosts / note |
| --- | --- | --- | --- |
| `qwen/qwen3.7-flash` | 0.03 / 0.13 (0.10 / 0.40 above 32K prompt tokens) | 1,000,000 | Alibaba only (Singapore headquarters; SG and CN data centres) |
| `deepseek/deepseek-v4-flash` | 0.0469 / 0.0938 | 1,048,576 | Baidu (CN). DeepInfra (US): 0.09 / 0.18 |
| `z-ai/glm-5.3-flash` | 0.045 / 0.14 | 1,310,720 | InferenceNet, 4-bit. Z.AI: 0.15 / 0.50 |
| `deepseek/deepseek-v4.1-flash` | 0.035 / 0.29 | 1,048,576 | InferenceNet. DeepSeek (CN): 0.15 / 0.60 |
| `openai/gpt-5-nano` | 0.05 / 0.40 | 400,000 | OpenAI, Azure |
| `google/gemma-4-26b-a4b-it` | 0.0675 / 0.225 | 262,144 | Many hosts; `:free` variant exists |
| `openai/gpt-6-luna` | 0.10 / 0.50 (flex 0.05 / 0.25) | 1,050,000 | OpenAI, Azure, Bedrock; released 22 September 2026 |
| `mistralai/mistral-small-2603` | 0.15 / 0.60 | 262,144 | Mistral, with a zero-retention endpoint |
| `google/gemini-3.1-flash-lite` | 0.25 / 1.50 (flex 0.125 / 0.75) | 1,048,576 | Google ([pricing](https://ai.google.dev/gemini-api/docs/pricing)) |
| `google/gemini-2.5-flash-lite` | 0.10 / 0.40 | 1,048,576 | **Avoid:** listed expiry 20 October 2026 |

OpenRouter shows one price per model, usually a low-cost host. A privacy filter can remove that host and raise the price.

Languages: Google states that all Gemini models understand and respond in a list that includes every site language: Arabic, Bengali, Dutch, German, Hindi, Japanese, Malay, Nepali, Sinhala and Uzbek ([Google Cloud](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/google-models)). Qwen3 was trained on 119 languages and dialects ([Wikipedia](https://en.wikipedia.org/wiki/Qwen)). Qwen3.7 Flash and GPT-6 Luna publish no language list. **Hindi and Arabic quality is not verified.** Run a 30-prompt English, Hindi and Arabic test before choosing.

Data policy:

- OpenRouter keeps no prompts unless you enable logging; each host's policy applies ([ZDR](https://openrouter.ai/docs/features/zdr)).
- Send `provider: { data_collection: "deny" }` to skip hosts that store or train on data, or `zdr: true` for zero-retention hosts ([routing](https://openrouter.ai/docs/features/provider-routing)). Test each model with the filter; a single-host model may fail.
- OpenAI does not train on API data by default and keeps abuse logs up to 30 days ([OpenAI](https://developers.openai.com/api/docs/guides/your-data)). Google's paid tier does not use content to improve products; its free tier does ([Gemini](https://ai.google.dev/gemini-api/docs/pricing)).

Free variants: examples are `google/gemma-4-31b-it:free`, `qwen/qwen3.8-27b:free`, `nvidia/nemotron-3-super-120b-a12b:free` and the random router `openrouter/free`. Limits: 20 requests/minute and 50/day, or 1,000/day after $10 of lifetime purchases. Paid models have no platform cap ([limits](https://openrouter.ai/docs/api_reference/limits)). Training permission is a separate setting for free models ([logging](https://openrouter.ai/docs/guides/privacy/provider-logging)); third parties say most free hosts require it (not verified). **Do not use free models for customer chats** ([docs/04-chat.md](04-chat.md)). Use them only with invented test data.

### Monthly cost estimate

Assumptions per conversation: 6 model calls, 15,000 input and 1,000 output tokens, lowest reasoning setting, plus OpenRouter's 5.5% fee ([pricing](https://openrouter.ai/pricing)). The system prompt and 4 tools (about 1,500 tokens) repeat in each call. "Cached" bills 60% of input at the cache-read price and ignores small cache-write charges.

| Model | 1,000 conversations | 10,000 | 1,000 cached | 10,000 cached |
| --- | --- | --- | --- | --- |
| `qwen/qwen3.7-flash` | $0.61 | $6.12 | $0.38 | $3.84 |
| `deepseek/deepseek-v4-flash` | $0.84 | $8.41 | $0.48 | $4.85 |
| `openai/gpt-5-nano` | $1.21 | $12.13 | $0.79 | $7.86 |
| `openai/gpt-6-luna` | $2.11 | $21.10 | $1.26 | $12.55 |
| `mistralai/mistral-small-2603` | $3.01 | $30.07 | $1.72 | $17.25 |
| `google/gemini-3.1-flash-lite` | $5.54 | $55.39 | $3.40 | $34.02 |

Reasoning tokens bill as output ([reasoning](https://openrouter.ai/docs/use-cases/reasoning-tokens)). 3,000 extra per conversation add $0.39 (Qwen), $1.50 (GPT-6 Luna) or $4.50 (Gemini) per 1,000 conversations.

Cost controls:

- **Caching:** OpenAI, DeepSeek and Z.AI cache automatically; Gemini and Qwen need `cache_control` breakpoints; OpenAI needs 1,024+ tokens ([caching](https://openrouter.ai/docs/features/prompt-caching)). Keep the system prompt and tools identical and first.
- **Reasoning:** use the lowest `reasoning.effort` or cap `reasoning.max_tokens`. `max_tokens` covers reasoning plus the reply.
- **Length:** cap replies near 300 tokens, return at most 5 products, and summarise old turns.
- **Fallback:** send `models: [primary, fallback]`; billing follows the model that answered ([fallbacks](https://openrouter.ai/docs/guides/routing/model-fallbacks)).
- **Budget:** set a monthly cap with OpenRouter's budget controls ([pricing](https://openrouter.ai/pricing)).

**Top three:** (1) `qwen/qwen3.7-flash`, cheapest, single host; (2) `openai/gpt-6-luna` as the fallback, new, so test it; (3) `google/gemini-3.1-flash-lite` if the others fail the Hindi or Arabic test. The model only proposes tool calls; our code runs them ([tools](https://openrouter.ai/docs/guides/features/tool-calling)).

### WhatsApp Business Platform pricing in India

Source: Meta's current INR rate card (from 1 July 2026) and its published INR card for 1 October 2026, both on the [Meta pricing page](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing). **The rules change three days after this check.**

| Message type (India) | Until 30 September 2026 | From 1 October 2026 |
| --- | --- | --- |
| Service (free-form reply inside a CSW) | Free | 1,000 free per business number per month, then ₹0.115 |
| Utility template | ₹0.115; free inside a CSW | ₹0.115, also inside a CSW |
| Authentication template | ₹0.115 | ₹0.115 |
| Marketing template | ₹0.8631 | ₹0.8631 |
| Authentication-international | ₹2.4971 | ₹2.4971 |

- All messages are free for 72 hours after a user starts a chat from a click-to-WhatsApp ad or a Facebook Page button.
- Authentication-international does not apply: a business always pays the domestic rate of its own country ([Meta](https://developers.facebook.com/docs/whatsapp/pricing/authentication-international-rates)).
- Without a payment method, Meta stops service messages after the free tier. List rates apply up to 25 million utility and 750,000 authentication messages per month.
- India-eligible businesses must move all WhatsApp Business Accounts (WABAs) to INR billing by 31 December 2026 ([Meta](https://developers.facebook.com/docs/whatsapp/pricing/updates-to-pricing)). Third parties report 18% GST on Meta charges ([example](https://myoperator.com/blog/whatsapp-business-api-pricing-india-2026)); check the first invoice.
- **A BSP is not required.** Without a partner, attach a payment method to the WABA ([Meta](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/overview/)). Partners add fees; Zoho adds 10% ([Zoho](https://www.zoho.com/zeptomail/pricing.html)). Keeping the WhatsApp Business app on the same number needs a Solution Partner or Tech Provider ([Meta](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users/)).
- Chatbot cost from 1 October 2026, at 4 bot replies per conversation: 1,000 conversations = 3,000 paid replies = ₹345/month; 10,000 = 39,000 × ₹0.115 = ₹4,485/month. This exceeds the model cost. Send one reply per customer turn.

## 4. Security notes

Checked 27 September 2026.

OTP:

- Validate the number on the server before sending: `+91`, 10 digits, first digit 6–9.
- Limit sends (proposal): 3 per number per 15 minutes and 10 per day; 10 per IP per hour; a daily site cap. Enforce them in Convex so direct callers are limited too ([rate limiter](https://www.convex.dev/components/rate-limiter)).
- Better Auth's default rate-limit store is memory, which is unsuitable for serverless. Use database storage with `customRules` for `/phone-number/send-otp` and `/phone-number/verify` ([Better Auth](https://www.better-auth.com/docs/concepts/rate-limit)).
- Keep 6 digits, 5 minutes and 3 attempts. Add a 30–60 second resend cooldown.
- SMS pumping sends SMS to numbers that pay fraudsters ([Twilio](https://www.twilio.com/docs/glossary/what-is-sms-pumping-fraud)). Allow Indian numbers only. Watch sends versus successful verifications. Alert the owner above a daily threshold. Keep a small prepaid balance without auto-recharge.
- Add a bot check to the send step; [Vercel BotID](https://vercel.com/docs/botid) Basic is free on all plans.
- Never log codes. Show the same response for every number.

Owner alerts:

- Keep tokens in the Convex environment only. Rotate a leaked token at once. Slack revokes leaked webhook URLs ([Slack](https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks/)).
- Send minimal personal data. Never send orders to public ntfy topics.
- Keep one alert record per order per channel, so retries cannot send twice.
- If the bot later accepts commands, set a webhook `secret_token`, check `X-Telegram-Bot-Api-Secret-Token` ([API](https://core.telegram.org/bots/api)), and accept only the owner's chat ID.

WhatsApp and chatbot:

- Verify `X-Hub-Signature-256` (HMAC-SHA256 of the raw body with the app secret) and the setup verify token ([Meta](https://developers.facebook.com/docs/graph-api/webhooks/getting-started)).
- Use a system-user token, not the temporary token ([Meta](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)). Deduplicate message IDs.
- Call OpenRouter only from Convex actions. Keep the key out of the browser.
- Validate every proposed tool call in code ([docs/04-chat.md](04-chat.md)). Order status uses only the verified session's number, never a number typed in chat. `addToCart` takes public product IDs; the server sets prices.
- Cap tokens per conversation and conversations per number per day. A human takeover stops bot replies.

## Open questions for the owner

1. Which legal entity registers on DLT, and which documents exist (PAN, GST)?
2. Is `FLORVI` acceptable as the SMS header?
3. Do you approve the DLT fee (₹5,000 + GST) and the first MSG91 pack (₹1,475 incl. GST)?
4. Should alerts go to your chat or a staff group? May alerts show the buyer's phone and address?
5. When will the custom domain be ready for Resend?
6. Do you confirm phone-only checkout, so AGENTS.md and README.md can drop email OTP?
7. What is the monthly chat budget? May chats go to hosts in China?
8. For WhatsApp: a new number? Meta business verification? May the bot trust the WhatsApp sender number for order status?
9. Who will review the English, Hindi and Arabic chat test?

## Sources

Read 27–28 September 2026. Links also appear inline.

- Telegram: [Bots](https://core.telegram.org/bots), [FAQ](https://core.telegram.org/bots/faq), [features](https://core.telegram.org/bots/features), [Bot API](https://core.telegram.org/bots/api), [Telegram FAQ](https://telegram.org/faq)
- Email: [Resend pricing](https://resend.com/pricing), [Resend limits](https://resend.com/docs/api-reference/rate-limit), [Resend errors](https://resend.com/docs/api-reference/errors), [Convex Resend](https://www.convex.dev/components/resend), [Brevo](https://www.brevo.com/pricing/), [Zoho](https://www.zoho.com/zeptomail/pricing.html), [SES pricing](https://aws.amazon.com/ses/pricing/), [SES sandbox](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html), [app passwords](https://support.google.com/accounts/answer/185833), [Gmail limits](https://support.google.com/mail/answer/22839)
- Webhooks: [Discord](https://docs.discord.com/developers/topics/rate-limits), [Slack limits](https://docs.slack.dev/apis/web-api/rate-limits), [Slack webhooks](https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks/), [ntfy](https://docs.ntfy.sh/publish/)
- SMS and DLT: [MSG91 OTP](https://msg91.com/in/pricing/otp), [MSG91 widget](https://msg91.com/in/pricing/otpwidget), [MSG91 DLT FAQ](https://msg91.com/help/dlt-registration-in-india/dlt-faqs), [MSG91 WhatsApp OTP](https://msg91.com/help/whatsapp/whatsapp-otp), [Fast2SMS pricing](https://www.fast2sms.com/bulk-sms-pricing), [Fast2SMS FAQ](https://www.fast2sms.com/help/otp-sms-whatsapp-faq/), [Twilio Verify](https://www.twilio.com/en-us/verify/pricing), [Twilio India SMS](https://www.twilio.com/en-us/sms/pricing/in), [Twilio India rules](https://www.twilio.com/en-us/guidelines/in/sms), [Identity Platform](https://cloud.google.com/identity-platform/pricing), [TRAI PR 133/2025](https://www.trai.gov.in/sites/default/files/2025-11/PR_No.133_of_2025.PDF), [SMSCountry Jio DLT guide](https://www.smscountry.com/blog/jio-dlt-registration-guide/)
- Auth and backend: [Better Auth phone](https://www.better-auth.com/docs/plugins/phone-number), [Better Auth rate limit](https://www.better-auth.com/docs/concepts/rate-limit), [Convex plugins](https://labs.convex.dev/better-auth/supported-plugins), [Convex guide](https://labs.convex.dev/better-auth/framework-guides/next), [Convex actions](https://docs.convex.dev/functions/actions), [Convex scheduling](https://docs.convex.dev/scheduling/scheduled-functions), [Vercel BotID](https://vercel.com/docs/botid)
- LLM: [models API](https://openrouter.ai/api/v1/models), [limits](https://openrouter.ai/docs/api_reference/limits), [pricing](https://openrouter.ai/pricing), [caching](https://openrouter.ai/docs/features/prompt-caching), [reasoning](https://openrouter.ai/docs/use-cases/reasoning-tokens), [routing](https://openrouter.ai/docs/features/provider-routing), [ZDR](https://openrouter.ai/docs/features/zdr), [fallbacks](https://openrouter.ai/docs/guides/routing/model-fallbacks), [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing), [Gemini languages](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/google-models), [OpenAI data](https://developers.openai.com/api/docs/guides/your-data), [Qwen](https://en.wikipedia.org/wiki/Qwen)
- WhatsApp: [Meta pricing and rate cards](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing), [updates](https://developers.facebook.com/docs/whatsapp/pricing/updates-to-pricing), [authentication-international](https://developers.facebook.com/docs/whatsapp/pricing/authentication-international-rates), [limits](https://developers.facebook.com/docs/whatsapp/messaging-limits), [webhooks](https://developers.facebook.com/docs/graph-api/webhooks/getting-started), [coexistence](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users/)
