import { publicImage } from "@/lib/public-images";
import { productImages } from "./product-images";
const singleBox = publicImage("flourvi/src/assets/boxes/single.7342877a73128478.webp", 1200, 1200);
const dualBox = publicImage("flourvi/src/assets/boxes/dual.db94086bb4683784.webp", 1200, 1200);
const familyBox = publicImage("flourvi/src/assets/boxes/family.bdb02bb9f3802f90.webp", 1200, 1200);

/** Image URL per cart slug for the cart pill. Only URLs, so layouts stay light. */
export const cartThumbnails: Record<string, string> = {
  ...Object.fromEntries(Object.entries(productImages).map(([slug, image]) => [slug, image.src])),
  "box-single": singleBox.src,
  "box-dual": dualBox.src,
  "box-family": familyBox.src,
};
