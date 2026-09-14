# Public website build

The approved scope includes public pages, crop categories and details, B2B/B2C enquiries, Convex data, and the owner's visual references. The owner then added recipes and editorial pages and asked to hide chat until later OpenRouter work.

Baseline: initial source commit `09006d2`. The initial working tree was clean. The implementation preserves the selected Next.js, shadcn-style components, and Convex approach.

## Delivered pages

- Home: lifestyle image, crop cards, category links, growing approach, kitchen inspiration, and enquiry links.
- Products: 85 crops, search, category filters, and sorting. Six categories have their own pages.
- Product detail: image gallery, culinary uses, growing notes, source references, and prefilled enquiry links.
- Recipes: searchable list of four original recipes with ingredients, preparation steps, serving counts, and product links.
- Health and nutrition, how we grow, our story, sustainability, and real talk.
- Personal enquiry, business enquiry, and current privacy notice.

Twelve generated image sources are in `src/assets`. They are illustrative. Owner-uploaded Convex crop images take priority. Chat code remains in the repository but the layout does not mount it.

## Data and enquiry boundaries

- Development: `efficient-toad-585.eu-west-1.convex.cloud`.
- Production: `polished-mosquito-828.eu-west-1.convex.cloud`.
- Both deployments contain 85 crops in six categories. Production seeding inserted 85; a second run inserted zero. Seeding preserves existing owner edits.
- Catalogue data is public. Enquiry records and catalogue mutations are private/internal.
- The Next.js enquiry endpoint validates input and origin, limits body size, and calls Convex with a server-only secret. Persistent limits apply per email, IP hash, and deployment.
- Each environment uses its own enquiry secret. No secrets are committed or included in deployment uploads.
- Forms report success only after Convex confirms storage. No email alert service is connected yet; operators read enquiries in the Convex dashboard.

## Verification on 14 September 2026

- Local production build with Webpack: passed, including TypeScript and route generation.
- ESLint: passed. Eight focused tests: passed. Coverage includes catalogue integrity, search, retained guide bounds, origin validation, input validation, rate limits, and the enquiry server boundary.
- Local HTTP check: all 107 sitemap URLs returned 200. Unknown product and recipe slugs returned 404.
- Browser: desktop homepage and nutrition page; phone homepage and recipe/product details; recipe search, category filter, empty-state reset, gallery thumbnails, mobile menu and Escape dismissal. Checked 390 px layouts without horizontal overflow. Chat entry point absent.
- Earlier live development form checks saved personal and business enquiries. Private records confirmed consent and buyer type. Persistent limits returned 429 after the cap. Five synthetic enquiry records were removed after verification.
- Direct unauthenticated Convex enquiry access was rejected.
- Vercel production build with Turbopack: passed. Live public pages returned 200, the catalogue returned 85 crops and six categories, and invalid enquiry data returned 400. Public URL: https://floruvi.vercel.app.

Recipes and generated images are editorial starting points. Cooking results have not been kitchen-tested. Nutrition text links to WHO and NIDDK; the site makes no measured farm sustainability claims or medical-cost promises.

## Remaining launch work

Set real harvest availability, pack sizes, prices, delivery area, contact details, and the privacy retention process. Enable checkout, OTP, payments, analytics, notifications, and OpenRouter chat in later approved work. These services are not active in this build.

Vercel CLI publication and GitHub source backup are tracked in the running guide. Automatic Git deployments need the owner's GitHub login connection in Vercel. A source push is not proof of a deployment.
