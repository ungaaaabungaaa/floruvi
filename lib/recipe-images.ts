import type { StaticImageData } from "next/image";
import salad from "@/src/assets/salad-bowl.png";
import smoothie from "@/src/assets/recipe-smoothie.png";
import bowl from "@/src/assets/recipe-roasted-bowl.png";
import pasta from "@/src/assets/recipe-pasta.png";
import recipe0 from "@/src/assets/recipes/rocket-pear-and-walnut-salad.webp";
import recipe1 from "@/src/assets/recipes/cucumber-tomato-kachumber.webp";
import recipe2 from "@/src/assets/recipes/carrot-radish-slaw.webp";
import recipe3 from "@/src/assets/recipes/fennel-orange-salad.webp";
import recipe4 from "@/src/assets/recipes/butterhead-avocado-salad.webp";
import recipe5 from "@/src/assets/recipes/napa-cabbage-apple-slaw.webp";
import recipe6 from "@/src/assets/recipes/quinoa-spinach-chickpea-salad.webp";
import recipe7 from "@/src/assets/recipes/quinoa-beetroot-orange-salad.webp";
import recipe8 from "@/src/assets/recipes/quinoa-cucumber-mint-salad.webp";
import recipe9 from "@/src/assets/recipes/quinoa-tomato-basil-salad.webp";
import recipe10 from "@/src/assets/recipes/quinoa-pea-shoot-salad.webp";
import recipe11 from "@/src/assets/recipes/quinoa-radish-parsley-salad.webp";
import recipe12 from "@/src/assets/recipes/carrot-ginger-soup.webp";
import recipe13 from "@/src/assets/recipes/tomato-basil-soup.webp";
import recipe14 from "@/src/assets/recipes/cauliflower-parsley-soup.webp";
import recipe15 from "@/src/assets/recipes/spinach-potato-soup.webp";
import recipe16 from "@/src/assets/recipes/zucchini-mint-soup.webp";
import recipe17 from "@/src/assets/recipes/beetroot-dill-soup.webp";
import recipe18 from "@/src/assets/recipes/bok-choy-noodle-broth.webp";
import recipe19 from "@/src/assets/recipes/napa-cabbage-ginger-broth.webp";
import recipe20 from "@/src/assets/recipes/carrot-celery-noodle-soup.webp";
import recipe21 from "@/src/assets/recipes/spinach-spring-onion-broth.webp";
import recipe22 from "@/src/assets/recipes/zucchini-coriander-noodle-soup.webp";
import recipe23 from "@/src/assets/recipes/mushroom-chive-noodle-broth.webp";
import recipe24 from "@/src/assets/recipes/cucumber-mint-raita.webp";
import recipe25 from "@/src/assets/recipes/carrot-coriander-raita.webp";
import recipe26 from "@/src/assets/recipes/beetroot-dill-raita.webp";
import recipe27 from "@/src/assets/recipes/radish-chive-raita.webp";
import recipe28 from "@/src/assets/recipes/tomato-basil-yoghurt.webp";
import recipe29 from "@/src/assets/recipes/cucumber-microgreen-yoghurt.webp";
import recipe30 from "@/src/assets/recipes/avocado-radish-toast.webp";
import recipe31 from "@/src/assets/recipes/hummus-cucumber-toast.webp";
import recipe32 from "@/src/assets/recipes/ricotta-tomato-basil-toast.webp";
import recipe33 from "@/src/assets/recipes/pea-shoot-cream-cheese-toast.webp";
import recipe34 from "@/src/assets/recipes/beetroot-hummus-toast.webp";
import recipe35 from "@/src/assets/recipes/avocado-sunflower-shoot-toast.webp";
import recipe36 from "@/src/assets/recipes/chickpea-lettuce-wraps.webp";
import recipe37 from "@/src/assets/recipes/chickpea-carrot-mint-wraps.webp";
import recipe38 from "@/src/assets/recipes/chickpea-tomato-rocket-wraps.webp";
import recipe39 from "@/src/assets/recipes/chickpea-beetroot-dill-wraps.webp";
import recipe40 from "@/src/assets/recipes/chickpea-radish-microgreen-wraps.webp";
import recipe41 from "@/src/assets/recipes/chickpea-cabbage-coriander-wraps.webp";
import recipe42 from "@/src/assets/recipes/spinach-garlic-spaghetti.webp";
import recipe43 from "@/src/assets/recipes/tomato-oregano-penne.webp";
import recipe44 from "@/src/assets/recipes/zucchini-lemon-pasta.webp";
import recipe45 from "@/src/assets/recipes/kale-chilli-pasta.webp";
import recipe46 from "@/src/assets/recipes/mushroom-parsley-pasta.webp";
import recipe47 from "@/src/assets/recipes/pea-mint-pasta.webp";
import recipe48 from "@/src/assets/recipes/sesame-bok-choy.webp";
import recipe49 from "@/src/assets/recipes/garlic-green-beans.webp";
import recipe50 from "@/src/assets/recipes/ginger-napa-cabbage.webp";
import recipe51 from "@/src/assets/recipes/sesame-zucchini-ribbons.webp";
import recipe52 from "@/src/assets/recipes/garlic-mustard-greens.webp";
import recipe53 from "@/src/assets/recipes/ginger-bell-pepper-stir-fry.webp";
import recipe54 from "@/src/assets/recipes/cumin-carrot-chickpea-tray.webp";
import recipe55 from "@/src/assets/recipes/rosemary-potato-chickpea-tray.webp";
import recipe56 from "@/src/assets/recipes/beetroot-thyme-chickpea-tray.webp";
import recipe57 from "@/src/assets/recipes/pepper-zucchini-chickpea-tray.webp";
import recipe58 from "@/src/assets/recipes/fennel-tomato-chickpea-tray.webp";
import recipe59 from "@/src/assets/recipes/eggplant-oregano-chickpea-tray.webp";
import recipe60 from "@/src/assets/recipes/spinach-besan-chilla.webp";
import recipe61 from "@/src/assets/recipes/methi-besan-chilla.webp";
import recipe62 from "@/src/assets/recipes/carrot-coriander-chilla.webp";
import recipe63 from "@/src/assets/recipes/spring-onion-chilla.webp";
import recipe64 from "@/src/assets/recipes/zucchini-mint-chilla.webp";
import recipe65 from "@/src/assets/recipes/radish-leafy-chilla.webp";
import recipe66 from "@/src/assets/recipes/spinach-pea-rice.webp";
import recipe67 from "@/src/assets/recipes/carrot-cumin-rice.webp";
import recipe68 from "@/src/assets/recipes/tomato-basil-rice.webp";
import recipe69 from "@/src/assets/recipes/fennel-dill-rice.webp";
import recipe70 from "@/src/assets/recipes/green-bean-coriander-rice.webp";
import recipe71 from "@/src/assets/recipes/methi-lemon-rice.webp";
import recipe72 from "@/src/assets/recipes/mint-mango-lassi.webp";
import recipe73 from "@/src/assets/recipes/strawberry-basil-smoothie.webp";
import recipe74 from "@/src/assets/recipes/cucumber-pear-smoothie.webp";
import recipe75 from "@/src/assets/recipes/spinach-pineapple-smoothie.webp";
import recipe76 from "@/src/assets/recipes/carrot-orange-smoothie.webp";
import recipe77 from "@/src/assets/recipes/beetroot-berry-smoothie.webp";
import recipe78 from "@/src/assets/recipes/spinach-red-lentil-dal.webp";
import recipe79 from "@/src/assets/recipes/carrot-ginger-dal.webp";
import recipe80 from "@/src/assets/recipes/tomato-coriander-dal.webp";
import recipe81 from "@/src/assets/recipes/zucchini-cumin-dal.webp";
import recipe82 from "@/src/assets/recipes/methi-garlic-dal.webp";
import recipe83 from "@/src/assets/recipes/kale-lemon-dal.webp";
export const recipeImages: Record<string, StaticImageData> = {
  salad,
  smoothie,
  bowl,
  pasta,
  "recipe:rocket-pear-and-walnut-salad": recipe0,
  "recipe:cucumber-tomato-kachumber": recipe1,
  "recipe:carrot-radish-slaw": recipe2,
  "recipe:fennel-orange-salad": recipe3,
  "recipe:butterhead-avocado-salad": recipe4,
  "recipe:napa-cabbage-apple-slaw": recipe5,
  "recipe:quinoa-spinach-chickpea-salad": recipe6,
  "recipe:quinoa-beetroot-orange-salad": recipe7,
  "recipe:quinoa-cucumber-mint-salad": recipe8,
  "recipe:quinoa-tomato-basil-salad": recipe9,
  "recipe:quinoa-pea-shoot-salad": recipe10,
  "recipe:quinoa-radish-parsley-salad": recipe11,
  "recipe:carrot-ginger-soup": recipe12,
  "recipe:tomato-basil-soup": recipe13,
  "recipe:cauliflower-parsley-soup": recipe14,
  "recipe:spinach-potato-soup": recipe15,
  "recipe:zucchini-mint-soup": recipe16,
  "recipe:beetroot-dill-soup": recipe17,
  "recipe:bok-choy-noodle-broth": recipe18,
  "recipe:napa-cabbage-ginger-broth": recipe19,
  "recipe:carrot-celery-noodle-soup": recipe20,
  "recipe:spinach-spring-onion-broth": recipe21,
  "recipe:zucchini-coriander-noodle-soup": recipe22,
  "recipe:mushroom-chive-noodle-broth": recipe23,
  "recipe:cucumber-mint-raita": recipe24,
  "recipe:carrot-coriander-raita": recipe25,
  "recipe:beetroot-dill-raita": recipe26,
  "recipe:radish-chive-raita": recipe27,
  "recipe:tomato-basil-yoghurt": recipe28,
  "recipe:cucumber-microgreen-yoghurt": recipe29,
  "recipe:avocado-radish-toast": recipe30,
  "recipe:hummus-cucumber-toast": recipe31,
  "recipe:ricotta-tomato-basil-toast": recipe32,
  "recipe:pea-shoot-cream-cheese-toast": recipe33,
  "recipe:beetroot-hummus-toast": recipe34,
  "recipe:avocado-sunflower-shoot-toast": recipe35,
  "recipe:chickpea-lettuce-wraps": recipe36,
  "recipe:chickpea-carrot-mint-wraps": recipe37,
  "recipe:chickpea-tomato-rocket-wraps": recipe38,
  "recipe:chickpea-beetroot-dill-wraps": recipe39,
  "recipe:chickpea-radish-microgreen-wraps": recipe40,
  "recipe:chickpea-cabbage-coriander-wraps": recipe41,
  "recipe:spinach-garlic-spaghetti": recipe42,
  "recipe:tomato-oregano-penne": recipe43,
  "recipe:zucchini-lemon-pasta": recipe44,
  "recipe:kale-chilli-pasta": recipe45,
  "recipe:mushroom-parsley-pasta": recipe46,
  "recipe:pea-mint-pasta": recipe47,
  "recipe:sesame-bok-choy": recipe48,
  "recipe:garlic-green-beans": recipe49,
  "recipe:ginger-napa-cabbage": recipe50,
  "recipe:sesame-zucchini-ribbons": recipe51,
  "recipe:garlic-mustard-greens": recipe52,
  "recipe:ginger-bell-pepper-stir-fry": recipe53,
  "recipe:cumin-carrot-chickpea-tray": recipe54,
  "recipe:rosemary-potato-chickpea-tray": recipe55,
  "recipe:beetroot-thyme-chickpea-tray": recipe56,
  "recipe:pepper-zucchini-chickpea-tray": recipe57,
  "recipe:fennel-tomato-chickpea-tray": recipe58,
  "recipe:eggplant-oregano-chickpea-tray": recipe59,
  "recipe:spinach-besan-chilla": recipe60,
  "recipe:methi-besan-chilla": recipe61,
  "recipe:carrot-coriander-chilla": recipe62,
  "recipe:spring-onion-chilla": recipe63,
  "recipe:zucchini-mint-chilla": recipe64,
  "recipe:radish-leafy-chilla": recipe65,
  "recipe:spinach-pea-rice": recipe66,
  "recipe:carrot-cumin-rice": recipe67,
  "recipe:tomato-basil-rice": recipe68,
  "recipe:fennel-dill-rice": recipe69,
  "recipe:green-bean-coriander-rice": recipe70,
  "recipe:methi-lemon-rice": recipe71,
  "recipe:mint-mango-lassi": recipe72,
  "recipe:strawberry-basil-smoothie": recipe73,
  "recipe:cucumber-pear-smoothie": recipe74,
  "recipe:spinach-pineapple-smoothie": recipe75,
  "recipe:carrot-orange-smoothie": recipe76,
  "recipe:beetroot-berry-smoothie": recipe77,
  "recipe:spinach-red-lentil-dal": recipe78,
  "recipe:carrot-ginger-dal": recipe79,
  "recipe:tomato-coriander-dal": recipe80,
  "recipe:zucchini-cumin-dal": recipe81,
  "recipe:methi-garlic-dal": recipe82,
  "recipe:kale-lemon-dal": recipe83,
};
