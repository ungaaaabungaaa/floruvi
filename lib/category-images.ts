import { publicImage } from "@/lib/public-images";
import { dehydratedMainImages } from "./dehydrated-images";
const leafy = publicImage("flourvi/src/assets/category-leafy.a215d953cf7daafd.webp", 1536, 1024);
const herbs = publicImage("flourvi/src/assets/category-herbs.73ffeefe24d1acb1.webp", 1536, 1024);
const microgreens = publicImage("flourvi/src/assets/category-microgreens.7ec3a24b4ae72e16.webp", 1536, 1024);
const fruiting = publicImage("flourvi/src/assets/category-fruiting.c788ce910b31f852.webp", 1536, 1024);
const roots = publicImage("flourvi/src/assets/category-roots.b508afee2f51db57.webp", 1536, 1024);
const flowers = publicImage("flourvi/src/assets/category-flowers.c38a2ddfb67cf2c8.webp", 1536, 1024);
import type { StaticImageData } from "next/image";
export const categoryImages: Record<string, StaticImageData> = {
  "flours-and-powders": dehydratedMainImages["green-banana-flour"],
  "leafy-greens": leafy,
  herbs,
  microgreens,
  "fruiting-crops": fruiting,
  "roots-and-stems": roots,
  "edible-flowers": flowers,
};
