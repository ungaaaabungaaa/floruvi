# Floruvi image sources

These 12 original PNGs were generated with GPT Image on 14 September 2026 for the owner's supplied design direction. The prompts are in `prompts.json`. Keep the source images here; Next.js creates optimized delivery variants from static imports.

- `hero-lifestyle.png`: homepage lifestyle concept.
- `growing-towers.png`: hydroponic growing concept. Not a photograph of Floruvi facilities.
- `salad-bowl.png`: salad and kitchen inspiration.
- `crop-*.png`: six crop illustrations with a photographic style. Crop appearance varies by harvest.
- `recipe-*.png`: smoothie, roasted vegetable bowl, and basil pasta serving ideas.

The owner supplied the layout references. They are not copied into these files. Generated assets are illustrative and must not be used as evidence of farm facilities, current stock, certification, or measured growing results.

`lib/product-images.ts` maps only the six pictured crops to these assets. An owner-uploaded Convex product image takes priority. Other crops use category illustrations until their own images are added.

## September 14 completion batch

The built-in image generation tool produced 79 additional crop images in `products/`, 10 category/editorial images, and the transparent carrot mark `floruvi-mark.png`. All 85 catalogue slugs have a matching image. Originals are preserved here. Prompts are in `product-prompts.json` and `page-prompts.json`. These images are illustrations, not proof of farm stock or the current harvest. Next.js serves optimized sizes. The mark is also used for the browser and Apple icons.

## October 2 product gallery batch

The built-in image generation tool produced four additional views for each of the current 91 products: 364 separate images in `products/additional/`. They use warm ivory limestone, soft daylight and natural crop colours. Views show whole crops, separated edible parts, close texture details and simple presentations. Live-tray products show the growing tray.

`lib/additional-product-images.ts` maps all 364 WebP files. `scripts/prepare-additional-product-images.ts` rebuilds that map and stops if any of the four files for a product is missing. Existing hero images, owner uploads and recipe images remain in the gallery.

The `product-gallery-prompts-*.json` files record each source PNG path and final WebP path. Original prompts are recorded for 363 images. The reused carrot view 1 records its source and a visual description; its original prompt was not retained. Original PNGs remain in the built-in tool's local generated-image folders. The images illustrate crop appearance; they do not document a specific harvest or current stock. See [the gallery notes](../../docs/34-product-images.md) for validation.
