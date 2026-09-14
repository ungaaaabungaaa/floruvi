import lettuce from "@/src/assets/crop-lettuce.png";
import spinach from "@/src/assets/crop-spinach.png";
import kale from "@/src/assets/crop-kale.png";
import basil from "@/src/assets/crop-basil.png";
import tomatoes from "@/src/assets/crop-tomatoes.png";
import microgreens from "@/src/assets/crop-microgreens.png";
import type { StaticImageData } from "next/image";

// Match each illustration to its crop. Owner-uploaded Convex images take priority.
export const productImages: Record<string, StaticImageData> = {
  "butterhead-lettuce": lettuce,
  spinach,
  "curly-kale": kale,
  "sweet-basil": basil,
  "cherry-tomatoes": tomatoes,
  "radish-microgreens": microgreens,
};
