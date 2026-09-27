# 30. Own-SIM SMS codes through an Android gateway phone

Status: research and proposals only. Nothing was installed, bought or configured, no account was created, and no one was contacted. Check rules and prices again before you act.

The owner wants to send checkout and sign-in codes by SMS from the farm's own business SIM, through an open-source app on a spare Android phone, until MSG91 and TRAI DLT registration are affordable ([OTP research](23-notifications-otp-chat-research.md)). The owner knows the reliability and legal risks.

Labels: **Fact [S#]** = a source states it ([Sources](#sources)). **Assessment** = our reading of the facts. **Proposal** = a suggestion; the owner decides. **Secondary** or **search result** = a weaker source: a blog, news, a vendor claim, or a page we could not open.

Terms: **code** = the 6-digit one-time password (OTP). **Gateway phone** = the spare Android phone with the business SIM. **Relay** = the app vendor's server that passes a send request to the phone. **DLT** = TRAI's registry for business SMS senders. **UTM** = unregistered telemarketer. **SIM budget** = the most codes the site may send from the SIM in a period.

## Summary

Checked 28 September 2026.

| Item | Proposal | Reason |
| --- | --- | --- |
| Gateway app | **SMSGate** (`capcom6/android-sms-gateway`), public relay, end-to-end encryption on | Free. Apache-2.0, most starred, active. The phone opens no port. The relay cannot read the code or the number. |
| Backup app | **httpSMS** (`NdoleStudio/httpsms`) | Active. Best relay uptime. Offline alerts built in. Free tier: 200 SMS a month. |
| SIM budget | 20 codes in 24 hours, 100 in 7 days, 300 in 30 days; 5 per number a day | TRAI calls more than this "bulk" [S39]. Far under the 100 SMS/day plan limit. |
| Fallback | Email code: **new setup** (Better Auth email OTP + Resend free tier). The site sends no email today. | When the budget is spent, the phone is offline, or a send fails. |
| Exit | MSG91 with our own DLT registration | The legal route in [docs/23](23-notifications-otp-chat-research.md). Use the same message text now. |

The three largest risks:

1. **A bar on all your numbers.** TRAI treats an OTP as commercial communication that must come from a registered header, not a 10-digit number [S36][S37][S38]. Five complaints in 10 days can bar outgoing service on all the sender's numbers for 15 days; a repeat brings one-year disconnection, a blacklist and a blocked phone [S36]. Under TRAI's amendment of 18 September 2026 (start date not stated), 3 complaints are enough if operator AI also flagged the number [S40].
2. **Plan terms.** Jio, Airtel and Vi sell prepaid plans for personal, non-commercial use. They can withdraw benefits or disconnect for commercial use [S42][S43][S46].
3. **Codes that do not arrive.** One phone, one SIM and one relay are single points of failure. The SMSGate relay showed 99.263% uptime in 90 days, with outages of 7 h 23 min and 3 h 54 min [S15]. Phone makers stop background apps [S18].

## 1. Android gateway apps

Checked 28 September 2026. Repository numbers come from the GitHub API on that date [S1]. Features come from each project's README and documentation.

### Project health (facts)

| App (repository) | Licence | Latest stable release | Commits, 28 Jun–28 Sep 2026 | Stars | Android |
| --- | --- | --- | --- | --- | --- |
| SMSGate (`capcom6/android-sms-gateway`) | Apache-2.0 | v1.75.1, 8 Sep 2026 (v1.76.0 pre-release, 25 Sep) | 32 app + 30 relay server | 5,790 | 5.0+ [S2] |
| httpSMS (`NdoleStudio/httpsms`) | AGPL-3.0 | v1.2.1, 23 Aug 2026 | 114 | 5,211 | 9+ [S6] |
| textbee (`textbee/textbee`, was `vernu/textbee`) | MIT | v2.9.0, 21 Sep 2026 | 385 | 3,115 | 7.0+ [S10] |
| Traccar SMS Gateway (`traccar/traccar-sms-gateway`) | GPL-3.0 | v7.0.4, 5 Jul 2026 | 4 | 699 | Not stated |
| SMSSync (`ushahidi/SMSSync`) | LGPL-3.0 | v3.1.1, 21 Feb 2017 | 0 (last push November 2021) | 1,218 | Unmaintained |

Traccar is on Google Play [S12]. The other projects point to APK files on GitHub or their own site [S2][S6][S10].

### Features (facts)

| | SMSGate | httpSMS | textbee | Traccar |
| --- | --- | --- | --- | --- |
| Modes | Server on the phone (local network); free public relay; private relay (Go + MySQL) [S2][S3] | Hosted relay; self-host (Docker + Firebase) [S6] | Hosted relay; self-host (NestJS + MongoDB + Firebase) [S9] | Phone HTTP API; Traccar relay [S12] |
| Send one SMS | `POST api.sms-gate.app/3rdparty/v1/messages`, Basic or JWT; `textMessage.text`, `phoneNumbers`, `id`, `ttl`, `simNumber`, `isEncrypted` [S3] | `POST api.httpsms.com/v1/messages/send`, `x-api-key`; `from`, `to`, `content`, `encrypted`, `sim` [S7] | `POST api.textbee.dev/api/v1/gateway/send-sms`, `x-api-key`; `recipients`, `message`, `simSubscriptionId` [S10] | `POST www.traccar.org/sms/`, token; `to`, `message` [S12] |
| Status webhooks | `sms:sent`, `sms:delivered`, `sms:failed`, `system:ping` [S4] | `message.phone.sent`, `.delivered`, `message.send.failed`, `.expired`, `phone.heartbeat.offline` [S8] | `MESSAGE_SENT`, `_DELIVERED`, `_FAILED` [S11] | None documented |
| Webhook signature | `X-Signature`: hex HMAC-SHA256 of raw body + `X-Timestamp`. Sent by the phone [S4] | JWT (HS256) in `Authorization`. Sent by the relay [S8] | `X-Signature`: HMAC-SHA256 of the JSON payload, no timestamp [S11] | — |
| End-to-end encryption | AES-256-CBC of text **and** numbers [S5] | AES-256 of text only [S7] | None documented | None documented |
| Dual SIM | `simNumber` 1–3 [S3] | `sim`: SIM1, SIM2 [S7] | `simSubscriptionId` [S10] | Not documented |
| Pace and limits | Limit per minute, hour or day; random delay; working hours. Priority 100+ skips them [S3][S25] | 10 SMS/min default, 29 maximum [S8] | Plan caps only | Not documented |
| Code expiry | `ttl` or `validUntil` [S3] | Expiry, with an `expired` event [S6][S8] | Not documented | Not documented |

### Hosted relay: price, privacy and uptime (facts)

| | Free | Paid | Message data on the relay | Uptime on the 90-day status view (to 27 Sep 2026) |
| --- | --- | --- | --- | --- |
| SMSGate | Yes; limits only "if affecting other users"; tell support above 10,000/day [S13] | None; donations | Plain text hashed within 1 minute; processed messages deleted after 1 month [S14]. Server location not stated. | 99.263%; outages of 7 h 23 min (3 July) and 3 h 54 min (16 September 2026) [S15] |
| httpSMS | 200 SMS/month | US$10/month (5,000) or US$20/month (10,000) [S6] | Retention not stated [S6] | API 100% [S16] |
| textbee | 50/day, 300/month, 1 phone | US$14.99/month (5,000) [S10] | "Temporarily stored" [S10] | API 99.762% [S17] |

### Reliability reports (facts)

| Topic | Report |
| --- | --- |
| Phone makers | dontkillmyapp.com ranks Huawei, Xiaomi, OnePlus and Samsung worst; Oppo 8th, Vivo 11th, realme 12th. Stock Android and Nokia do best [S18]. |
| Doze | Android leaves Doze when a charger is connected [S19]. |
| Android SMS limit | Android asks the user to confirm when one app sends more than 30 SMS in one minute (default) [S20]. A Redmi K50 asked for every SMS (SMSGate #333, open) [S21]. |
| SMSGate | #440 (open): incoming-SMS receivers stop after days; the maintainer advises a charger 24/7 and a silent alarm every 15 minutes. #442 (open): blank relay credentials after reboot, but the service runs [S21]. |
| httpSMS | #778: a Samsung S8+ (Android 9) stopped sending one minute after the screen went off; the maintainer could not reproduce it [S22]. |
| textbee | #260 (open): a phone can stop getting wake-up pushes for good. #267 (open): a lost first webhook is never retried [S23]. |
| Traccar | #28 (open since November 2025): relay requests do not go through [S24]. |
| Carriers | SMSGate lists carrier limits and anti-spam blocks as causes of `RESULT_ERROR_LIMIT_EXCEEDED`, and low balance as a cause of `RESULT_ERROR_GENERIC_FAILURE` [S25]. We found no Jio, Airtel, Vi or BSNL issue in the three main trackers. |

### Assessment and proposal

Assessment:

- SMSGate's relay is free with no monthly cap. It is the only app that hides both code and number from its relay. It refuses a repeated message ID (HTTP 409) and drops a code that waits too long (`ttl`) [S3][S5]. Its relay had the most downtime.
- httpSMS has the best relay uptime and built-in offline alerts. Its free tier (200 a month) is below our budget of 300 a month. It encrypts the text but not the number.
- textbee stores message text without encryption. Its webhook signature has no timestamp, so a copied request can be replayed.
- Traccar documents no delivery reports. SMSSync is unmaintained.

**Proposal:** use **SMSGate** in public-relay mode with end-to-end encryption. Reason: no cost, no open port on the phone, the least data on the relay, and the same API for a private relay later [S2]. The new email fallback covers relay outages.

**Backup proposal:** **httpSMS**. Keep its setup written down, not live. Switch if the SMSGate relay is down for more than a day, or if SMSGate stops releasing.

## 2. How our backend calls the gateway

Checked 28 September 2026.

### Facts

| Topic | Fact |
| --- | --- |
| Better Auth callback | `sendOTP({ phoneNumber, code }, ctx)`. Defaults: 6 digits, 300 seconds, 3 attempts; then the code is deleted and the server answers 403 [S26]. |
| Awaiting | Better Auth advises not to await `sendOTP` (timing attacks) and suggests `waitUntil` on serverless hosts [S26]. |
| Plain-text code | The phone plugin writes the code in clear to its `verification` table. The email plugin can hash codes (`storeOTP`); the phone plugin cannot. Issue #11297 is open [S27]. |
| Versions | `@convex-dev/better-auth` 0.12.5 needs `better-auth` ≥1.6.11 and <1.7.0; the latest `better-auth` is 1.7.6 [S28]. The Convex guide installs `better-auth@~1.6.15` [S29]. |
| Network calls | Better Auth callbacks need an action context for network calls: `requireActionCtx(ctx)` [S30]. |
| Rate limits | Better Auth's default is 100 requests per 60 seconds, kept in memory, which the docs call unsuitable for serverless [S31]. |
| Scheduler | Convex stores each scheduled function's arguments; results stay for 7 days [S32]. |
| SMSGate API | A send returns 202. A repeated `id` returns 409. 503 means "Queue limits exceeded; ensure device is online". `GET /3rdparty/v1/devices` returns `lastSeen` [S3]. |
| SMSGate tokens | Scopes include `messages:send`, `messages:read`, `devices:list`. Default token life 24 hours; refresh tokens 720 hours [S33]. The dashboard creates tokens [S34]. |
| Phone exposure | Local-server mode needs a public IP and port forwarding; many ISPs use CG-NAT [S35]. In relay mode the phone connects out (FCM push, Server-Sent Events, a 15-minute poll) and needs no public IP [S3]. |

### Proposed design

Proposal for the developer, within AGENTS.md: external calls in Convex actions, secrets in Convex, limits on the server.

1. **Mode.** Use the public relay, not local-server mode, port forwarding or a tunnel. The phone then makes only outgoing connections.
2. **Authentication.** Store a scoped token (`messages:send`, `messages:read`, `devices:list`) as `SMSGATE_TOKEN`. If the dashboard cannot make a long-lived token, store the username and password, and request a 10-minute token per send [S34]. A 401 answer starts the email fallback and one owner alert.
3. **Checks before a send.** In `sendOTP`, run one Convex mutation. It accepts only `+91` numbers with 10 digits that start with 6–9. It refuses when the phone is offline. It counts: 1 code per number per 60 seconds, 3 per 15 minutes and 5 per day (rows keyed by an HMAC of the number); 10 per IP address per hour; and the SIM budget (20 per 24 hours, 100 per 7 days, 300 per 30 days). `takeRateLimits` (`convex/limits.ts`) has one 1-hour window today; give it a window per rule, or use the Convex rate-limiter component. On refusal, return one error code, such as `SMS_UNAVAILABLE`. Also move Better Auth's rate limiter to database storage, with rules for `/phone-number/send-otp` and `/phone-number/verify` [S31].
4. **Send.** In the same action, `fetch` the relay and await it, with a 10-second timeout; Convex may drop unawaited work ([docs/23](23-notifications-otp-chat-research.md)). Send a random `id`, `ttl: 300`, `withDeliveryReport: true`, `simNumber: 1`, `priority: 0` and `isEncrypted: true`. Never use priority 100 or more: it skips the phone's limits. Encrypt the text and number with Web Crypto in the documented format [S5]. Treat any answer except 202 as a failure, and 409 as "already queued".
5. **Keep the code out of storage.** Never pass the code to `ctx.scheduler`, a mutation, a table, a log, an error or analytics. Store only the message `id`, the number's HMAC, the status and times, for one year (section 3). Better Auth writes its own clear copy (see Facts); recheck issue #11297 before the build.
6. **Delivery reports.** Register `sms:sent`, `sms:delivered`, `sms:failed` and `system:ping` to a Convex HTTP route, for example `https://polished-mosquito-828.eu-west-1.convex.site/sms/webhook`. The route reads the raw body first and refuses an `X-Timestamp` more than 5 minutes off. It checks the hex HMAC-SHA256 of raw body + timestamp with `SMSGATE_WEBHOOK_KEY` in constant time (reuse `validSignature` in `lib/razorpay.ts`), and answers 401 when it fails. It ignores unknown or repeated IDs and moves a status only forward.
7. **Offline check.** Set the phone's ping to 10 minutes. A Convex cron runs every 10 minutes. After 30 minutes without a signed ping, it marks SMS offline and sends one owner alert through the existing Telegram alert ([docs/25](25-admin-and-order-alerts.md)). The next ping marks SMS online. A daily Telegram summary lists codes sent, failed and verified.
8. **Email fallback (new setup: the site sends no email today).** Create a Resend free account, verify `floruvi.com`, and store a sending-only key in Convex [S53]. Configure Better Auth's email OTP plugin to use it, with `storeOTP: "hashed"` [S27]. Checkout offers "Email me the code" when SMS is offline, the budget is spent, a send failed, a `sms:failed` report arrived, or 60 seconds passed without `sms:sent`. One verified code is enough (AGENTS.md). **Conflict:** email needs the buyer's email address, but the pending phone-only checkout (backlog item 5) collects none. The owner must choose.

| Convex variable (proposal) | Secret | Value |
| --- | --- | --- |
| `SMS_PROVIDER` | No | `smsgate` or `off`; later `msg91` |
| `SMSGATE_TOKEN` | Yes | Scoped token from the dashboard |
| `SMSGATE_USERNAME`, `SMSGATE_PASSWORD` | Yes | Only if a long-lived token is not possible |
| `SMSGATE_E2E_PASSPHRASE` | Yes | The same passphrase as in the app |
| `SMSGATE_WEBHOOK_KEY` | Yes | The app's webhook signing key |
| `SMS_NUMBER_HASH_KEY` | Yes | Random key for the number HMAC |
| `RESEND_API_KEY` | Yes | New: sending-only Resend key for email codes |
| `EMAIL_CODE_FROM` | No | New: a sender address on the verified domain |

## 3. India rules and operator limits

Checked 28 September 2026. This section explains published rules. It is not legal advice. Check with a telecom and data-protection professional before you rely on it.

### Facts

| Topic | Fact | Source |
| --- | --- | --- |
| OTP is commercial communication | A "transactional message" answers a "Customer initiated transaction within thirty minutes", "such as OTP from banks, non-bank-entities like e-commerce, apps login". It needs no explicit consent and is not unsolicited commercial communication (UCC). | [S36] primary |
| Unregistered sender | A UTM is "any Sender of commercial communication who is not registered". | [S39] primary |
| Bulk | Same or similar messages: more than 20 in 24 hours, 100 in 7 days, or 300 in 30 days. The 2025 amendment did not change this. | [S39][S36] primary |
| Headers only | "Every commercial communication is carried through registered headers." A sender that skips a registration step cannot send it. | [S38] primary |
| 10-digit numbers | The 2025 amendment "restricts senders from using normal 10-digit numbers for telemarketing". | [S37] primary |
| Complaints | Complaints are accepted for 7 days. Complaints from 5 unique recipients in 10 days suspend outgoing service while the operator investigates. First violation: all the sender's numbers barred for 15 days on all operators. Repeat: all disconnected for one year, a blacklist, the devices blocked; one number may stay, with outgoing barred. | [S36][S37] primary |
| Pattern detection | Operators must flag senders by daily SMS count, number of different recipients, a low incoming-to-outgoing ratio, phones that used 4+ numbers in a month, and SIM-box use. Airtel's AI checks "usage patterns, call/SMS frequency". | [S36][S41] primary |
| 2026 changes | Direction of 27 February 2026 and Third Amendment of 18 September 2026: operators share AI flags. Five flagged numbers of one sender in 10 days start KYC checks, bars and disconnection. Three complaints in 10 days start action if AI also flagged the number. Start date not stated. | [S40] primary |
| 2024 directions | 13 August 2024: promotional voice calls from unregistered senders must stop; misuse brings disconnection and a blacklist for up to 2 years (voice calls). 20 August 2024: messages with links that are not whitelisted are blocked; the sender-to-telemarketer chain must be declared. | [S52] primary for 13 August; the 20 August text did not render, so its content is from secondary reports |
| Plan limits | Jio prepaid and postpaid: 100 national SMS a day, then ₹1 per national SMS. Airtel prepaid: after the pack limit, ₹1 local and ₹1.5 STD. Vi: ₹1 local, ₹1.5 STD. BSNL: 100 a day on common plans. No TRAI rule sets 100 a day now; since 2020, operators set this tariff. | [S42][S43] primary; [S44] Vi search result, BSNL secondary; [S45] primary |
| Plan terms | Jio: plans are "intended only for personal use"; benefits can go for "unauthorised telemarketing and other commercial uses". Airtel: "only meant for personal and non-commercial use". Vi: commercial SMS without registration "will lead to disconnection". | [S42][S43][S46] primary |
| Airtel guidance (2020) | Bulk commercial communication "should NOT be done from an individual mobile". After a complaint, the number is capped at 20 SMS and 20 calls a day during the investigation. | [S47] primary; predates 2025 |
| Telecommunications Act 2023 | No clause names OTPs or commercial SMS from a personal SIM. Section 29: users must not give false particulars. Section 42(3): SIMs obtained by fraud, unauthorised identifiers and multi-SIM equipment are offences (up to 3 years, ₹50 lakh). | [S48] secondary |
| Enforcement | DoT reports 50.90 lakh disconnections from 11.18 lakh Chakshu reports, to 15 July 2026. | [S51] secondary |
| DPDP Act 2023 and Rules 2025 | Business duties start 13 May 2027. Then: a notice (Rule 3); security, with logs kept one year (Rule 6); breach notice to people "without delay" and to the Board within 72 hours (Rule 7); data, traffic data and logs kept at least one year (Rule 8(3)); a contact for data questions (Rule 9); answers to requests within 90 days. | [S49] primary; [S50] gazette text on a third-party site |

### Assessment: what could happen

- Our codes are transactional messages [S36]. From a 10-digit SIM they come from an unregistered sender, which TRAI's model does not allow at any volume [S37][S38].
- A genuine code is not UCC [S36]. But the buyer sees a plain mobile number and can report it. The owner can explain; the operator decides.
- Penalties cover all telecom resources of the sender. A separate SIM does not protect the owner's main number [S36].
- The likeliest cause of complaints is abuse: someone enters other people's numbers at checkout, and they get codes they did not ask for. Rate limits and a bot check protect the SIM, not only the budget.
- Operators also flag numbers by pattern, without complaints: many SMS, many different recipients, few replies [S36][S41]. A gateway SIM fits this pattern. The thresholds are not public.
- Business codes are commercial use of a personal plan. The operator can end the plan's benefits or the connection [S42][S43][S46].
- The DPDP duties start in May 2027 [S49][S50]. They cover the numbers and send records that this design keeps, so build for them now.

### Proposal: lower the risk

1. Send only codes that a buyer requests on the site. Send nothing else from this SIM: no order updates, offers, greetings or links.
2. Keep the SIM budget under TRAI's "bulk" limits (20 a day, 100 a week, 300 a month) and the per-number limits (section 2). Send the rest by email.
3. Add a bot check before each send, for example Vercel BotID Basic, which is free ([docs/23](23-notifications-otp-chat-research.md)).
4. Use only the fixed text in section 5.
5. Show the sending number at checkout, and offer email beside SMS.
6. Keep the SIM in the correct KYC name and alone in the gateway phone.
7. Keep send records without codes (message ID, number HMAC, time, status) for one year, as DPDP Rule 8(3) will require [S50]. They show that a buyer asked for each code.
8. Before switch-on, add SMS codes and the SMSGate relay to the privacy notice.
9. If an operator sends a notice or bars the SIM, set `SMS_PROVIDER` to `off` at once. Ask a professional before you reply.
10. Register on DLT when the budget is often full, and by 31 December 2026 at the latest.

## 4. Cheaper legal alternatives

Checked 28 September 2026. "Our code" means that Better Auth makes and checks the code, and the provider only delivers it. A provider that checks its own codes adds a second verifier ([docs/01](01-stack.md)).

| Option | Price per code in India | Free tier | Setup | Our code | Label |
| --- | --- | --- | --- | --- | --- |
| Email code, Resend (new setup) | ₹0 | 3,000/month, 100/day [S53] | New account and API key. Verify `floruvi.com`; until then, mail goes only to the account owner [S53]. | Yes | Primary |
| WhatsApp authentication template, Meta Cloud API | ₹0.115 + 18% GST, about ₹0.136 [S54] | None | Meta business portfolio, WhatsApp Business Account, number, approved template. 250 users a day at first [S55]. Business verification may be needed; sources disagree. | Yes; the text is fixed by Meta [S55] | Rules primary; INR rate secondary |
| MSG91 + our DLT | ₹0.25 (5,000 pack) down to ₹0.18, + 18% GST [S56] | Sign-up bonus "up to ₹7,500", with conditions [S56] | DLT entity: ₹5,000 a year on Vi and BSNL [S57]; Jio and Airtel not readable (₹5,900 with GST per secondary sources). Header, template, KYC, ₹500 minimum. | Yes | Vendor |
| Fast2SMS + our DLT | ₹0.25, down to ₹0.11 for ₹6 lakh+ recharges [S58] | ₹50 credit | The same DLT, KYC, ₹100 first recharge | Yes | Vendor |
| 2Factor.in | From ₹0.18 [S59] | Trial | Not verified: the site blocked reading | Not verified | Vendor claim |
| Message Central VerifyNow | From ₹0.30 per SMS; its blog says ₹0.20 [S60] | Free credits | Vendor says no DLT is needed (shared sender IDs) | No | Vendor claim |
| Telegram Gateway | US$0.01 (about ₹1); refunded if not delivered [S61] | Codes to your own number | Paid in TON through Fragment. The buyer needs Telegram. Not SMS. | Yes | Primary |
| Firebase Phone Auth | US$0.07 per SMS [S62] | Sources disagree | Blaze billing; SMS region policy | No: Google checks the code | Rules primary; price secondary |
| Twilio | US$0.0832 per SMS [S63] | — | DLT for Indian businesses | Yes | Primary |

Cost at 300 codes a month (our arithmetic, GST included where known):

| Route | Upfront | Each month |
| --- | --- | --- |
| Own SIM (this document) | A spare phone; first recharge | About ₹319 (a Jio plan with 100 SMS a day [S42]) |
| MSG91 + DLT | About ₹5,900 DLT + ₹1,475 for 5,000 codes | About ₹89 for codes, plus the DLT fee spread over the year (about ₹490) |
| WhatsApp authentication | ₹0 (Meta setup time) | About ₹41 |
| Email (new Resend free account) | ₹0 | ₹0 |

Assessment:

- Under ₹0.20 a code: email (₹0), WhatsApp authentication (about ₹0.136), and Fast2SMS at large recharges. 2Factor and Message Central claim similar prices.
- Email and WhatsApp need no DLT. A WhatsApp code proves control of that number's WhatsApp account, which serves sign-in nearly as well as SMS.
- A sender that skips a registration step cannot send commercial communication [S38]. We found no TRAI text that allows a shared aggregator template, so treat "no DLT needed" as a vendor claim.
- The DLT route's barrier is the upfront fee, not the monthly cost.

**Proposal:** set up email codes first (a new Resend free account). Add WhatsApp authentication after the Meta setup. Use own-SIM SMS only as a short bridge. Move SMS to MSG91 with DLT when the fee is affordable.

## 5. Owner setup for SMSGate

Checked 28 September 2026. Proposal: do these steps only after you accept the risks in section 3.

### Prepare the phone

1. Choose a spare phone with Android 8 or later. Prefer a Pixel, Nokia or other stock-Android phone; avoid Huawei, Xiaomi, Redmi, OnePlus and Samsung if you can [S18][S21].
2. Reset the phone to factory settings.
3. Install all system updates.
4. Set a screen-lock PIN.
5. Put the business SIM in slot 1, and leave slot 2 empty.
6. Do not swap SIMs in this phone: operators flag phones with 4 or more numbers in a month [S36].
7. Recharge a plan with 100 SMS a day, and note its end date.
8. Connect the phone to Wi-Fi. Keep mobile data on as a backup.
9. Keep the phone on its charger, in a cool place.
10. Keep Google Play services on: the relay uses them for push [S3].

### Install the app from the official source

1. On the phone, open `https://github.com/capcom6/android-sms-gateway/releases`.
2. From the **Latest** release, download `app-release.apk`. Do not use `app-insecure.apk` or a look-alike site [S2].
3. Allow the browser to install unknown apps. Remove this permission after the install.
4. If Play Protect blocks the install, follow the SMSGate installation guide [S2]. Then turn Play Protect on again.
5. Open the app and grant the SMS and phone permissions. On Android 15 or later, if the SMS permission is grey, grant it by hand [S25].
6. In the app, open **Settings → System** and turn off battery optimisation [S25].
7. In Android settings, set the app's battery use to **Unrestricted**, allow auto-start, and lock the app in recent apps, as dontkillmyapp.com shows for your brand [S18].
8. In the app, turn on start on boot [S21].

### Connect to the relay and make credentials

1. In the app, turn on **Cloud Server** and tap **Online** [S2].
2. Save the username and password in the password manager.
3. Sign in at `https://dashboard.sms-gate.app` with them [S34].
4. Create a token with only `messages:send`, `messages:read` and `devices:list`, and the longest life allowed, up to 90 days.
5. Set a calendar reminder 7 days before the token ends.
6. Give the token to the developer through the password manager. The developer runs `pbpaste | pnpm exec convex env set SMSGATE_TOKEN --prod`.

### Set limits and security in the app

1. Set the message limit to 20 a day, as a second guard behind the server budget [S25].
2. Set the delay between messages to 1–3 seconds.
3. Leave working hours off, so codes work at any hour.
4. Set an encryption passphrase of 32 or more random characters. Give it to the developer as `SMSGATE_E2E_PASSPHRASE` [S5].
5. In **Settings → Webhooks → Signing Key**, set a key of 32 or more random characters. Give it to the developer as `SMSGATE_WEBHOOK_KEY` [S4].
6. Set the ping interval to 600 seconds.
7. Ask the developer to register the four webhooks (section 2).

### Message text

Proposal: 89 characters, one SMS, and the same words as the planned DLT template ([docs/23](23-notifications-otp-chat-research.md)):

`482913 is your Floruvi checkout code. It expires in 5 minutes. Do not share it. - Floruvi`

- No link, web address, offer or emoji.
- Latin letters only, so the text stays one SMS.
- Checkout names the sending number ("Your code comes from +91 …"), so buyers do not take it for spam.

### Test before you switch it on

1. Ask four people to agree to a test: one each on Jio, Airtel, Vi and BSNL.
2. Request a code on the site for each number. Check that it arrives within 30 seconds.
3. Ask the developer to confirm "delivered" for each code.
4. Turn on flight mode on the gateway phone. Request a code. Check that checkout offers email.
5. After 30 minutes, check that the offline alert arrived.
6. Turn off flight mode. Check that the "back online" alert arrives.
7. Ask the developer to send a webhook with a wrong signature. Check that the route refuses it.
8. Request 6 codes for one number in one day. Check that the sixth is refused.
9. Check the SIM's remaining SMS and balance.

### Monitor

1. Act on each offline alert: check power, Wi-Fi, SIM signal and the app, in that order.
2. Each week, look at the phone: charger, app status, and any prompt on the screen.
3. Each week, read the daily summaries. Many sends with few verifications can mean abuse.
4. Recharge the SIM before its validity ends.
5. Each month, read the SMSGate release notes. Update only from the official Releases page.
6. If an operator warns you or bars the SIM, set `SMS_PROVIDER` to `off` at once. Email codes continue, once set up.

## Open questions for the owner

1. Do you accept the risks in section 3, including a possible bar on every number in your name?
2. Do you approve the new email fallback (Resend free account, key, verified domain)? It needs the buyer's email: keep phone-only checkout, or ask for email only when SMS fails?
3. Which spare phone and which SIM (operator, plan, name on the connection) will you use?
4. Is 20 codes a day enough? More needs DLT.
5. By when will you register on DLT? The proposal is 31 December 2026.
6. May encrypted codes and numbers pass through the SMSGate relay (server location not stated)? The privacy notice needs a line about SMS codes either way.
7. Should we start the Meta setup for WhatsApp codes now?

## Sources

Read 28 September 2026. "Primary" = the project, vendor, operator or regulator itself. A vendor page is primary for its own product and price, but only a claim about the law. Some India sources were read by a research helper in this session and are labelled as such.

**Gateway apps**

- [S1] GitHub REST API: repository, release and commit data for the five repositories (primary): https://api.github.com/repos/capcom6/android-sms-gateway
- [S2] SMSGate README and installation guide (primary): https://github.com/capcom6/android-sms-gateway, https://docs.sms-gate.app/installation/
- [S3] SMSGate public relay, sending and API specification (primary): https://docs.sms-gate.app/getting-started/public-cloud-server/, https://docs.sms-gate.app/features/sending-messages/, https://api.sms-gate.app/docs/doc.json
- [S4] SMSGate webhooks (primary): https://docs.sms-gate.app/features/webhooks/
- [S5] SMSGate end-to-end encryption (primary): https://docs.sms-gate.app/privacy/encryption/
- [S6] httpSMS home page (pricing, FAQ), README and privacy policy (primary): https://httpsms.com/, https://github.com/NdoleStudio/httpsms, https://httpsms.com/privacy-policy/
- [S7] httpSMS getting started and encryption (primary): https://docs.httpsms.com/introduction/getting-started.md, https://httpsms.com/blog/end-to-end-encryption-to-sms-messages/
- [S8] httpSMS webhooks, events and send rate (primary): https://docs.httpsms.com/webhooks/introduction.md, https://docs.httpsms.com/webhooks/events.md, https://docs.httpsms.com/features/control-sms-send-rate.md
- [S9] textbee README (primary): https://github.com/textbee/textbee
- [S10] textbee pricing, FAQ and sending (primary): https://textbee.dev/pricing, https://textbee.dev/docs/faq, https://textbee.dev/docs/sending-sms/sending-sms
- [S11] textbee webhooks (primary): https://textbee.dev/docs/webhooks
- [S12] Traccar SMS Gateway page, HTTP SMS API and README (primary): https://www.traccar.org/sms-gateway/, https://www.traccar.org/http-sms-api/, https://github.com/traccar/traccar-sms-gateway
- [S13] SMSGate pricing (primary): https://docs.sms-gate.app/pricing/
- [S14] SMSGate privacy policy (primary): https://docs.sms-gate.app/privacy/policy/
- [S15] SMSGate status page (primary): https://status.sms-gate.app/
- [S16] httpSMS status page (primary): https://status.httpsms.com/
- [S17] textbee status page (primary): https://status.textbee.dev/
- [S18] Don't kill my app, ranking and Xiaomi steps (secondary, community site): https://dontkillmyapp.com/, https://dontkillmyapp.com/xiaomi
- [S19] Android Developers, Doze and App Standby (primary): https://developer.android.com/training/monitoring-device-state/doze-standby
- [S20] Android source, `SmsUsageMonitor.java` (primary): https://android.googlesource.com/platform/frameworks/opt/telephony/+/master/src/java/com/android/internal/telephony/SmsUsageMonitor.java
- [S21] SMSGate issues #333, #440, #442 (primary; user reports): https://github.com/capcom6/android-sms-gateway/issues/333, https://github.com/capcom6/android-sms-gateway/issues/440, https://github.com/capcom6/android-sms-gateway/issues/442
- [S22] httpSMS issue #778 (primary; user report): https://github.com/NdoleStudio/httpsms/issues/778
- [S23] textbee issues #260, #267 (primary; user reports): https://github.com/textbee/textbee/issues/260, https://github.com/textbee/textbee/issues/267
- [S24] Traccar SMS Gateway issue #28 (primary; user report): https://github.com/traccar/traccar-sms-gateway/issues/28
- [S25] SMSGate FAQ, general and errors (primary): https://docs.sms-gate.app/faq/general/, https://docs.sms-gate.app/faq/errors/

**Backend**

- [S26] Better Auth, Phone Number plugin (primary): https://www.better-auth.com/docs/plugins/phone-number
- [S27] Better Auth issue #11297 and Email OTP plugin (primary): https://github.com/better-auth/better-auth/issues/11297, https://www.better-auth.com/docs/plugins/email-otp
- [S28] npm registry, `better-auth` and `@convex-dev/better-auth` (primary): https://www.npmjs.com/package/@convex-dev/better-auth
- [S29] Convex + Better Auth, Next.js guide and supported plugins (primary): https://labs.convex.dev/better-auth/framework-guides/next, https://labs.convex.dev/better-auth/supported-plugins
- [S30] Convex + Better Auth, type utilities (primary): https://labs.convex.dev/better-auth/api/type-utilities
- [S31] Better Auth, rate limit (primary): https://www.better-auth.com/docs/concepts/rate-limit
- [S32] Convex, scheduled functions (primary): https://docs.convex.dev/scheduling/scheduled-functions
- [S33] SMSGate authentication guide and FAQ (primary): https://docs.sms-gate.app/integration/authentication/, https://docs.sms-gate.app/faq/authentication/
- [S34] SMSGate web dashboard and JWT migration post (primary): https://docs.sms-gate.app/services/web-dashboard/, https://docs.sms-gate.app/blog/2025/12/10/securing-your-sms-gateway-migrating-from-basic-auth-to-jwt/
- [S35] SMSGate local server (primary): https://docs.sms-gate.app/getting-started/local-server/

**India rules and operators**

- [S36] TRAI, TCCCPR (Second Amendment) Regulations 2025, notified 12 February 2025 (primary): https://trai.gov.in/sites/default/files/2025-02/Regulation_12022025.pdf
- [S37] TRAI Press Release No. 11/2025, 12 February 2025 (primary): https://trai.gov.in/sites/default/files/2025-02/PR_No.11of2025.pdf
- [S38] TRAI, Advice to Senders (primary): https://trai.gov.in/advice-to-senders
- [S39] TRAI, TCCCPR 2018, 19 July 2018: definitions of "Bulk" and "Unregistered Telemarketer" (primary): https://www.trai.gov.in/sites/default/files/2024-09/RegulationUcc19072018.pdf
- [S40] TRAI Press Release on the TCCCPR (Third Amendment) Regulations 2026, 18 September 2026 (primary; the 15 MB regulation text was not read): https://www.trai.gov.in/sites/default/files/2026-09/PR_No119of2026.pdf
- [S41] Airtel press release, AI spam detection, 25 September 2024 (primary; read by the research helper): https://www.airtel.in/press-release/09-2024/airtel-cracks-down-on-spam-launches-indias-first-ai-powered-network-solution-for-spam-detection
- [S42] Jio prepaid and postpaid plan sheets, undated (primary; read by the research helper), and Jio ₹319 plan FAQ (primary): https://jep-asset.akamaized.net/jio/plan/Mobility-Prepaid-Plan-Vouchers.pdf, https://jep-asset.akamaized.net/jio/plan/Mobility-Postpaid-Plans.pdf, https://www.jio.com/help/faq/mobile/prepaid-offerings/monthly-plan/what-are-the-benefits-of-the-259-plan/
- [S43] Airtel, prepaid voucher terms, undated (primary): https://www.airtel.in/terms-conditions/prepaidvouchers
- [S44] Vi after-limit SMS rates: search-result snippets from findprix.com and bajajfinserv.in (search result only; Vi's own pages did not show plan details). BSNL plans: telecomtalk.info, August 2026 (secondary; article URL not recorded): https://telecomtalk.info/
- [S45] TRAI consultation paper of 28 August 2024 (paras 3.5, 3.7) and Telecom Tariff Order consolidation of 28 March 2025 (primary; read by the research helper): https://www.trai.gov.in/sites/default/files/2024-10/CP_28082024.pdf, https://trai.gov.in/sites/default/files/2025-03/CR_TTO_28032025.pdf
- [S46] Vi regulatory notices and prepaid tariff form, undated (primary; read by the research helper): https://www.myvi.in/regulatory-notices, https://www.myvi.in/content/dam/vodafoneideadigital/StaticPages/consumerimages/TRAI/prepaid/TRAI_Mandate_Form_December.pdf
- [S47] Airtel FAQ for enterprises and telemarketers, 4 February 2020 (primary; read by the research helper): https://www.airtel.in/business/commercial-communication/assets/documents/Help_Modules/FAQs-%20Enterprise-Telemarketers%20who%20want%20to%20send%20commercial%20communication%20-%2004-02-2020.pdf
- [S48] Telecommunications Act 2023, sections 28, 29 and 42 (secondary: Indian Kanoon, PRS, Internet Freedom Foundation; the gazette copy did not open): https://indiankanoon.org/doc/198926567/, https://prsindia.org/billtrack/the-telecommunication-bill-2023, https://internetfreedom.in/the-telecom-act-2023-partial-notification/
- [S49] PIB backgrounder "DPDP Rules, 2025 Notified", 17 November 2025 (primary): https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251117695301.pdf
- [S50] DPDP Rules 2025, G.S.R. 846(E), gazette text on a third-party host (MeitY blocked reading), and commencement summaries (secondary): https://www.dpdpa.com/DPDP_Rules_2025_English_only.pdf, https://dpdprules.org/act
- [S51] Medianama, DoT disconnections, 24 July 2026, citing a Rajya Sabha reply (secondary): https://www.medianama.com/2026/07/223-dot-disconnects-88-lakh-mobile-connections/
- [S52] TRAI directions of 13 August 2024 and 20 August 2024 (primary; read by the research helper; the 20 August text did not render, so its dates come from secondary reports): https://www.trai.gov.in/sites/default/files/2024-09/Direction_13082024.pdf, https://www.trai.gov.in/sites/default/files/2024-09/Direction_20082024.pdf

**Alternatives**

- [S53] Resend pricing, quotas and 403 guide (primary): https://resend.com/pricing, https://resend.com/docs/knowledge-base/account-quotas-and-limits, https://resend.com/docs/knowledge-base/403-error-resend-dev-domain
- [S54] Meta, WhatsApp pricing (primary; the INR rate-card file was not re-opened; secondary sites give the same ₹0.1150): https://developers.facebook.com/docs/whatsapp/pricing
- [S55] Meta, messaging limits and authentication templates (primary): https://developers.facebook.com/docs/whatsapp/messaging-limits, https://developers.facebook.com/docs/whatsapp/business-management-api/authentication-templates
- [S56] MSG91 OTP pricing and FAQ (primary, vendor): https://msg91.com/in/pricing/otp, https://msg91.com/help/msg91-common-faq-s
- [S57] Vi DLT FAQ and BSNL DLT FAQ (primary): https://www.vilpower.in/faq, https://www.ucc-bsnl.co.in/faq
- [S58] Fast2SMS pricing and OTP API (primary, vendor): https://www.fast2sms.com/pricing, https://docs.fast2sms.com/reference/send-otp.md
- [S59] Dial2Verify pricing page that quotes 2Factor (vendor claim; 2factor.in blocked reading): https://www.dial2verify.com/corp/pricing.html
- [S60] Message Central VerifyNow India pricing (vendor claim): https://www.messagecentral.com/product/verify-now/pricing/india
- [S61] Telegram Gateway and API (primary): https://core.telegram.org/gateway, https://core.telegram.org/gateway/api
- [S62] Firebase pricing and limits (primary); India price from Logto (secondary): https://firebase.google.com/pricing, https://firebase.google.com/docs/auth/limits, https://blog.logto.io/firebase-authentication-pricing
- [S63] Twilio India SMS pricing and guidelines (primary): https://www.twilio.com/en-us/sms/pricing/in, https://www.twilio.com/en-us/guidelines/in/sms

[S1]: https://api.github.com/repos/capcom6/android-sms-gateway
[S2]: https://github.com/capcom6/android-sms-gateway
[S3]: https://docs.sms-gate.app/getting-started/public-cloud-server/
[S4]: https://docs.sms-gate.app/features/webhooks/
[S5]: https://docs.sms-gate.app/privacy/encryption/
[S6]: https://httpsms.com/
[S7]: https://docs.httpsms.com/introduction/getting-started.md
[S8]: https://docs.httpsms.com/webhooks/introduction.md
[S9]: https://github.com/textbee/textbee
[S10]: https://textbee.dev/pricing
[S11]: https://textbee.dev/docs/webhooks
[S12]: https://www.traccar.org/sms-gateway/
[S13]: https://docs.sms-gate.app/pricing/
[S14]: https://docs.sms-gate.app/privacy/policy/
[S15]: https://status.sms-gate.app/
[S16]: https://status.httpsms.com/
[S17]: https://status.textbee.dev/
[S18]: https://dontkillmyapp.com/
[S19]: https://developer.android.com/training/monitoring-device-state/doze-standby
[S20]: https://android.googlesource.com/platform/frameworks/opt/telephony/+/master/src/java/com/android/internal/telephony/SmsUsageMonitor.java
[S21]: https://github.com/capcom6/android-sms-gateway/issues/333
[S22]: https://github.com/NdoleStudio/httpsms/issues/778
[S23]: https://github.com/textbee/textbee/issues/260
[S24]: https://github.com/traccar/traccar-sms-gateway/issues/28
[S25]: https://docs.sms-gate.app/faq/general/
[S26]: https://www.better-auth.com/docs/plugins/phone-number
[S27]: https://github.com/better-auth/better-auth/issues/11297
[S28]: https://www.npmjs.com/package/@convex-dev/better-auth
[S29]: https://labs.convex.dev/better-auth/framework-guides/next
[S30]: https://labs.convex.dev/better-auth/api/type-utilities
[S31]: https://www.better-auth.com/docs/concepts/rate-limit
[S32]: https://docs.convex.dev/scheduling/scheduled-functions
[S33]: https://docs.sms-gate.app/integration/authentication/
[S34]: https://docs.sms-gate.app/services/web-dashboard/
[S35]: https://docs.sms-gate.app/getting-started/local-server/
[S36]: https://trai.gov.in/sites/default/files/2025-02/Regulation_12022025.pdf
[S37]: https://trai.gov.in/sites/default/files/2025-02/PR_No.11of2025.pdf
[S38]: https://trai.gov.in/advice-to-senders
[S39]: https://www.trai.gov.in/sites/default/files/2024-09/RegulationUcc19072018.pdf
[S40]: https://www.trai.gov.in/sites/default/files/2026-09/PR_No119of2026.pdf
[S41]: https://www.airtel.in/press-release/09-2024/airtel-cracks-down-on-spam-launches-indias-first-ai-powered-network-solution-for-spam-detection
[S42]: https://jep-asset.akamaized.net/jio/plan/Mobility-Prepaid-Plan-Vouchers.pdf
[S43]: https://www.airtel.in/terms-conditions/prepaidvouchers
[S44]: https://telecomtalk.info/
[S45]: https://www.trai.gov.in/sites/default/files/2024-10/CP_28082024.pdf
[S46]: https://www.myvi.in/regulatory-notices
[S47]: https://www.airtel.in/business/commercial-communication/assets/documents/Help_Modules/FAQs-%20Enterprise-Telemarketers%20who%20want%20to%20send%20commercial%20communication%20-%2004-02-2020.pdf
[S48]: https://indiankanoon.org/doc/198926567/
[S49]: https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251117695301.pdf
[S50]: https://www.dpdpa.com/DPDP_Rules_2025_English_only.pdf
[S51]: https://www.medianama.com/2026/07/223-dot-disconnects-88-lakh-mobile-connections/
[S52]: https://www.trai.gov.in/sites/default/files/2024-09/Direction_13082024.pdf
[S53]: https://resend.com/pricing
[S54]: https://developers.facebook.com/docs/whatsapp/pricing
[S55]: https://developers.facebook.com/docs/whatsapp/messaging-limits
[S56]: https://msg91.com/in/pricing/otp
[S57]: https://www.vilpower.in/faq
[S58]: https://www.fast2sms.com/pricing
[S59]: https://www.dial2verify.com/corp/pricing.html
[S60]: https://www.messagecentral.com/product/verify-now/pricing/india
[S61]: https://core.telegram.org/gateway
[S62]: https://firebase.google.com/pricing
[S63]: https://www.twilio.com/en-us/sms/pricing/in
