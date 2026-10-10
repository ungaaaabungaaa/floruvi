import leafy from "@/src/assets/category-leafy.webp";
import herbs from "@/src/assets/category-herbs.webp";
import microgreens from "@/src/assets/category-microgreens.webp";
import fruiting from "@/src/assets/category-fruiting.webp";
import roots from "@/src/assets/category-roots.webp";
import flowers from "@/src/assets/category-flowers.webp";
import type { StaticImageData } from "next/image";
export const categoryImages: Record<string, StaticImageData> = {
  "leafy-greens": leafy,
  herbs,
  microgreens,
  "fruiting-crops": fruiting,
  "roots-and-stems": roots,
  "edible-flowers": flowers,
};
