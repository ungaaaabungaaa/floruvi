import { publicImage } from "@/lib/public-images";
import type { StaticImageData } from "next/image";
const rawhoney0 = publicImage("flourvi/src/assets/products/honey-eggs/raw-honey-100ml.5c5a87148e4e2311.webp", 1100, 1100);
const rawhoney1 = publicImage("flourvi/src/assets/products/honey-eggs/raw-honey-250ml.628124e054424714.webp", 1100, 1100);
const rawhoney2 = publicImage("flourvi/src/assets/products/honey-eggs/raw-honey-500ml.6573b8ec80667233.webp", 1100, 1100);
const wildflowerhoney0 = publicImage("flourvi/src/assets/products/honey-eggs/wildflower-honey-100ml.64b6d1f1f4528f43.webp", 1100, 1100);
const wildflowerhoney1 = publicImage("flourvi/src/assets/products/honey-eggs/wildflower-honey-250ml.1122d5e2d6f98b59.webp", 1100, 1100);
const wildflowerhoney2 = publicImage("flourvi/src/assets/products/honey-eggs/wildflower-honey-500ml.b34f3ca982fa40ef.webp", 1100, 1100);
const singleflowerhoney0 = publicImage("flourvi/src/assets/products/honey-eggs/single-flower-honey-100ml.55767b0d00200630.webp", 1100, 1100);
const singleflowerhoney1 = publicImage("flourvi/src/assets/products/honey-eggs/single-flower-honey-250ml.0964be3c8d62ca9d.webp", 1100, 1100);
const singleflowerhoney2 = publicImage("flourvi/src/assets/products/honey-eggs/single-flower-honey-500ml.869de992bf89de44.webp", 1100, 1100);
const farmeggs1 = publicImage("flourvi/src/assets/products/honey-eggs/farm-eggs-12.9775fbf7520d50ce.webp", 1100, 1100);
const farmeggs2 = publicImage("flourvi/src/assets/products/honey-eggs/farm-eggs-24.669866538a9ad8d5.webp", 1100, 1100);
const farmeggs3 = publicImage("flourvi/src/assets/products/honey-eggs/farm-eggs-36.8f8361d29ef65f9f.webp", 1100, 1100);
const farmeggs4 = publicImage("flourvi/src/assets/products/honey-eggs/farm-eggs-48.cfd4518734d5df21.webp", 1100, 1100);
const honeyRecipe0 = publicImage("flourvi/src/assets/products/honey-eggs/honey-yoghurt-fruit-bowl.f15f39b91ae74fc8.webp", 1100, 1100);
const honeyRecipe1 = publicImage("flourvi/src/assets/products/honey-eggs/honey-lemon-mint-drink.e0aa7d8b4b355374.webp", 1100, 1100);
const honeyRecipe2 = publicImage("flourvi/src/assets/products/honey-eggs/honey-mustard-salad-dressing.ef8b1c270a4b4a49.webp", 1100, 1100);
export const honeyEggMainImages: Record<string, StaticImageData> = {
  "raw-honey": rawhoney0,
  "wildflower-honey": wildflowerhoney0,
  "single-flower-honey": singleflowerhoney0,
  "farm-eggs": farmeggs1,
};
export const honeyEggGalleryImages: Record<string, StaticImageData> = {
  "raw-honey": rawhoney1,
  "wildflower-honey": wildflowerhoney1,
  "single-flower-honey": singleflowerhoney1,
  "farm-eggs": farmeggs2,
};
export const honeyEggAdditionalImages: Record<string, StaticImageData[]> = {
  "raw-honey": [rawhoney2],
  "wildflower-honey": [wildflowerhoney2],
  "single-flower-honey": [singleflowerhoney2],
  "farm-eggs": [farmeggs3, farmeggs4],
};
export const honeyRecipeImages: Record<string, StaticImageData> = {
  "recipe:honey-yoghurt-fruit-bowl": honeyRecipe0,
  "recipe:honey-lemon-mint-drink": honeyRecipe1,
  "recipe:honey-mustard-salad-dressing": honeyRecipe2,
};

export const honeyEggPackImages: Record<
  string,
  Record<number, StaticImageData>
> = {
  "raw-honey": { 100: rawhoney0, 250: rawhoney1, 500: rawhoney2 },
  "wildflower-honey": {
    100: wildflowerhoney0,
    250: wildflowerhoney1,
    500: wildflowerhoney2,
  },
  "single-flower-honey": {
    100: singleflowerhoney0,
    250: singleflowerhoney1,
    500: singleflowerhoney2,
  },
  "farm-eggs": { 12: farmeggs1, 24: farmeggs2, 36: farmeggs3, 48: farmeggs4 },
};
