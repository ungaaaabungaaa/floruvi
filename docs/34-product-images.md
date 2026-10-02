# Additional product images

Owner request: 2 October 2026. Add four new images for each of the 91 products. Keep the existing image style and preserve existing gallery images.

The new set uses warm ivory limestone, natural daylight and accurate crop colours. Each crop has four separate generated photographs: an angled view, separated portions, a texture detail and a simple presentation. Live trays show the growing crop in its tray. Cut microgreens remain distinct from live trays and mature vegetables.

The built-in image generation tool produces the images. Original PNG files remain in its local output folder. Optimised WebP files are saved in `src/assets/products/additional/`. Prompts and file provenance are recorded in `src/assets/product-gallery-prompts-*.json`.

Run `node --import tsx scripts/prepare-additional-product-images.ts` to build the static import map. This checks for all four files per catalogue slug and stops if a file is missing. The gallery preserves the owner-uploaded main image and existing recipe links. The thumbnail row scrolls so the additional images retain usable touch targets on phones and support keyboard focus.

Generated images illustrate crop appearance and preparation. They are not evidence of current farm stock or a specific harvest.

## Verification

All 364 WebP files are saved and mapped: four for every catalogue product. Each generated output was visually checked. Three chervil views were replaced to correct leaf shape, and two potato views were replaced to remove leaves. The manifests preserve source paths and the selected prompts. The reused carrot view 1 has a recorded source and visual description; its original prompt was not retained.

Content commit `c52ee0e` and SEO merge `c7edef4` are on `codex/product-images-benefits`. The independent feature review found no concrete bugs in the guarded content update, translations, gallery controls or SEO preservation. A 390 px gallery check confirms 64 px thumbnails, horizontal scrolling inside the row, no page overflow and keyboard selection of the fourth new image. English and Arabic pages and the basket also fit 320 px.

The final import map is complete. The file audit decoded all 364 images, found 364 distinct file hashes and matched every file to its manifest and original PNG. All images are square, with widths from 960 to 1,254 pixels. The WebP set totals 68.24 MB.

The combined revision passed all 73 tests, lint, TypeScript and the production build. The local build used `next build --webpack` because this worktree shares a dependency symlink outside its root. The build generated 470 static pages. The full eight-image carrot gallery loads all thumbnails on desktop. Keyboard selection works for the fourth new image and the final recipe image. At 320 px, thumbnails remain 64 px wide and scroll within a 278 px row; the page does not overflow. The temporary basket test item was removed after the check.

The website release includes the merged SEO revision `1cb685e`. Publication and live checks follow the final image commit.
