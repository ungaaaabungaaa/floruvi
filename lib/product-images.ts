import crop0 from "@/src/assets/products/broccoli-microgreens.png";
import crop1 from "@/src/assets/products/spring-onions.png";
import crop2 from "@/src/assets/products/nasturtium-flowers.png";
import crop3 from "@/src/assets/products/romaine-lettuce.png";
import crop4 from "@/src/assets/products/thai-basil.png";
import crop5 from "@/src/assets/products/beefsteak-tomatoes.png";
import crop6 from "@/src/assets/products/celery.png";
import crop7 from "@/src/assets/products/viola-flowers.png";
import crop8 from "@/src/assets/products/green-oakleaf-lettuce.png";
import crop9 from "@/src/assets/products/holy-basil.png";
import crop10 from "@/src/assets/products/pea-shoots.png";
import crop11 from "@/src/assets/products/plum-tomatoes.png";
import crop12 from "@/src/assets/products/radish.png";
import crop13 from "@/src/assets/products/pansy-flowers.png";
import crop14 from "@/src/assets/products/red-oakleaf-lettuce.png";
import crop15 from "@/src/assets/products/mint.png";
import crop16 from "@/src/assets/products/sunflower-shoots.png";
import crop17 from "@/src/assets/products/cucumber.png";
import crop18 from "@/src/assets/products/beetroot.png";
import crop19 from "@/src/assets/products/calendula-petals.png";
import crop20 from "@/src/assets/products/lollo-rosso-lettuce.png";
import crop21 from "@/src/assets/products/coriander.png";
import crop22 from "@/src/assets/products/mustard-microgreens.png";
import crop23 from "@/src/assets/products/bell-peppers.png";
import crop24 from "@/src/assets/products/carrot.png";
import crop25 from "@/src/assets/products/borage-flowers.png";
import crop26 from "@/src/assets/products/lollo-bionda-lettuce.png";
import crop27 from "@/src/assets/products/flat-leaf-parsley.png";
import crop28 from "@/src/assets/products/red-cabbage-microgreens.png";
import crop29 from "@/src/assets/products/green-chillies.png";
import crop30 from "@/src/assets/products/ginger.png";
import crop31 from "@/src/assets/products/iceberg-lettuce.png";
import crop32 from "@/src/assets/products/curly-parsley.png";
import crop33 from "@/src/assets/products/kale-microgreens.png";
import crop34 from "@/src/assets/products/jalapeno-peppers.png";
import crop35 from "@/src/assets/products/turmeric.png";
import crop36 from "@/src/assets/products/arugula.png";
import crop37 from "@/src/assets/products/dill.png";
import crop38 from "@/src/assets/products/arugula-microgreens.png";
import crop39 from "@/src/assets/products/strawberries.png";
import crop40 from "@/src/assets/products/potato.png";
import crop41 from "@/src/assets/products/chives.png";
import crop42 from "@/src/assets/products/beet-microgreens.png";
import crop43 from "@/src/assets/products/eggplant.png";
import crop44 from "@/src/assets/products/baby-kale.png";
import crop45 from "@/src/assets/products/garlic-chives.png";
import crop46 from "@/src/assets/products/amaranth-microgreens.png";
import crop47 from "@/src/assets/products/zucchini.png";
import crop48 from "@/src/assets/products/oregano.png";
import crop49 from "@/src/assets/products/basil-microgreens.png";
import crop50 from "@/src/assets/products/muskmelon.png";
import crop51 from "@/src/assets/products/lacinato-kale.png";
import crop52 from "@/src/assets/products/thyme.png";
import crop53 from "@/src/assets/products/coriander-microgreens.png";
import crop54 from "@/src/assets/products/green-beans.png";
import crop55 from "@/src/assets/products/swiss-chard.png";
import crop56 from "@/src/assets/products/rosemary.png";
import crop57 from "@/src/assets/products/fenugreek-microgreens.png";
import crop58 from "@/src/assets/products/bok-choy.png";
import crop59 from "@/src/assets/products/sage.png";
import crop60 from "@/src/assets/products/wheatgrass.png";
import crop61 from "@/src/assets/products/tatsoi.png";
import crop62 from "@/src/assets/products/lemon-balm.png";
import crop63 from "@/src/assets/products/kohlrabi-microgreens.png";
import crop64 from "@/src/assets/products/mizuna.png";
import crop65 from "@/src/assets/products/shiso.png";
import crop66 from "@/src/assets/products/garden-cress-microgreens.png";
import crop67 from "@/src/assets/products/mustard-greens.png";
import crop68 from "@/src/assets/products/chervil.png";
import crop69 from "@/src/assets/products/watercress.png";
import crop70 from "@/src/assets/products/tarragon.png";
import crop71 from "@/src/assets/products/sorrel.png";
import crop72 from "@/src/assets/products/marjoram.png";
import crop73 from "@/src/assets/products/endive.png";
import crop74 from "@/src/assets/products/lemongrass.png";
import crop75 from "@/src/assets/products/radicchio.png";
import crop76 from "@/src/assets/products/amaranth-greens.png";
import crop77 from "@/src/assets/products/fenugreek-greens.png";
import crop78 from "@/src/assets/products/napa-cabbage.png";
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
  "broccoli-microgreens": crop0,
  "spring-onions": crop1,
  "nasturtium-flowers": crop2,
  "romaine-lettuce": crop3,
  "thai-basil": crop4,
  "beefsteak-tomatoes": crop5,
  celery: crop6,
  "viola-flowers": crop7,
  "green-oakleaf-lettuce": crop8,
  "holy-basil": crop9,
  "pea-shoots": crop10,
  "plum-tomatoes": crop11,
  radish: crop12,
  "pansy-flowers": crop13,
  "red-oakleaf-lettuce": crop14,
  mint: crop15,
  "sunflower-shoots": crop16,
  cucumber: crop17,
  beetroot: crop18,
  "calendula-petals": crop19,
  "lollo-rosso-lettuce": crop20,
  coriander: crop21,
  "mustard-microgreens": crop22,
  "bell-peppers": crop23,
  carrot: crop24,
  "borage-flowers": crop25,
  "lollo-bionda-lettuce": crop26,
  "flat-leaf-parsley": crop27,
  "red-cabbage-microgreens": crop28,
  "green-chillies": crop29,
  ginger: crop30,
  "iceberg-lettuce": crop31,
  "curly-parsley": crop32,
  "kale-microgreens": crop33,
  "jalapeno-peppers": crop34,
  turmeric: crop35,
  arugula: crop36,
  dill: crop37,
  "arugula-microgreens": crop38,
  strawberries: crop39,
  potato: crop40,
  chives: crop41,
  "beet-microgreens": crop42,
  eggplant: crop43,
  "baby-kale": crop44,
  "garlic-chives": crop45,
  "amaranth-microgreens": crop46,
  zucchini: crop47,
  oregano: crop48,
  "basil-microgreens": crop49,
  muskmelon: crop50,
  "lacinato-kale": crop51,
  thyme: crop52,
  "coriander-microgreens": crop53,
  "green-beans": crop54,
  "swiss-chard": crop55,
  rosemary: crop56,
  "fenugreek-microgreens": crop57,
  "bok-choy": crop58,
  sage: crop59,
  wheatgrass: crop60,
  tatsoi: crop61,
  "lemon-balm": crop62,
  "kohlrabi-microgreens": crop63,
  mizuna: crop64,
  shiso: crop65,
  "garden-cress-microgreens": crop66,
  "mustard-greens": crop67,
  chervil: crop68,
  watercress: crop69,
  tarragon: crop70,
  sorrel: crop71,
  marjoram: crop72,
  endive: crop73,
  lemongrass: crop74,
  radicchio: crop75,
  "amaranth-greens": crop76,
  "fenugreek-greens": crop77,
  "napa-cabbage": crop78,
};
