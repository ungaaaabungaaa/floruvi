# Image delivery and proposed splash screen

10 October 2026. Image conversion is in scope. The splash screen is a proposal
only. The owner will supply or approve its design before implementation.

## Image delivery

- Convert 100 of the 103 tracked PNG sources under `src/assets` to lossless WebP.
  Keep the three existing optimized recipe WebP files.
- Keep source dimensions and transparency. Compare decoded visible pixels.
  RGB values under completely transparent pixels have no visible effect and
  are excluded from the comparison.
- Keep originals for future work. Existing WebP files do not need another encode.
- Use WebP imports throughout the app, including the shared mark and SEO logo.
  Keep browser and Apple icons in their standard PNG/ICO formats.
- Keep direct delivery. Do not re-enable paid image transforms.
- The unused testimonial component requests WebP from its existing image host.
  This remote host conversion is separate from the verified local lossless set.
- The public catalogue audit found 91 products and zero uploaded image URLs.
  Future owner uploads need the same conversion check before publication.
- Product, category, recipe and editorial images already have descriptive or
  localized alt text. Checkout images now use the localized item name.
- Empty alt text remains on decorative marks beside a brand label, hidden cart
  previews, duplicate hover photos, and thumbnails inside named gallery buttons.
  These images must not repeat the same label to screen readers.

Run `node scripts/prepare-lossless-webp.mjs` to reproduce conversion and pixel
checks. File sizes and results are in `src/assets/lossless-webp-report.json`.
This script uses the Sharp package supplied with the locked Next.js dependency.

Local result: 100 files decreased from 256,013,905 bytes to 180,748,248 bytes
(29.40% smaller). Every converted file is smaller. All visible-pixel comparisons
passed. The 665 existing WebP files were not re-encoded. These totals describe
the source collection, not bytes downloaded on each page.

Validation: all 37 image elements have alt attributes; no missing asset imports;
lint, TypeScript, all 138 tests and the production build passed (476 static pages).
The desktop home page had 226 WebP image elements and no broken loaded images.
English and Arabic carrot pages displayed the new main photo at 390 px with no
horizontal overflow. The Arabic main image retained its translated alt text.
Off-screen lazy images were not all downloaded during this browser check.
CI, production deployment and live acceptance are not part of this local result.

## Proposal: make the first page ready, then prepare likely next pages

Loading the entire platform before revealing it would make the first visit slow.
There are hundreds of images and 32 country/language versions. A visitor needs
only one version and a small part of the catalogue. A splash screen cannot remove
network delay. It can cover a short preparation step.

1. Render the requested public page on the server as today. Keep its content and
   image descriptions in the first HTML response. Direct product links must open
   that product, not detour through the home page.
2. Load the page styles, shared navigation, required public data and the first
   visible image. Decode that image before the normal reveal where possible.
3. Add a small overlay using the approved carrot mark, colour and motion.
   Do not hold a ready page open for an animation. Proposed maximum overlay time:
   1.5 seconds after activation. On timeout or error, show the usable page with
   a local loading or retry state. Provide a continue control. A CSS fail-open
   path must reveal content even if the controlling script fails.
4. Show the overlay at most once per tab session. Skip it for client navigation,
   back navigation, and visits where the first page is already ready. Keep the
   page available without JavaScript. Test keyboard focus, screen readers,
   reduced motion and Arabic layout. Do not announce false percentage progress.
5. After reveal, let Next.js prefetch visible links. Add only measured, bounded
   preparation for likely next pages, such as the shop, boxes, and visible product
   links. Keep the selected country and language in each address.
6. Prefetch image files separately only where useful: a route prefetch does not
   guarantee that its images are downloaded and decoded. Use a small byte budget
   and low concurrency. Stop optional work on slow or data-saving connections.
7. Keep public data in the existing server cache and invalidate it on owner edits.
   Continue live server checks for checkout price, stock and delivery. Never put
   customer, payment, chat or admin data in a shared preload cache.

## Design and rollout gates

The design needs the mark position, background, motion, loading text and continue
control. The first implementation should compare splash and no-splash sessions
under the same cold-cache and slow-mobile conditions.

Measure first usable content, largest contentful paint, bytes before reveal, and
navigation time. Proposed acceptance: no regression in time to useful content;
cached likely-next pages show useful content within 200 ms on the test device;
all failures release the overlay. These are test targets, not current results.

Test narrow mobile, keyboard, reduced motion, Arabic, direct product links,
return visits, offline errors, blocked images, no JavaScript and script failure.
Check that no private data is prefetched and no stale browser total is accepted.
Ship to a preview first. Production rollout follows design approval and preview
acceptance. No splash component, whole-site preload, or service worker is added
in this image change.

Release correction: the first conversion also replaced three existing recipe WebP
files. The pre-push review caught this size increase. Their original WebP files
were restored, and the conversion script now preserves them. The earlier
103-file summary included these three unnecessary conversions.

## Approved splash release — 10 October 2026

The owner approved the local design and requested production deployment. This
replaces the proposed 1.5-second maximum and once-per-session behaviour above.
The splash plays on a full page load, including cached visits. Client navigation
keeps the shared layout and does not replay it. The name and tagline remain
visible for a 2.8-second minimum preparation period, followed by a 1.3-second
upward reveal. There is no loading sentence, progress counter or preview chrome.

Only the first page image and fonts participate in readiness. A 4.5-second
JavaScript limit and a CSS exit after six seconds prevent an indefinite overlay.
Reduced-motion visitors get a short fade without the minimum display period.
Tap, Tab or Escape can start the reveal early. Without JavaScript, the overlay
is hidden. Public server-rendered content and existing lazy loading are retained.
No whole-platform preload or private-data cache was added.

The reported vton hydration mismatch involved elements absent from both the
source and server HTML. Fresh browser checks did not reproduce it; the specific
browser feature or extension remains unidentified. No warning suppression was
added. The exit timing bug was fixed with separate fallback and ready animation
names, so readiness starts a fresh animation rather than skipping to its end.
