# 5. One-week delivery plan

Status: proposed sequence, not an implementation completion report.

Assumptions: one experienced developer; one stock location; fixed product packs; simple delivery rules; B2B quote requests; a small initial catalogue; prompt design decisions from the owner. The seven days are a target, not a guarantee of third-party approval.

## Before the clock starts

- Accept the stack, budget, and launch scope.
- Start merchant, SMS, and Meta channel applications immediately.
- Confirm catalogue, delivery rules, public business details, and policies.
- Complete the Crisp trial checks that could change the vendor choice.
- Resolve a failure of either OTP method before building the full checkout.

## Daily steps

| Day | Work | Exit evidence |
| --- | --- | --- |
| 1 | Scaffold Next.js, shadcn, Convex, and Better Auth. Pin compatible versions. Connect Resend and SMS in development. Set owner access. | New and returning buyers can verify by either method. Wrong and expired codes fail. A customer cannot access owner functions. |
| 2 | Build product data, image upload, simple product/stock admin, and public product pages. Apply the owner's initial visual direction. | Owner edits update the catalogue. Public HTML contains product content. Images and narrow mobile layout pass review. |
| 3 | Build cart, delivery rules, checkout identity, and B2C/B2B forms. Add atomic stock reservations. | Anonymous shopping works. Totals are server-owned. Concurrent buyers cannot reserve the same last unit. Leads persist if alerts fail. |
| 4 | Integrate Razorpay test mode, signatures, webhooks, retry/reconciliation, receipt, and order admin. | Successful, failed, abandoned, duplicate, delayed, and tampered payment cases pass. |
| 5 | Connect Crisp and required channels. Configure translation. Add the restricted classifier/tool connector and handoff. | Arabic/original-message checks, public product links, takeover, and abuse tests pass. |
| 6 | Add PostHog funnel/errors, optional browser push, SEO metadata, structured data, sitemap, and launch policies. | No sensitive telemetry. Consent and denied-push paths work. Search and mobile checks pass. |
| 7 | Run end-to-end checks, restore a backup, deploy the accepted release, and complete a controlled real order and operator rehearsal. | Live order, stock, receipt, operator alerts, and provider records agree. Owner can operate the system. |

## Scope control

Protect payments, access control, both OTP methods, and delivery accuracy. Do not cut their checks to meet the date.

If time is short, reduce decorative motion, dashboard polish, extra page templates, advanced product carousels, and secondary channel work. The user's required channels and translation must not be silently declared complete. Any reduced-scope launch needs an explicit owner decision with a list of deferred items.

If a provider is not approved, the code may be ready while the affected flow is not live. Do not mark the whole launch complete. A temporary enquiry-only launch is an option only if the owner chooses it.

## Deployment procedure

1. Push reviewed source and lockfiles to the GitHub repository. Check the remote commit.
2. Connect the repository to Vercel Pro after an application exists.
3. Connect the chosen Convex project using the [official Vercel guide](https://docs.convex.dev/production/hosting/vercel). Use one coordinated backend/frontend build flow.
4. Keep the production deploy credential scoped to Production. Give preview deployments separate data and test provider keys.
5. Configure real origins, auth trusted origins, callback URLs, DNS, and sending-domain records.
6. Configure Razorpay live webhook URLs and secrets separately from test mode. Verify the endpoint before accepting traffic.
7. Check the deployed commit, public pages, protected functions, and provider health.
8. Complete one controlled live purchase and a fulfilment rehearsal. Check captured payment, one stock deduction, receipt, and secure order access.
9. Record release evidence and known limitations in a launch note. A green build alone is insufficient.

Only the source backup is authorized for execution in the current planning phase. The repository push is not a claim that the app is ready to deploy.

## Recovery procedure

- If checkout fails, stop new payment attempts and show a clear contact route. Keep existing paid orders visible to the operator.
- Use the prior Vercel release for a frontend regression. Maintain compatible backend changes; a frontend rollback does not roll back data.
- Reconcile pending payments from Razorpay before changing their order status. Never delete uncertain orders to clear an error.
- Test data restoration in a separate Convex deployment. Include images in the backup plan; source code is not a file backup.
- Verify the actual backup coverage and acceptable data-loss window before launch.

## After launch

Freeze feature growth for two weeks except for sales blockers and correctness fixes. Review the funnel, respond to leads, call B2B prospects, and improve product photos and offers. Use [the growth checklist](06-quality-and-growth.md#first-two-weeks-of-growth) to decide what deserves development time.
