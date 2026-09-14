# Run and maintain Floruvi

## 1. Local development

Use Node.js 24 and pnpm 10.30.3. The lockfile records the installed package versions.

```sh
pnpm install --frozen-lockfile
pnpm dev --hostname 127.0.0.1 --port 3105
```

Open `http://127.0.0.1:3105`. Port 3105 avoids a conflict with another application on this machine.

The current `.env.local` is already configured. Do not replace it with the example file. For a new checkout, copy `.env.example` to `.env.local`, select the existing Convex development project, and configure a private enquiry key.

```sh
pnpm exec convex deployment select efficient-toad-585
pnpm exec convex dev --once
pnpm convex:seed
```

The `seed:catalogue` function is internal. Run it through the authenticated Convex CLI. It inserts missing slugs and preserves existing owner edits. It does not synchronise edits between deployments. Run `pnpm exec convex run seed:pricing` after deploying price fields. This fills missing researched prices and delivery settings while preserving existing values. See `docs/11-pricing-research.md`.

## 2. Environments

| Target | Public API | HTTP actions | Data |
| --- | --- | --- | --- |
| Development / Vercel Preview | `https://efficient-toad-585.eu-west-1.convex.cloud` | `https://efficient-toad-585.eu-west-1.convex.site` | Development crops and test enquiries |
| Production / Vercel Production | `https://polished-mosquito-828.eu-west-1.convex.cloud` | `https://polished-mosquito-828.eu-west-1.convex.site` | Production crops and customer enquiries |

Configure these variables in the matching Vercel environment:

- `NEXT_PUBLIC_CONVEX_URL`: the API address from the table.
- `NEXT_PUBLIC_CONVEX_SITE_URL`: the HTTP action address from the same row.
- `LEAD_INGEST_SECRET`: a long random secret, stored as sensitive. Set the same value in that Convex deployment. Use a different secret for each environment.
- `NEXT_PUBLIC_SITE_URL`: the final public origin when a custom domain is confirmed. When absent on Vercel, metadata uses the deployment URL. Locally, set it to the local address.

Public URLs are not credentials. The enquiry secret must never have a `NEXT_PUBLIC_` prefix. Local secrets are in ignored `.env.local` and `.env.convex-production` files. Neither is uploaded to Vercel or committed. A future checkout must get secrets from the account owner or rotate them in both matching services.

To set a Convex secret without putting it in shell history, pipe the value into `pnpm exec convex env set LEAD_INGEST_SECRET`. Add `--prod` for production. Do not print secrets in logs.

## 3. Deploy and seed production

Use the existing project. Do not create another database for the same environment.

```sh
pnpm exec convex deploy --typecheck enable
pnpm exec convex run seed:catalogue --prod
pnpm exec convex run seed:pricing --prod
vercel deploy --prod
```

Confirm the production target `polished-mosquito-828` when the CLI asks. Read the seed result and verify the public query returns six categories and 85 crops. A repeat seed should report `added: 0` unless new crop slugs were added.

The current Vercel build command is `pnpm build`. Convex functions must be deployed first when their schema or function API changes. For automatic deployments later, configure a production `CONVEX_DEPLOY_KEY` as a Vercel secret and use `pnpm build:vercel`. This key is not created or stored in Git by the current build.

The Vercel project exists in `thehelds-projects`. Its GitHub connection is pending: Vercel requires the owner's GitHub login connection before it can link `ungaaaabungaaa/floruvi`. Until connected, a GitHub push is a backup, not an automatic deployment.

## 4. Products and enquiries

Use the Convex dashboard for this first build:

- Open the correct development or production deployment.
- Edit `products` for crop copy, visibility (`published`), or featured selection.
- Edit `categories` for category copy and order.
- View `enquiries` for private business and personal requests. There is no public enquiry-list function or account-free admin page.
- After handling a request, remove personal records according to the retention policy you set for the farm. A scheduled retention policy and a direct privacy contact remain launch tasks.

Product records can reference a Convex Storage file with `imageId`. The application renders that public image when present. Otherwise it uses a category illustration. An upload dashboard is outside this slice; do not add an unauthenticated upload function.

The initial seed is a broad planning list, not every possible species or cultivar and not current farm stock. Product sources distinguish routine crops, specialist trials, and aeroponic seed-potato production. Confirm actual crops, food-grade varieties, prices, pack sizes, delivery areas, and availability before sales begin.

## 5. Form security

The browser submits to the Next.js enquiry route. That route checks origin, validates fields, caps request size, and calls the fixed Convex HTTP address using the server secret. Convex checks the secret, validates again, and saves through an internal mutation.

Persistent limits allow five accepted requests per IP hash per hour, three per contact hash, and 100 across the site. Vercel supplies the client IP header. Other hosting environments use a shared limit until a trusted proxy integration is added. The raw IP is not stored in the enquiry record. A honeypot rejects basic form bots. Limits are an initial abuse control, not full bot protection; add the platform's managed controls if traffic requires them.

Enquiries are stored only. Email alerts, SMS replies, and human chat delivery are not connected. Check the dashboard to handle requests.

## 6. Check changes

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

The eight focused tests cover catalogue integrity, search, guide boundaries, form validation, origin checks, request limits, and server failure handling. Browser acceptance covers mobile navigation, filters, product links, prefilled forms, and a real save to the development database.

If this restricted desktop blocks Turbopack's local worker port, use `pnpm exec next build --webpack` for local build verification. Vercel uses the standard `pnpm build` command.

## 7. Next launch work

Apply the Figma design. Confirm real stock, pack sizes, delivery rules, and privacy contact. Then set up email and phone OTP at final checkout, Razorpay, analytics, and the selected managed chat service. Validate Arabic translation and original-message access before promising those features to visitors. Keep Stripe as a later integration.

## Design and editorial content

The owner’s reference controls the visual direction. Original generated PNGs and prompts are in `src/assets`. Next Image serves optimized variants. Six crops have matching generated images; other crops keep category illustrations. Convex image uploads override the local crop image.

Recipes are edited in `lib/recipes.ts`; they do not require a new service. The nutrition pages link to their primary sources. The chat component is retained but is not mounted in the root layout. Do not turn it on until the later OpenRouter work is approved.

## Published site

Public address: https://floruvi.vercel.app

The first successful production publication on 14 September 2026 passed the Vercel Turbopack build. Live checks returned 200 for the homepage, recipes, nutrition, product detail, and both enquiry pages. The public catalogue returned 85 crops and six categories. Invalid enquiry data returned 400. Production has its own Convex endpoint and enquiry secret. `NEXT_PUBLIC_SITE_URL` is set to the stable public address for canonical links and sharing.
