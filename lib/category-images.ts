import leafy from "@/src/assets/category-leafy.png";
import herbs from "@/src/assets/category-herbs.png";
import microgreens from "@/src/assets/category-microgreens.png";
import fruiting from "@/src/assets/category-fruiting.png";
import roots from "@/src/assets/category-roots.png";
import flowers from "@/src/assets/category-flowers.png";
import type { StaticImageData } from "next/image";
export const categoryImages: Record<string, StaticImageData> = {
  "leafy-greens": leafy,
  herbs,
  microgreens,
  "fruiting-crops": fruiting,
  "roots-and-stems": roots,
  "edible-flowers": flowers,
};
