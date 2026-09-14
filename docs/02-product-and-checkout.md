# 2. Product and checkout

## Proposed launch scope

- Public home, product list, product detail, farm story, delivery information, and contact pages.
- B2C cart and purchase flow.
- B2B wholesale enquiry form. Quotes and negotiated terms remain human-led for launch.
- Simple B2C enquiry form for delivery or product questions.
- Small owner dashboard: products, stock, orders, and leads. Link to Crisp for conversations and Razorpay for payment operations.

The initial delivery area is not yet confirmed. Start with a fixed delivery-area list, fixed rules, and fixed product packs. Subscriptions, variable-weight billing, credit accounts, loyalty points, automated courier routing, and complex promotions are later work.

## B2C flow

1. Browse products without login.
2. View the pack size, current price, stock, and delivery information.
3. Add products to the cart. Keep only product IDs and quantities in local cart storage.
4. Enter delivery details and see the complete total before requesting a code.
5. On the final checkout page, choose **Email code** or **Phone code**. Verify one method.
6. Create the customer identity and session through Better Auth. Explain that the code also creates or opens the customer account.
7. Recheck price, delivery eligibility, and stock on the server. Create a pending order and a bounded stock reservation.
8. Open Razorpay Standard Checkout.
9. Show a confirmation only after the server verifies the payment and confirms captured status. Show a pending state if payment is still being checked.
10. Show a secure order receipt. Send the transactional receipt using the available contact channel.

No password, separate signup form, or account creation before final checkout. Returning buyers with a valid session need not repeat a code for each cart.

Collect a delivery phone number even when the buyer chooses email verification. It remains a contact field until verified. Phone-only customers must still receive an on-site receipt and secure order access; an email receipt is optional if they have not supplied an email. Decide whether a short SMS receipt is worth its added cost.

Use the [Better Auth email OTP](https://better-auth.com/docs/plugins/email-otp) and [phone number](https://better-auth.com/docs/plugins/phone-number) plugins. For new phone users, configure the documented signup-on-verification flow. If the auth library needs a synthetic email, use a non-deliverable reserved domain and never send mail to it. Prove this behavior in the day-1 test.

## Identity rules

- Email and phone are alternative sign-in methods; an unverified delivery field is never identity proof.
- Adding a second sign-in method requires an authenticated session and verification of the new method.
- If that method already belongs to another account, stop the link and use a reviewed recovery process. Do not silently merge accounts.
- Orders are authorized by the authenticated customer ID. An order number, phone number, chat session, or URL alone is not proof of ownership.
- Owner access uses an explicit allowlist and strong authentication. A customer must never set their own role.
- Use short-lived, one-use codes, resend cooldowns, attempt limits, and shared server-side rate limits. Prove the configured behavior for both plugins.

## Payments and stock

Convex owns the order state machine. Use mutations for atomic stock and order changes. Use actions for provider API calls. A network call to Razorpay is not part of a Convex database transaction.

- Calculate item totals, taxes, delivery charges, and currency from server-owned data. Freeze the purchased product description and price into the order.
- Create one logical checkout attempt with an idempotency key. Repeated clicks must not create repeated reservations or payments.
- Reserve stock atomically before payment. Record an expiry and release abandoned reservations with a scheduled task.
- Persist the pending attempt before calling the provider. Reconcile uncertain provider responses instead of creating a new payment order blindly.
- Verify the checkout signature on the server. Verify webhook signatures against the raw body and the correct webhook secret.
- Match provider order ID, amount, currency, customer order, and captured status before marking paid.
- Deduplicate webhook events and payment IDs. Repeated or late events must not reduce stock twice or send duplicate receipts.
- If a captured payment arrives after a reservation expires, send it to an exception queue for fulfilment review or refund. Never promise unavailable stock.
- Keep payment status separate from fulfilment status. A refund must not silently reopen fulfilment.
- Retry failed receipts separately. An email failure must not undo a valid purchase.

[Razorpay's integration guide](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/) requires server signature verification and captured-status checks. Its [webhook guide](https://razorpay.com/docs/webhooks/) explains asynchronous payment notifications.

## B2B and B2C enquiries

B2B fields: contact name, business name, delivery area, products, approximate quantity and frequency, preferred contact method, and contact details. Ask only for information needed to quote. B2C fields: name, contact, topic, and message. Neither form requires login.

Store the lead in Convex first. Send an owner alert with a dashboard link. Record source page and allowed campaign tags. If the alert fails, the lead must remain in the dashboard for retry. Rate-limit forms and reject bot traffic without changing the account-free flow.

## Data owners

| Owner | Data |
| --- | --- |
| Better Auth component | Identities, verification records, sessions |
| Convex application | Products, stock, customer profile, orders, payment attempts, leads, notification status |
| Convex storage | Public product images; private files only if later required |
| Crisp | Conversation history and operator handoff |
| Razorpay | Payment execution and settlement |
| PostHog | Allowed measurement events; never financial truth |

Publish a narrow product view for the website and chatbot. Never return wholesale costs, supplier details, private notes, customer lists, or auth data in a public query.
