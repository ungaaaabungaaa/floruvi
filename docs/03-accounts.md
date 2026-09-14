# 3. Accounts and setup

Status: checklist only. No provider account has been created or connected in this planning task.

Use business-owned accounts and a password manager. Enable strong sign-in and recovery methods. Do not put credentials in this document, chat, or Git.

## Start first: external lead times

| Account or input | Prepare | Proof needed |
| --- | --- | --- |
| Razorpay merchant account | Business details, settlement bank, required verification documents, domain, contact and policy pages | Live account active; approved payment methods; test and live settings separated |
| Twilio SMS | Billing, destination countries, permitted sender/route, required India registration and template steps where applicable | A real code reaches target handsets; costs and delivery limits understood |
| Meta business assets | Owner access to business portfolio, WhatsApp Business number, Instagram professional account and required linked assets | Each required channel sends and receives through Crisp |
| Domain and DNS | Access to the domain registrar and DNS records | Website host and email records can be verified |
| Farm catalogue | Products, photos, pack sizes, prices, stock, service area, delivery fee, minimum order, policies | Owner approves real sale information |

Provider approval times are not controlled by the code schedule. Do not promise a seven-day live launch until these checks pass. See [Twilio India requirements](https://www.twilio.com/en-us/guidelines/in/sms) and the selected provider's onboarding screens for the actual route.

## Application accounts

1. **GitHub:** use [ungaaaabungaaa/floruvi](https://github.com/ungaaaabungaaa/floruvi). Give Vercel access to this repository when the app is ready.
2. **Convex:** use an owner-controlled team. Create development and production deployments. Decide Starter usage billing versus Professional backups. Choose a region using the actual buyer location and current provider availability.
3. **Vercel Pro:** import the repository after the app exists. Separate production and preview environment settings.
4. **Resend:** verify a sending domain. Set SPF and DKIM as instructed, plus an appropriate DMARC policy. Keep a real monitored support mailbox; Resend is not the operator inbox.
5. **Crisp:** start an Essentials trial. Set the support inbox, operator account, hours, mobile alerts, translation, and required channels. Complete the trial matrix in the chat plan.
6. **Google AI Studio / Gemini API:** create a business-controlled paid API project. Enable only the required model access. Set billing alerts and an application request quota.
7. **PostHog:** create a project, select its region, set data controls, and configure the agreed funnel and error events.
8. **OneSignal:** create a web app for the final origin. Configure HTTPS, service worker, manifest, and prompt behavior. A preview uses its own safe test setup.
9. **Google Search Console:** verify the domain and submit the sitemap after launch.
10. **Google Business Profile:** create or update it only if the farm is eligible. Use the actual service area and business details.

Better Auth needs configuration and a secret, not another hosted account. Stripe account work is later. Google Ads and Meta Ads setup follows the accepted launch and budget.

## Secret placement

| Location | What belongs there |
| --- | --- |
| Convex environment | Better Auth secret; Resend and SMS keys; Razorpay secret and webhook secret; Crisp private API credentials; Gemini key; notification server keys |
| Vercel production environment | Production Convex deployment credential for the build; public app/Convex origins and client IDs as needed |
| Vercel preview environment | Preview-specific Convex setup and test settings; no production deployment key |
| Browser bundle | Only documented public URLs, publishable IDs, and public analytics configuration |
| Password manager | Owner credentials, recovery codes, provider account ownership records |

Use an `.env.example` with names only when implementation starts. Never use a `NEXT_PUBLIC_` name for a secret. Verify the exact integration variable names from installed versions rather than copying untested examples.

## Owner input before accepting orders

- Legal business name and public contact information.
- Actual products, units, prices, stock, and relevant food/product information.
- Delivery areas, timing, cut-off, fees, and minimum order.
- Cancellation, refund, failed-delivery, privacy, and contact policies.
- Required business, food-sale, invoicing, and tax details for the actual operation. Confirm applicability with the owner's adviser; this plan does not invent a tax rate or claim legal readiness.
- Support hours and who answers messages.
- Monthly service and advertising budgets.

## Backup and handover

Choose a protected destination for data and media backups before live orders. Test restoration into a separate deployment. If using manual exports on Starter, name the responsible person and frequency. If choosing Professional, verify managed backup coverage, retention, and restoration, including the treatment of stored files.

Never push customer exports or database backups to the source repository. Keep the owner able to export products, orders, and leads from the application.
