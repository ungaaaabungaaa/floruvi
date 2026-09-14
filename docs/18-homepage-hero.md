# Homepage hero — 15 September 2026

## Design

The owner requested five or six image-led heroes and navigation over the image. This version uses one carousel with six stories. Products remain directly below it. The banners have no purchase buttons.

1. The harvest: a crate of leafy greens.
2. Your everyday: fresh leaves being rinsed.
3. More colour: colourful vegetables.
4. Little wonders: radish microgreens.
5. Growing better: an illustrative vertical growing scene.
6. At your table: a shared meal.

The owner rejected the generated woman portrait. It is not in the project asset set. None of these hero images shows a face. The social preview also uses the harvest image.

Built-in image generation produced the photographs. Optimized WebP files and the exact prompts are in `src/assets/home-hero/`. The images illustrate the brand; they do not document the actual farm. Original generated files remain at the source paths recorded in `generation.json`.

Headlines remain HTML text. Desktop places text to the left. Phone layouts place text above the main image subject. The homepage header overlays the image at the top and gains a paper background on scroll. Other pages retain their normal header.

## Controls

Slides advance every seven seconds while the hero is visible. Rotation pauses during hover or keyboard focus, when the page is hidden, and after a manual slide selection. The play control can enable rotation again after interaction ends. Reduced-motion mode disables rotation and fades. Arrow buttons, six labelled selectors, and horizontal touch swipes provide manual control.

No new package, data model, checkout rule, or provider was added.

## Local verification

- TypeScript and lint passed.
- All 26 existing tests passed.
- The local production build passed with `next build --webpack`.
- Browser checks covered all six loaded images, each selector, keyboard advance and wraparound, the mobile navigation menu, and reduced-motion styling and controls.
- Desktop and 390 px / 320 px phone layouts were inspected. No horizontal page overflow was found.
- Touch swipe handling is implemented but was not exercised: the in-app browser does not support synthetic touch events. Check a physical phone before live acceptance.

These are local results. CI, deployment, and live acceptance are separate checks.
