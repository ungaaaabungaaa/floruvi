# Support chatbot

Status, 28 September 2026: **steps 2 and 3 are built** (owner request: "implement … open router sdk or vercel ai sdk, whichever provides us the best"). The chat stays hidden until the owner turns it on in `/admin`. Step 1 (SMS-code sign-in) waits for MSG91 and DLT. Costs and providers: [research](23-notifications-otp-chat-research.md). Earlier design: [chat & translation](04-chat.md).

## What is built

- **Stack.** The Vercel AI SDK 7 (`ai`, `@ai-sdk/react`) with the official OpenRouter provider (`@openrouter/ai-sdk-provider`). The AI SDK gives streaming replies, typed tools and the `useChat` window; OpenRouter gives one key for every model, a fallback model and a spending cap. Model: `qwen/qwen3.7-flash`, falling back to `openai/gpt-6-luna` (change with `OPENROUTER_MODEL` / `OPENROUTER_FALLBACK_MODEL`). Only providers that do not keep or train on prompts are used (`data_collection: deny`). Replies are capped at 500 tokens, 4 tool steps and minimal reasoning.
- **Where it runs.** `app/api/chat/route.ts` on Vercel. The key `OPENROUTER_API_KEY` is a Vercel server variable; the browser never sees it. Without the key, the switch shows the old English catalogue guide.
- **Tools, checked by code** (`lib/chat-bot.ts`): `findProducts`, `getProduct`, `addToBasket` and `handOff`. Prices, packs and stock come from the live catalogue for the visitor's country. `addToBasket` only offers a button; the customer taps it. The model has no database, order, payment or web access.
- **Languages.** It answers in the visitor's language on all 32 site versions, including Hindi and other Indian languages typed in Latin letters. Search knows common local names (palak, dhaniya, pudina, methi, tulsi and more).
- **Storage** (`convex/chat.ts`): `chatThreads` and `chatMessages`. A chat belongs to a private, httpOnly cookie; Convex stores only its SHA-256. Chats are deleted 180 days after the last message by a daily job (`convex/crons.ts`).
- **Hand-off.** Code hands the chat to the owner for "person / call me / where is my order / refund / complaint" (English and common Hinglish); the model can also hand off, and a failed answer hands off too. The owner gets a Telegram/email alert with a link.
- **Owner inbox.** `/admin/chats`: chats waiting for the owner first, the full conversation, a reply box, and **Take over**, **Give back to the assistant** and **Close**. Customers see replies within about 10 seconds while their chat window is open.
- **Limits.** 30 messages an hour per address and per chat, 600 an hour in total, 500 characters a message. Set a monthly cap in OpenRouter as well.
- **Tests.** `tests/chat.test.ts` uses the AI SDK's mock model: tool checks, a streamed tool call, hand-off rules, and the route's refusals. Development checks on 28 September 2026 covered storage, hand-off, owner reply, give-back and the chat window; a fake key showed the error message and handed the chat to the owner.

## Owner setup

1. Create an OpenRouter account, add credit, and set a **monthly limit** on the key (proposal: US$10).
2. Put the key in Vercel → floruvi → Settings → Environment Variables: `OPENROUTER_API_KEY`, Production, Sensitive. Redeploy.
3. Update the privacy notice: chats are saved for 180 days and processed by OpenRouter and the model provider.
4. Deploy the backend: `pnpm exec convex deploy` (answer `y`).
5. Turn **Website chat** on in `/admin`, try 20–50 real questions in English, Hindi and Arabic, and read them in `/admin/chats`.

Still to build: SMS-code sign-in before chatting (step 1), and WhatsApp (step 4).

## What the owner asked for

A website chat that works only after the customer verifies a 10-digit mobile number with a 6-digit SMS code. The bot answers only Floruvi questions, knows every product and price, can add products to the basket, explains payment and delivery, and hands the chat to the owner when a person is needed ("Where is my order?", "I want to talk to a human"). The owner answers from the admin panel. All chats are stored. Later, the same bot runs on WhatsApp. The budget is small.

## Original design (approved by the owner on 28 September 2026)

```mermaid
flowchart LR
  C[Customer: web chat, later WhatsApp] --> V{Phone verified?}
  V -- no --> OTP[6-digit SMS code: MSG91 via Better Auth]
  V -- yes --> S[(Convex: threads & messages)]
  S --> B{Thread owner}
  B -- bot --> M[OpenRouter model proposes a reply or a tool]
  M --> G[Our code checks the tool & its arguments]
  G --> T[Public tools: find products, product details, FAQ, add to basket, hand off]
  T --> S
  B -- human --> A[Owner replies in /admin/chats]
  A --> S
  G -- hand off --> H[Telegram alert to owner]
```

