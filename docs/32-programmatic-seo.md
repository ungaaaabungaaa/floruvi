# Catalogue SEO release

Owner request: 2 October 2026. Complete the required programmatic SEO and push to `main` for deployment. The SIM and Meta Business Suite setup are separate owner tasks.

## Starting state

- Branch: `main`, commit `3db3a6b`. The working tree was clean. `origin/main` matched after fetch.
- Public domain: `https://floruvi.com`.
- Existing pages have metadata, country and language links, product and recipe search data, and 32 sitemap files.
- The six catalogue categories have filters but no dedicated search pages.
- No backend schema change is required. Convex remains the source for products, prices and availability.

- Isolation: the owner requested parallel worktrees. SEO uses `codex/floruvi-seo`; images and product content use `codex/product-images-benefits`. Integrate both without discarding either task.

## Work

1. Add `/products/category/{slug}` for each supported, non-empty catalogue category.
2. Use distinct category guidance, live products, matching recipes and a bulk enquiry link. Translate the new text in all ten existing languages.
3. Link categories from the shop and homepage catalogue. Add them to the sitemap and `llms.txt`.
4. Give each category page its own title, description, canonical, language links and collection/breadcrumb search data.
5. Improve the homepage search title and product search data. Keep the owner-approved product hero without visible breadcrumbs.
6. Check local tests, translation coverage, build, rendered pages and narrow screens. Push only after checks pass. Check the resulting production deployment separately.

## Boundaries

- Do not make city doorway pages, unverified demand claims, reviews, certification claims or stock promises.
- Preserve each locale's canonical URL and reciprocal language links. Do not apply the older cross-language canonical proposal in docs/21.
- Preserve payment, OTP and chat controls. No private or transactional pages enter the sitemap.
- Search Console ownership and sitemap submission require access to that account. A deployment does not prove indexing or ranking.

## Reference

[Google's ecommerce site structure guide](https://developers.google.com/search/docs/specialty/ecommerce/help-google-understand-your-ecommerce-site-structure) recommends crawlable links from categories to products. [Google's multilingual guide](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites) explains locale URLs and language annotations. These guides support the implementation; they do not promise ranking.

## Verification

- Local production build passed with Next.js 16.3.5 using Webpack. No backend deployment is required.
- All 69 tests, TypeScript and lint passed. Translation keys and placeholders passed in all ten languages. Native-speaker review is still pending.
- The HTTP check verifies the 32 sitemaps, 6,272 public URLs and all 192 category pages. It checks canonical URLs, reciprocal language links, translated headings, product lists, breadcrumbs, policy scope and invalid-category responses. Run `node --import tsx scripts/seo/check-site.ts https://floruvi.com` after deployment.
- Browser checks: microgreens at 320px and Arabic microgreens at 390px fit without horizontal overflow. Keyboard focus reaches the skip link. No browser console errors were recorded.
- Independent review found that a business-wide shipping fee could apply to free-delivery boxes. The fee is scoped to individual Product offers instead. The markup is supported by Schema.org; Google rich-result eligibility remains unverified. No delivery-time split is invented.
- Production deployment, live crawl results and the final Git SHA are reported in the delivery chat after push. Search Console verification, sitemap submission and indexing remain separate owner/account checks.
- The image/content chat will integrate the published SEO commit before its final checks and publication. Its 364-image generation task continues in its own worktree.
