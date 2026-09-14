# Recipe expansion

## Scope

Add 84 original vegetable recipes to the existing four. Store all recipe content in Convex, including production. Keep existing URLs. Public queries return published recipes only. Seeds add missing slugs and preserve owner edits.

## Implementation

- Create measured ingredient lists, instructions, time estimates, servings and product links.
- Move the four existing recipes into seed input without changing their content.
- Read recipe lists, detail pages, home features and sitemap from Convex.
- Use the existing meal images for the original recipes. The owner also requested images: all 84 new entries get a separate generated dish image. Images are labelled as illustrative serving images.
- Show 12 cards at first, with search, category filters and Show more.

## Verification

Check unique slugs, required content, time totals, valid product links and 88 published recipes in development and production. Check filters, a new detail page, a preserved detail URL and the live deployment.

These recipes are original editorial cooking ideas. They have not been kitchen-tested. Do not claim measured nutrition, medical benefits or professional recipe testing.

## Status

All 84 dish images are generated, optimised and visually reviewed. All 19 tests, lint and the production build pass. Development and production both contain 88 recipes; repeat seeds added zero records. Local browser checks passed for search, categories, Show more, detail content and mobile layout. Recipe list and detail blocks are the first review slice; the remaining page blocks follow separately.

## Data commands

Run `convex dev --once` and `convex run seed:recipes` for development. For production, deploy with `convex deploy --yes`, then run `convex run --prod seed:recipes`. Query `recipes:list` to verify the published count. Images are versioned in `src/assets/recipes`; recipe rows store their image keys.
