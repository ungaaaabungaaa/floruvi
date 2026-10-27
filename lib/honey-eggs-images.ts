import type { StaticImageData } from "next/image";
import rawhoney0 from "@/src/assets/products/honey-eggs/raw-honey-100ml.webp";
import rawhoney1 from "@/src/assets/products/honey-eggs/raw-honey-250ml.webp";
import rawhoney2 from "@/src/assets/products/honey-eggs/raw-honey-500ml.webp";
import wildflowerhoney0 from "@/src/assets/products/honey-eggs/wildflower-honey-100ml.webp";
import wildflowerhoney1 from "@/src/assets/products/honey-eggs/wildflower-honey-250ml.webp";
import wildflowerhoney2 from "@/src/assets/products/honey-eggs/wildflower-honey-500ml.webp";
import singleflowerhoney0 from "@/src/assets/products/honey-eggs/single-flower-honey-100ml.webp";
import singleflowerhoney1 from "@/src/assets/products/honey-eggs/single-flower-honey-250ml.webp";
import singleflowerhoney2 from "@/src/assets/products/honey-eggs/single-flower-honey-500ml.webp";
import farmeggs1 from "@/src/assets/products/honey-eggs/farm-eggs-12.webp";
import farmeggs2 from "@/src/assets/products/honey-eggs/farm-eggs-24.webp";
import farmeggs3 from "@/src/assets/products/honey-eggs/farm-eggs-36.webp";
import farmeggs4 from "@/src/assets/products/honey-eggs/farm-eggs-48.webp";
import honeyRecipe0 from "@/src/assets/products/honey-eggs/honey-yoghurt-fruit-bowl.webp";
import honeyRecipe1 from "@/src/assets/products/honey-eggs/honey-lemon-mint-drink.webp";
import honeyRecipe2 from "@/src/assets/products/honey-eggs/honey-mustard-salad-dressing.webp";
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
