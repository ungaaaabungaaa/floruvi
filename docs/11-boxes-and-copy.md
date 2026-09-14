# Box subscriptions and shorter copy

Approved: Single (one person), Dual (two), Family (four or more); daily, weekly, and every-two-weeks delivery. “Biweekly” is displayed as “Every 2 weeks” to avoid ambiguity.

The /boxes selector links to the existing contact form with a validated size and schedule. The form saves the selected box and cadence in the private Convex enquiry record. Invalid option values do not create a box request. No new account, payment, stock reservation, or recurring subscription is created.

Prices, contents, delivery coverage, and subscription pause/cancellation rules remain owner inputs. The interface states this once beside the request button.

The home, shop, category, editorial, form, basket, checkout, and footer copy was shortened. Recipe steps, crop notes, validation, consent, and privacy information remain available.

Validation: all nine size/schedule combinations pass the existing enquiry schema. Check the desktop/mobile selector and confirm selected values in the saved request before deployment.

## Verified locally

- Production build, TypeScript, ESLint, and 12 tests passed.
- Desktop selector and 390 px mobile selector checked; no horizontal overflow at 390 or 900 px.
- Family + Daily carried into the contact form. The success state appeared after submission. A direct development database read confirmed the exact box and cadence in one labelled synthetic QA record. No fulfilment is required.
- Homepage images and shorter copy checked in the browser. Existing payment and OTP boundaries remain unchanged.