1. **Identity.** The same phone sign-in as checkout (backlog item 5): Better Auth's phone-number plugin with the Convex component, MSG91 for SMS. The phone number is the customer ID. No email. WhatsApp chats are already tied to a phone number, so they need no SMS code.
2. **Storage.** Two Convex tables: `chatThreads` (customer, channel, who is answering: bot / owner / closed, last message time) and `chatMessages` (thread, author: customer / bot / owner, text, time). The owner sets a retention period (proposal: delete after 180 days). This is the only chat store — no second inbox service.
3. **The bot.** A Convex action runs after each customer message while the bot owns the thread. It sends the fixed rules, a short summary of older messages, the last 6 messages and 5 tools to OpenRouter.
   - Model: `qwen/qwen3.7-flash` first (about US$0.61 per 1,000 conversations), with `openai/gpt-6-luna` as the fallback. Keep the choice only after a 50-question test in English, Hindi and Arabic; use `google/gemini-3.1-flash-lite` if those fail.
   - Replies are capped near 300 tokens; at most 5 products per answer; lowest reasoning setting; prompt caching on.
4. **Tools, checked by our code — never by the model.**
   - `findProducts(text)` and `getProduct(slug)`: published products only, with the real price, pack & stock status. Prices always come from these tools, never from the model's memory.
   - `faq(topic)`: the delivery, payment, boxes & returns answers already on the site.
   - `addToBasket(slug, quantity)`: our code checks the product exists, is in stock and the quantity is 1–99, then the chat window adds it to the customer's basket and shows the cart pill.
   - `handOff(reason)`: gives the thread to the owner and sends a Telegram alert.
   - The model gets no database access, no order data, no payment actions and no web access (AGENTS.md).
5. **Hand-off rules.** Code, not the model, hands off on: "human / person / agent / call me", any order-status or refund question, an angry or unclear conversation after 2 failed answers, or a model error. While the owner owns the thread the bot is silent; the owner can hand it back.
6. **Admin inbox.** `/admin/chats`, behind the existing admin sign-in: open threads first, live updates, reply box, "take over" and "give back to bot" buttons.
7. **Minimal interface (owner request, 28 September 2026).** A small round chat button (bottom corner, clear of the cart pill), and a plain panel: title, "automated" note, messages, one input line. Product answers are simple links, and "Add to basket" is a single button. No avatar, banner or footer text. It loads only after the page is idle.
8. **On/off switch (built 28 September 2026).** The admin panel's "Website chat" switch shows or hides the chat for all visitors; it is hidden by default. Today it shows the existing catalogue guide (English versions only, no AI, no sign-in). The bot in this plan will use the same switch.
7. **Limits & cost control.** Per phone: 30 messages an hour and 100 a day. A site-wide daily token budget; when it is used up, new chats go to the owner. An OpenRouter monthly spend cap (proposal: US$10). SMS codes use the checkout limits.
8. **Safety tests before launch.** The abuse tests in [chat & translation](04-chat.md), plus prompt-injection attempts ("ignore your rules", fake prices, requests for other customers' data). The bot must stay on Floruvi topics and refuse the rest in one short line.
9. **WhatsApp (later).** A Meta WhatsApp Cloud API webhook into the same threads. From 1 October 2026 each business number gets 1,000 free service replies a month in India, then ₹0.115 each. Business-started template messages cost extra.

## Build order

| Step | Work | Needs from the owner |
| --- | --- | --- |
| 1 | Phone sign-in with SMS code (shared with checkout) | MSG91 account, DLT registration (entity, header, OTP template) |
| 2 | Chat storage, website chat window, admin inbox — owner answers only | Retention period; privacy notice wording |
| 3 | Bot with the 5 tools, hand-off & limits | OpenRouter key & monthly cap; approve the model after the language test |
| 4 | WhatsApp channel | Meta business verification & a phone number |

Steps 2 and 3 can be built before step 1 is live by using a test sign-in in development only.

## Monthly cost at 1,000 chats (rough)

- Model: about US$0.40–2 (Qwen, cached) — well under the proposed US$10 cap.
- SMS codes: about ₹0.30 each with MSG91 → about ₹300 for 1,000 sign-ins.
- WhatsApp (later): free for the first 1,000 service replies a month per number.

## Decisions needed

1. Approve this design and the build order.
2. Confirm phone-only sign-in for customers (this replaces the email + phone codes in AGENTS.md).
3. Chat retention period, and the OpenRouter monthly cap.
4. Which languages the bot should answer in at launch.
