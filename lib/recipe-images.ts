import type { StaticImageData } from "next/image";
import salad from "@/src/assets/salad-bowl.webp";
import smoothie from "@/src/assets/recipe-smoothie.png";
import bowl from "@/src/assets/recipe-roasted-bowl.webp";
import pasta from "@/src/assets/recipe-pasta.webp";
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
import nonVegetarian0 from "@/src/assets/recipes/non-vegetarian/lemon-garlic-chicken-carrot-beans.webp";
import nonVegetarian1 from "@/src/assets/recipes/non-vegetarian/chicken-spinach-tomato-curry.webp";
import nonVegetarian2 from "@/src/assets/recipes/non-vegetarian/chicken-methi-yoghurt-curry.webp";
import nonVegetarian3 from "@/src/assets/recipes/non-vegetarian/chicken-bell-pepper-stir-fry.webp";
import nonVegetarian4 from "@/src/assets/recipes/non-vegetarian/basil-chicken-zucchini-pasta.webp";
import nonVegetarian5 from "@/src/assets/recipes/non-vegetarian/rosemary-chicken-potato-tray.webp";
import nonVegetarian6 from "@/src/assets/recipes/non-vegetarian/chicken-cucumber-mint-wraps.webp";
import nonVegetarian7 from "@/src/assets/recipes/non-vegetarian/chicken-bok-choy-noodle-soup.webp";
import nonVegetarian8 from "@/src/assets/recipes/non-vegetarian/chicken-carrot-coriander-rice.webp";
import nonVegetarian9 from "@/src/assets/recipes/non-vegetarian/chicken-rocket-tomato-salad.webp";
import nonVegetarian10 from "@/src/assets/recipes/non-vegetarian/chicken-coconut-spinach-curry.webp";
import nonVegetarian11 from "@/src/assets/recipes/non-vegetarian/chicken-pepper-potato-skillet.webp";
import nonVegetarian12 from "@/src/assets/recipes/non-vegetarian/chicken-lettuce-radish-cups.webp";
import nonVegetarian13 from "@/src/assets/recipes/non-vegetarian/chicken-celery-herb-soup.webp";
import nonVegetarian14 from "@/src/assets/recipes/non-vegetarian/chicken-tomato-basil-rice.webp";
import nonVegetarian15 from "@/src/assets/recipes/non-vegetarian/chicken-ginger-napa-noodles.webp";
import nonVegetarian16 from "@/src/assets/recipes/non-vegetarian/chicken-mustard-greens-curry.webp";
import nonVegetarian17 from "@/src/assets/recipes/non-vegetarian/chicken-beetroot-yoghurt-salad.webp";
import nonVegetarian18 from "@/src/assets/recipes/non-vegetarian/chicken-eggplant-tomato-bake.webp";
import nonVegetarian19 from "@/src/assets/recipes/non-vegetarian/chicken-lemongrass-coconut-soup.webp";
import nonVegetarian20 from "@/src/assets/recipes/non-vegetarian/chicken-chilli-green-bean-toss.webp";
import nonVegetarian21 from "@/src/assets/recipes/non-vegetarian/chicken-spinach-lemon-pasta.webp";
import nonVegetarian22 from "@/src/assets/recipes/non-vegetarian/chicken-mint-potato-rice.webp";
import nonVegetarian23 from "@/src/assets/recipes/non-vegetarian/chicken-kale-white-bean-stew.webp";
import nonVegetarian24 from "@/src/assets/recipes/non-vegetarian/chicken-coriander-tomato-skewers.webp";
import nonVegetarian25 from "@/src/assets/recipes/non-vegetarian/dill-fish-potato-tray.webp";
import nonVegetarian26 from "@/src/assets/recipes/non-vegetarian/fish-tomato-coconut-curry.webp";
import nonVegetarian27 from "@/src/assets/recipes/non-vegetarian/fish-spinach-garlic-skillet.webp";
import nonVegetarian28 from "@/src/assets/recipes/non-vegetarian/fish-cucumber-mint-wraps.webp";
import nonVegetarian29 from "@/src/assets/recipes/non-vegetarian/fish-bok-choy-ginger-broth.webp";
import nonVegetarian30 from "@/src/assets/recipes/non-vegetarian/fish-bell-pepper-tomato-rice.webp";
import nonVegetarian31 from "@/src/assets/recipes/non-vegetarian/fish-rocket-radish-salad.webp";
import nonVegetarian32 from "@/src/assets/recipes/non-vegetarian/fish-basil-tomato-pasta.webp";
import nonVegetarian33 from "@/src/assets/recipes/non-vegetarian/fish-turmeric-potato-curry.webp";
import nonVegetarian34 from "@/src/assets/recipes/non-vegetarian/fish-lemongrass-coconut-soup.webp";
import nonVegetarian35 from "@/src/assets/recipes/non-vegetarian/fish-rosemary-zucchini-bake.webp";
import nonVegetarian36 from "@/src/assets/recipes/non-vegetarian/fish-napa-spring-onion-noodles.webp";
import nonVegetarian37 from "@/src/assets/recipes/non-vegetarian/fish-green-bean-pepper-skillet.webp";
import nonVegetarian38 from "@/src/assets/recipes/non-vegetarian/fish-methi-tomato-curry.webp";
import nonVegetarian39 from "@/src/assets/recipes/non-vegetarian/fish-lettuce-carrot-cups.webp";
import nonVegetarian40 from "@/src/assets/recipes/non-vegetarian/fish-celery-tomato-stew.webp";
import nonVegetarian41 from "@/src/assets/recipes/non-vegetarian/fish-beetroot-dill-salad.webp";
import nonVegetarian42 from "@/src/assets/recipes/non-vegetarian/fish-coriander-pepper-skewers.webp";
import nonVegetarian43 from "@/src/assets/recipes/non-vegetarian/fish-spinach-coconut-rice.webp";
import nonVegetarian44 from "@/src/assets/recipes/non-vegetarian/fish-eggplant-basil-bake.webp";
import nonVegetarian45 from "@/src/assets/recipes/non-vegetarian/prawn-garlic-green-bean-skillet.webp";
import nonVegetarian46 from "@/src/assets/recipes/non-vegetarian/prawn-coconut-tomato-curry.webp";
import nonVegetarian47 from "@/src/assets/recipes/non-vegetarian/prawn-bok-choy-stir-fry.webp";
import nonVegetarian48 from "@/src/assets/recipes/non-vegetarian/prawn-basil-zucchini-pasta.webp";
import nonVegetarian49 from "@/src/assets/recipes/non-vegetarian/prawn-cucumber-mint-salad.webp";
import nonVegetarian50 from "@/src/assets/recipes/non-vegetarian/prawn-pepper-spring-onion-rice.webp";
import nonVegetarian51 from "@/src/assets/recipes/non-vegetarian/prawn-lemongrass-noodle-soup.webp";
import nonVegetarian52 from "@/src/assets/recipes/non-vegetarian/prawn-lettuce-radish-wraps.webp";
import nonVegetarian53 from "@/src/assets/recipes/non-vegetarian/prawn-spinach-tomato-skillet.webp";
import nonVegetarian54 from "@/src/assets/recipes/non-vegetarian/prawn-ginger-napa-noodles.webp";
import nonVegetarian55 from "@/src/assets/recipes/non-vegetarian/prawn-turmeric-potato-curry.webp";
import nonVegetarian56 from "@/src/assets/recipes/non-vegetarian/prawn-rosemary-carrot-tray.webp";
import nonVegetarian57 from "@/src/assets/recipes/non-vegetarian/prawn-rocket-tomato-salad.webp";
import nonVegetarian58 from "@/src/assets/recipes/non-vegetarian/prawn-chilli-pepper-skewers.webp";
import nonVegetarian59 from "@/src/assets/recipes/non-vegetarian/prawn-celery-tomato-stew.webp";
import nonVegetarian60 from "@/src/assets/recipes/non-vegetarian/prawn-methi-coconut-curry.webp";
import nonVegetarian61 from "@/src/assets/recipes/non-vegetarian/mutton-spinach-tomato-curry.webp";
import nonVegetarian62 from "@/src/assets/recipes/non-vegetarian/mutton-potato-pepper-stew.webp";
import nonVegetarian63 from "@/src/assets/recipes/non-vegetarian/mutton-methi-yoghurt-curry.webp";
import nonVegetarian64 from "@/src/assets/recipes/non-vegetarian/mutton-carrot-celery-soup.webp";
import nonVegetarian65 from "@/src/assets/recipes/non-vegetarian/mutton-mint-tomato-rice.webp";
import nonVegetarian66 from "@/src/assets/recipes/non-vegetarian/mutton-keema-spinach-skillet.webp";
import nonVegetarian67 from "@/src/assets/recipes/non-vegetarian/mutton-keema-lettuce-wraps.webp";
import nonVegetarian68 from "@/src/assets/recipes/non-vegetarian/mutton-keema-pepper-pasta.webp";
import nonVegetarian69 from "@/src/assets/recipes/non-vegetarian/mutton-keema-potato-bowl.webp";
import nonVegetarian70 from "@/src/assets/recipes/non-vegetarian/mutton-coconut-eggplant-curry.webp";
import nonVegetarian71 from "@/src/assets/recipes/non-vegetarian/mutton-mustard-greens-stew.webp";
import nonVegetarian72 from "@/src/assets/recipes/non-vegetarian/mutton-rosemary-root-stew.webp";
import nonVegetarian73 from "@/src/assets/recipes/non-vegetarian/mutton-keema-napa-noodles.webp";
import nonVegetarian74 from "@/src/assets/recipes/non-vegetarian/mutton-tomato-green-bean-curry.webp";
import nonVegetarian75 from "@/src/assets/recipes/non-vegetarian/mutton-keema-coriander-rice.webp";
import nonVegetarian76 from "@/src/assets/recipes/non-vegetarian/spinach-tomato-egg-scramble.webp";
import nonVegetarian77 from "@/src/assets/recipes/non-vegetarian/methi-spring-onion-omelette.webp";
import nonVegetarian78 from "@/src/assets/recipes/non-vegetarian/egg-tomato-coconut-curry.webp";
import nonVegetarian79 from "@/src/assets/recipes/non-vegetarian/egg-bell-pepper-rice.webp";
import nonVegetarian80 from "@/src/assets/recipes/non-vegetarian/egg-cucumber-dill-salad.webp";
import nonVegetarian81 from "@/src/assets/recipes/non-vegetarian/egg-spinach-breakfast-wraps.webp";
import nonVegetarian82 from "@/src/assets/recipes/non-vegetarian/zucchini-basil-frittata.webp";
import nonVegetarian83 from "@/src/assets/recipes/non-vegetarian/egg-bok-choy-noodle-broth.webp";
import nonVegetarian84 from "@/src/assets/recipes/non-vegetarian/egg-potato-coriander-curry.webp";
import nonVegetarian85 from "@/src/assets/recipes/non-vegetarian/egg-rocket-radish-toast.webp";
import nonVegetarian86 from "@/src/assets/recipes/non-vegetarian/egg-napa-carrot-noodles.webp";
import nonVegetarian87 from "@/src/assets/recipes/non-vegetarian/egg-green-bean-tomato-skillet.webp";
import nonVegetarian88 from "@/src/assets/recipes/non-vegetarian/egg-beetroot-mint-salad.webp";
export const recipeImages: Record<string, StaticImageData> = {
  "recipe:lemon-garlic-chicken-carrot-beans": nonVegetarian0,
  "recipe:chicken-spinach-tomato-curry": nonVegetarian1,
  "recipe:chicken-methi-yoghurt-curry": nonVegetarian2,
  "recipe:chicken-bell-pepper-stir-fry": nonVegetarian3,
  "recipe:basil-chicken-zucchini-pasta": nonVegetarian4,
  "recipe:rosemary-chicken-potato-tray": nonVegetarian5,
  "recipe:chicken-cucumber-mint-wraps": nonVegetarian6,
  "recipe:chicken-bok-choy-noodle-soup": nonVegetarian7,
  "recipe:chicken-carrot-coriander-rice": nonVegetarian8,
  "recipe:chicken-rocket-tomato-salad": nonVegetarian9,
  "recipe:chicken-coconut-spinach-curry": nonVegetarian10,
  "recipe:chicken-pepper-potato-skillet": nonVegetarian11,
  "recipe:chicken-lettuce-radish-cups": nonVegetarian12,
  "recipe:chicken-celery-herb-soup": nonVegetarian13,
  "recipe:chicken-tomato-basil-rice": nonVegetarian14,
  "recipe:chicken-ginger-napa-noodles": nonVegetarian15,
  "recipe:chicken-mustard-greens-curry": nonVegetarian16,
  "recipe:chicken-beetroot-yoghurt-salad": nonVegetarian17,
  "recipe:chicken-eggplant-tomato-bake": nonVegetarian18,
  "recipe:chicken-lemongrass-coconut-soup": nonVegetarian19,
  "recipe:chicken-chilli-green-bean-toss": nonVegetarian20,
  "recipe:chicken-spinach-lemon-pasta": nonVegetarian21,
  "recipe:chicken-mint-potato-rice": nonVegetarian22,
  "recipe:chicken-kale-white-bean-stew": nonVegetarian23,
  "recipe:chicken-coriander-tomato-skewers": nonVegetarian24,
  "recipe:dill-fish-potato-tray": nonVegetarian25,
  "recipe:fish-tomato-coconut-curry": nonVegetarian26,
  "recipe:fish-spinach-garlic-skillet": nonVegetarian27,
  "recipe:fish-cucumber-mint-wraps": nonVegetarian28,
  "recipe:fish-bok-choy-ginger-broth": nonVegetarian29,
  "recipe:fish-bell-pepper-tomato-rice": nonVegetarian30,
  "recipe:fish-rocket-radish-salad": nonVegetarian31,
  "recipe:fish-basil-tomato-pasta": nonVegetarian32,
  "recipe:fish-turmeric-potato-curry": nonVegetarian33,
  "recipe:fish-lemongrass-coconut-soup": nonVegetarian34,
  "recipe:fish-rosemary-zucchini-bake": nonVegetarian35,
  "recipe:fish-napa-spring-onion-noodles": nonVegetarian36,
  "recipe:fish-green-bean-pepper-skillet": nonVegetarian37,
  "recipe:fish-methi-tomato-curry": nonVegetarian38,
  "recipe:fish-lettuce-carrot-cups": nonVegetarian39,
  "recipe:fish-celery-tomato-stew": nonVegetarian40,
  "recipe:fish-beetroot-dill-salad": nonVegetarian41,
  "recipe:fish-coriander-pepper-skewers": nonVegetarian42,
  "recipe:fish-spinach-coconut-rice": nonVegetarian43,
  "recipe:fish-eggplant-basil-bake": nonVegetarian44,
  "recipe:prawn-garlic-green-bean-skillet": nonVegetarian45,
  "recipe:prawn-coconut-tomato-curry": nonVegetarian46,
  "recipe:prawn-bok-choy-stir-fry": nonVegetarian47,
  "recipe:prawn-basil-zucchini-pasta": nonVegetarian48,
  "recipe:prawn-cucumber-mint-salad": nonVegetarian49,
  "recipe:prawn-pepper-spring-onion-rice": nonVegetarian50,
  "recipe:prawn-lemongrass-noodle-soup": nonVegetarian51,
  "recipe:prawn-lettuce-radish-wraps": nonVegetarian52,
  "recipe:prawn-spinach-tomato-skillet": nonVegetarian53,
  "recipe:prawn-ginger-napa-noodles": nonVegetarian54,
  "recipe:prawn-turmeric-potato-curry": nonVegetarian55,
  "recipe:prawn-rosemary-carrot-tray": nonVegetarian56,
  "recipe:prawn-rocket-tomato-salad": nonVegetarian57,
  "recipe:prawn-chilli-pepper-skewers": nonVegetarian58,
  "recipe:prawn-celery-tomato-stew": nonVegetarian59,
  "recipe:prawn-methi-coconut-curry": nonVegetarian60,
  "recipe:mutton-spinach-tomato-curry": nonVegetarian61,
  "recipe:mutton-potato-pepper-stew": nonVegetarian62,
  "recipe:mutton-methi-yoghurt-curry": nonVegetarian63,
  "recipe:mutton-carrot-celery-soup": nonVegetarian64,
  "recipe:mutton-mint-tomato-rice": nonVegetarian65,
  "recipe:mutton-keema-spinach-skillet": nonVegetarian66,
  "recipe:mutton-keema-lettuce-wraps": nonVegetarian67,
  "recipe:mutton-keema-pepper-pasta": nonVegetarian68,
  "recipe:mutton-keema-potato-bowl": nonVegetarian69,
  "recipe:mutton-coconut-eggplant-curry": nonVegetarian70,
  "recipe:mutton-mustard-greens-stew": nonVegetarian71,
  "recipe:mutton-rosemary-root-stew": nonVegetarian72,
  "recipe:mutton-keema-napa-noodles": nonVegetarian73,
  "recipe:mutton-tomato-green-bean-curry": nonVegetarian74,
  "recipe:mutton-keema-coriander-rice": nonVegetarian75,
  "recipe:spinach-tomato-egg-scramble": nonVegetarian76,
  "recipe:methi-spring-onion-omelette": nonVegetarian77,
  "recipe:egg-tomato-coconut-curry": nonVegetarian78,
  "recipe:egg-bell-pepper-rice": nonVegetarian79,
  "recipe:egg-cucumber-dill-salad": nonVegetarian80,
  "recipe:egg-spinach-breakfast-wraps": nonVegetarian81,
  "recipe:zucchini-basil-frittata": nonVegetarian82,
  "recipe:egg-bok-choy-noodle-broth": nonVegetarian83,
  "recipe:egg-potato-coriander-curry": nonVegetarian84,
  "recipe:egg-rocket-radish-toast": nonVegetarian85,
  "recipe:egg-napa-carrot-noodles": nonVegetarian86,
  "recipe:egg-green-bean-tomato-skillet": nonVegetarian87,
  "recipe:egg-beetroot-mint-salad": nonVegetarian88,
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
