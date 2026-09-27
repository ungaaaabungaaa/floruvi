import { productImages } from "./product-images";
import singleBox from "@/src/assets/boxes/single.webp";
import dualBox from "@/src/assets/boxes/dual.webp";
import familyBox from "@/src/assets/boxes/family.webp";

/** Image URL per cart slug for the cart pill. Only URLs, so layouts stay light. */
export const cartThumbnails: Record<string, string> = {
  ...Object.fromEntries(Object.entries(productImages).map(([slug, image]) => [slug, image.src])),
  "box-single": singleBox.src,
  "box-dual": dualBox.src,
  "box-family": familyBox.src,
};
