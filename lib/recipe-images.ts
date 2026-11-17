import { publicImage } from "@/lib/public-images";
import { honeyRecipeImages } from "./honey-eggs-images";
import type { StaticImageData } from "next/image";
const salad = publicImage("flourvi/src/assets/salad-bowl.214c01a4b55403b1.webp", 1200, 800);
const smoothie = publicImage("flourvi/src/assets/recipe-smoothie.70c0aa4f90850e44.webp", 1536, 1024);
const bowl = publicImage("flourvi/src/assets/recipe-roasted-bowl.d78abbcb3a5232ea.webp", 1200, 800);
const pasta = publicImage("flourvi/src/assets/recipe-pasta.7efc38297faa56f4.webp", 1200, 800);
const recipe0 = publicImage("flourvi/src/assets/recipes/rocket-pear-and-walnut-salad.88fa3335562611ef.webp", 960, 960);
const recipe1 = publicImage("flourvi/src/assets/recipes/cucumber-tomato-kachumber.f11feaa81d7889c2.webp", 960, 960);
const recipe2 = publicImage("flourvi/src/assets/recipes/carrot-radish-slaw.bfbaf5b93b5d2224.webp", 960, 960);
const recipe3 = publicImage("flourvi/src/assets/recipes/fennel-orange-salad.858fb8299c7764f2.webp", 960, 960);
const recipe4 = publicImage("flourvi/src/assets/recipes/butterhead-avocado-salad.651dd651d65f249d.webp", 960, 960);
const recipe5 = publicImage("flourvi/src/assets/recipes/napa-cabbage-apple-slaw.3db764005b7c64cb.webp", 960, 960);
const recipe6 = publicImage("flourvi/src/assets/recipes/quinoa-spinach-chickpea-salad.b65b173446b20b61.webp", 960, 960);
const recipe7 = publicImage("flourvi/src/assets/recipes/quinoa-beetroot-orange-salad.0352bc620bef6036.webp", 960, 960);
const recipe8 = publicImage("flourvi/src/assets/recipes/quinoa-cucumber-mint-salad.d4fdc374d1912561.webp", 960, 960);
const recipe9 = publicImage("flourvi/src/assets/recipes/quinoa-tomato-basil-salad.5d2f711c0bf71596.webp", 960, 960);
const recipe10 = publicImage("flourvi/src/assets/recipes/quinoa-pea-shoot-salad.7136a85baaf13d14.webp", 960, 960);
const recipe11 = publicImage("flourvi/src/assets/recipes/quinoa-radish-parsley-salad.877bebe00fa2cb18.webp", 960, 960);
const recipe12 = publicImage("flourvi/src/assets/recipes/carrot-ginger-soup.c7c7328585ca25cb.webp", 960, 960);
const recipe13 = publicImage("flourvi/src/assets/recipes/tomato-basil-soup.e0f5f2bbbd5ce02c.webp", 960, 960);
const recipe14 = publicImage("flourvi/src/assets/recipes/cauliflower-parsley-soup.470777db4caf92c5.webp", 960, 960);
const recipe15 = publicImage("flourvi/src/assets/recipes/spinach-potato-soup.4736f7a13116dd6e.webp", 960, 960);
const recipe16 = publicImage("flourvi/src/assets/recipes/zucchini-mint-soup.0d2619391e7291fd.webp", 960, 960);
const recipe17 = publicImage("flourvi/src/assets/recipes/beetroot-dill-soup.3ca63938093f5553.webp", 960, 960);
const recipe18 = publicImage("flourvi/src/assets/recipes/bok-choy-noodle-broth.88b507fa0caad747.webp", 960, 960);
const recipe19 = publicImage("flourvi/src/assets/recipes/napa-cabbage-ginger-broth.c13acb9d2b8ea596.webp", 960, 960);
const recipe20 = publicImage("flourvi/src/assets/recipes/carrot-celery-noodle-soup.e498c52c619fa212.webp", 960, 960);
const recipe21 = publicImage("flourvi/src/assets/recipes/spinach-spring-onion-broth.c4e556008e90d736.webp", 960, 960);
const recipe22 = publicImage("flourvi/src/assets/recipes/zucchini-coriander-noodle-soup.3ee70c97cdd16dc4.webp", 960, 960);
const recipe23 = publicImage("flourvi/src/assets/recipes/mushroom-chive-noodle-broth.edea475f2ac9a982.webp", 960, 960);
const recipe24 = publicImage("flourvi/src/assets/recipes/cucumber-mint-raita.58388ed4654860af.webp", 960, 960);
const recipe25 = publicImage("flourvi/src/assets/recipes/carrot-coriander-raita.e3304ad71c95d04f.webp", 960, 960);
const recipe26 = publicImage("flourvi/src/assets/recipes/beetroot-dill-raita.3b7c6f768217099e.webp", 960, 960);
const recipe27 = publicImage("flourvi/src/assets/recipes/radish-chive-raita.4a16d11e6b8d10f4.webp", 960, 960);
const recipe28 = publicImage("flourvi/src/assets/recipes/tomato-basil-yoghurt.bfd4307005c389b3.webp", 960, 960);
const recipe29 = publicImage("flourvi/src/assets/recipes/cucumber-microgreen-yoghurt.1b528da0350e2f59.webp", 960, 960);
const recipe30 = publicImage("flourvi/src/assets/recipes/avocado-radish-toast.3a1412bb8c4af361.webp", 960, 960);
const recipe31 = publicImage("flourvi/src/assets/recipes/hummus-cucumber-toast.a2939b7ab8c01c06.webp", 960, 960);
const recipe32 = publicImage("flourvi/src/assets/recipes/ricotta-tomato-basil-toast.b41002daf8456a73.webp", 960, 960);
const recipe33 = publicImage("flourvi/src/assets/recipes/pea-shoot-cream-cheese-toast.27ddc447f4d8987b.webp", 960, 960);
const recipe34 = publicImage("flourvi/src/assets/recipes/beetroot-hummus-toast.eb8be0506713a176.webp", 960, 960);
const recipe35 = publicImage("flourvi/src/assets/recipes/avocado-sunflower-shoot-toast.a2fd4efad89457f0.webp", 960, 960);
const recipe36 = publicImage("flourvi/src/assets/recipes/chickpea-lettuce-wraps.2087356c79c5c3b3.webp", 960, 960);
const recipe37 = publicImage("flourvi/src/assets/recipes/chickpea-carrot-mint-wraps.178180e03ae74253.webp", 960, 960);
const recipe38 = publicImage("flourvi/src/assets/recipes/chickpea-tomato-rocket-wraps.a928a88f3b7105b9.webp", 960, 960);
const recipe39 = publicImage("flourvi/src/assets/recipes/chickpea-beetroot-dill-wraps.d75cd5e9100cafb4.webp", 960, 960);
const recipe40 = publicImage("flourvi/src/assets/recipes/chickpea-radish-microgreen-wraps.9cd3a07d2d444894.webp", 960, 960);
const recipe41 = publicImage("flourvi/src/assets/recipes/chickpea-cabbage-coriander-wraps.91e322c8ef2ee230.webp", 960, 960);
const recipe42 = publicImage("flourvi/src/assets/recipes/spinach-garlic-spaghetti.42db97287b6530de.webp", 960, 960);
const recipe43 = publicImage("flourvi/src/assets/recipes/tomato-oregano-penne.55051cc0aab47590.webp", 960, 960);
const recipe44 = publicImage("flourvi/src/assets/recipes/zucchini-lemon-pasta.ca5eae61107c2d58.webp", 960, 960);
const recipe45 = publicImage("flourvi/src/assets/recipes/kale-chilli-pasta.b6d413cb6164aa24.webp", 960, 960);
const recipe46 = publicImage("flourvi/src/assets/recipes/mushroom-parsley-pasta.6b268e4281b3bb60.webp", 960, 960);
const recipe47 = publicImage("flourvi/src/assets/recipes/pea-mint-pasta.5a6f3603e4bb120a.webp", 960, 960);
const recipe48 = publicImage("flourvi/src/assets/recipes/sesame-bok-choy.47030531dee4f5d8.webp", 960, 960);
const recipe49 = publicImage("flourvi/src/assets/recipes/garlic-green-beans.878e2901adc5669e.webp", 960, 960);
const recipe50 = publicImage("flourvi/src/assets/recipes/ginger-napa-cabbage.3362f7477e41223b.webp", 960, 960);
const recipe51 = publicImage("flourvi/src/assets/recipes/sesame-zucchini-ribbons.7d3d38156d9d1abf.webp", 960, 960);
const recipe52 = publicImage("flourvi/src/assets/recipes/garlic-mustard-greens.a35862c643eebd3a.webp", 960, 960);
const recipe53 = publicImage("flourvi/src/assets/recipes/ginger-bell-pepper-stir-fry.8bf80a53422af11b.webp", 960, 960);
const recipe54 = publicImage("flourvi/src/assets/recipes/cumin-carrot-chickpea-tray.7ee045c7dfc5345b.webp", 960, 960);
const recipe55 = publicImage("flourvi/src/assets/recipes/rosemary-potato-chickpea-tray.30d27c7d1031e87a.webp", 960, 960);
const recipe56 = publicImage("flourvi/src/assets/recipes/beetroot-thyme-chickpea-tray.b77d398599c808c2.webp", 960, 960);
const recipe57 = publicImage("flourvi/src/assets/recipes/pepper-zucchini-chickpea-tray.dbdc40c8ec220ddc.webp", 960, 960);
const recipe58 = publicImage("flourvi/src/assets/recipes/fennel-tomato-chickpea-tray.1033d9bb43454492.webp", 960, 960);
const recipe59 = publicImage("flourvi/src/assets/recipes/eggplant-oregano-chickpea-tray.c2ab9f3da1a14419.webp", 960, 960);
const recipe60 = publicImage("flourvi/src/assets/recipes/spinach-besan-chilla.e5362e0246646dab.webp", 960, 960);
const recipe61 = publicImage("flourvi/src/assets/recipes/methi-besan-chilla.9bc5edd4309a84d9.webp", 960, 960);
const recipe62 = publicImage("flourvi/src/assets/recipes/carrot-coriander-chilla.7c09dc830f7f286c.webp", 960, 960);
const recipe63 = publicImage("flourvi/src/assets/recipes/spring-onion-chilla.7491607df18eae39.webp", 960, 960);
const recipe64 = publicImage("flourvi/src/assets/recipes/zucchini-mint-chilla.a91a216bf17aa25a.webp", 960, 960);
const recipe65 = publicImage("flourvi/src/assets/recipes/radish-leafy-chilla.b84cf3f35b08b03f.webp", 960, 960);
const recipe66 = publicImage("flourvi/src/assets/recipes/spinach-pea-rice.ba57c8ffcbfc3c5a.webp", 960, 960);
const recipe67 = publicImage("flourvi/src/assets/recipes/carrot-cumin-rice.4dcb6a3cf0d3cf1d.webp", 960, 960);
const recipe68 = publicImage("flourvi/src/assets/recipes/tomato-basil-rice.8e3967a7ea02b34c.webp", 960, 960);
const recipe69 = publicImage("flourvi/src/assets/recipes/fennel-dill-rice.3cf4ef8aedfb6534.webp", 960, 960);
const recipe70 = publicImage("flourvi/src/assets/recipes/green-bean-coriander-rice.31d97f6dee88ad8c.webp", 960, 960);
const recipe71 = publicImage("flourvi/src/assets/recipes/methi-lemon-rice.a6567abdd62321cc.webp", 960, 960);
const recipe72 = publicImage("flourvi/src/assets/recipes/mint-mango-lassi.6877054ab8f3bdd7.webp", 960, 960);
const recipe73 = publicImage("flourvi/src/assets/recipes/strawberry-basil-smoothie.2b133836b05b734e.webp", 960, 960);
const recipe74 = publicImage("flourvi/src/assets/recipes/cucumber-pear-smoothie.3149d1d12acb564b.webp", 960, 960);
const recipe75 = publicImage("flourvi/src/assets/recipes/spinach-pineapple-smoothie.ab9ebdb170b51afa.webp", 960, 960);
const recipe76 = publicImage("flourvi/src/assets/recipes/carrot-orange-smoothie.641200dad45a1e8c.webp", 960, 960);
const recipe77 = publicImage("flourvi/src/assets/recipes/beetroot-berry-smoothie.efc6080b33dab0d6.webp", 960, 960);
const recipe78 = publicImage("flourvi/src/assets/recipes/spinach-red-lentil-dal.2ef9dfbbcc4f7f9a.webp", 960, 960);
const recipe79 = publicImage("flourvi/src/assets/recipes/carrot-ginger-dal.45e96e2ea253da66.webp", 960, 960);
const recipe80 = publicImage("flourvi/src/assets/recipes/tomato-coriander-dal.23cb2df38f2c3279.webp", 960, 960);
const recipe81 = publicImage("flourvi/src/assets/recipes/zucchini-cumin-dal.adb1e8e0cd450d05.webp", 960, 960);
const recipe82 = publicImage("flourvi/src/assets/recipes/methi-garlic-dal.9d979459d97aeb74.webp", 960, 960);
const recipe83 = publicImage("flourvi/src/assets/recipes/kale-lemon-dal.c9b35d29cfb7c6dc.webp", 960, 960);
const nonVegetarian0 = publicImage("flourvi/src/assets/recipes/non-vegetarian/lemon-garlic-chicken-carrot-beans.e00d897542b541b8.webp", 960, 960);
const nonVegetarian1 = publicImage("flourvi/src/assets/recipes/non-vegetarian/chicken-spinach-tomato-curry.7144bbee0e81e925.webp", 960, 960);
const nonVegetarian2 = publicImage("flourvi/src/assets/recipes/non-vegetarian/chicken-methi-yoghurt-curry.8506fffe6c2d291c.webp", 960, 960);
const nonVegetarian3 = publicImage("flourvi/src/assets/recipes/non-vegetarian/chicken-bell-pepper-stir-fry.d2bdb48bedf443d2.webp", 960, 960);
const nonVegetarian4 = publicImage("flourvi/src/assets/recipes/non-vegetarian/basil-chicken-zucchini-pasta.8474a53963c7206a.webp", 960, 960);
const nonVegetarian5 = publicImage("flourvi/src/assets/recipes/non-vegetarian/rosemary-chicken-potato-tray.c31bd043c31d2559.webp", 960, 960);
const nonVegetarian6 = publicImage("flourvi/src/assets/recipes/non-vegetarian/chicken-cucumber-mint-wraps.2bbacf7968b7020b.webp", 960, 960);
const nonVegetarian7 = publicImage("flourvi/src/assets/recipes/non-vegetarian/chicken-bok-choy-noodle-soup.397e2542b0422340.webp", 960, 960);
const nonVegetarian8 = publicImage("flourvi/src/assets/recipes/non-vegetarian/chicken-carrot-coriander-rice.56f4931128a84877.webp", 960, 960);
const nonVegetarian9 = publicImage("flourvi/src/assets/recipes/non-vegetarian/chicken-rocket-tomato-salad.20b624d0400c8451.webp", 960, 960);
const nonVegetarian10 = publicImage("flourvi/src/assets/recipes/non-vegetarian/chicken-coconut-spinach-curry.107927c9a647d976.webp", 960, 960);
const nonVegetarian11 = publicImage("flourvi/src/assets/recipes/non-vegetarian/chicken-pepper-potato-skillet.35c431284aae6613.webp", 960, 960);
const nonVegetarian12 = publicImage("flourvi/src/assets/recipes/non-vegetarian/chicken-lettuce-radish-cups.b6c6c17f3ab781d9.webp", 960, 960);
const nonVegetarian13 = publicImage("flourvi/src/assets/recipes/non-vegetarian/chicken-celery-herb-soup.d250f84a6ac19e3d.webp", 960, 960);
const nonVegetarian14 = publicImage("flourvi/src/assets/recipes/non-vegetarian/chicken-tomato-basil-rice.21e0168ea6f210f9.webp", 960, 960);
const nonVegetarian15 = publicImage("flourvi/src/assets/recipes/non-vegetarian/chicken-ginger-napa-noodles.48e2222d212a3286.webp", 960, 960);
const nonVegetarian16 = publicImage("flourvi/src/assets/recipes/non-vegetarian/chicken-mustard-greens-curry.243d66c7cff0bd9b.webp", 960, 960);
const nonVegetarian17 = publicImage("flourvi/src/assets/recipes/non-vegetarian/chicken-beetroot-yoghurt-salad.e285065898f8f9de.webp", 960, 960);
const nonVegetarian18 = publicImage("flourvi/src/assets/recipes/non-vegetarian/chicken-eggplant-tomato-bake.5cda2fc554930360.webp", 960, 960);
const nonVegetarian19 = publicImage("flourvi/src/assets/recipes/non-vegetarian/chicken-lemongrass-coconut-soup.035a78a16d86e871.webp", 960, 960);
const nonVegetarian20 = publicImage("flourvi/src/assets/recipes/non-vegetarian/chicken-chilli-green-bean-toss.de4a3bf2a0527a85.webp", 960, 960);
const nonVegetarian21 = publicImage("flourvi/src/assets/recipes/non-vegetarian/chicken-spinach-lemon-pasta.3f56e9965c6e4a7a.webp", 960, 960);
const nonVegetarian22 = publicImage("flourvi/src/assets/recipes/non-vegetarian/chicken-mint-potato-rice.0a111435eaa341b6.webp", 960, 960);
const nonVegetarian23 = publicImage("flourvi/src/assets/recipes/non-vegetarian/chicken-kale-white-bean-stew.bb551d9801a3ac97.webp", 960, 960);
const nonVegetarian24 = publicImage("flourvi/src/assets/recipes/non-vegetarian/chicken-coriander-tomato-skewers.b8c0fbc7059702b0.webp", 960, 960);
const nonVegetarian25 = publicImage("flourvi/src/assets/recipes/non-vegetarian/dill-fish-potato-tray.34e37ae605e25c3f.webp", 960, 960);
const nonVegetarian26 = publicImage("flourvi/src/assets/recipes/non-vegetarian/fish-tomato-coconut-curry.6f9bc4452adf5049.webp", 960, 960);
const nonVegetarian27 = publicImage("flourvi/src/assets/recipes/non-vegetarian/fish-spinach-garlic-skillet.7605fdbfe43f156f.webp", 960, 960);
const nonVegetarian28 = publicImage("flourvi/src/assets/recipes/non-vegetarian/fish-cucumber-mint-wraps.08f7c945a880445f.webp", 960, 960);
const nonVegetarian29 = publicImage("flourvi/src/assets/recipes/non-vegetarian/fish-bok-choy-ginger-broth.ac3f1441459b913d.webp", 960, 960);
const nonVegetarian30 = publicImage("flourvi/src/assets/recipes/non-vegetarian/fish-bell-pepper-tomato-rice.2d26922a04378b14.webp", 960, 960);
const nonVegetarian31 = publicImage("flourvi/src/assets/recipes/non-vegetarian/fish-rocket-radish-salad.4dd33a9c635224a2.webp", 960, 960);
const nonVegetarian32 = publicImage("flourvi/src/assets/recipes/non-vegetarian/fish-basil-tomato-pasta.ba93317b890c419a.webp", 960, 960);
const nonVegetarian33 = publicImage("flourvi/src/assets/recipes/non-vegetarian/fish-turmeric-potato-curry.d2313a1c081798d1.webp", 960, 960);
const nonVegetarian34 = publicImage("flourvi/src/assets/recipes/non-vegetarian/fish-lemongrass-coconut-soup.254118f73938a191.webp", 960, 960);
const nonVegetarian35 = publicImage("flourvi/src/assets/recipes/non-vegetarian/fish-rosemary-zucchini-bake.a29f185cf884bc77.webp", 960, 960);
const nonVegetarian36 = publicImage("flourvi/src/assets/recipes/non-vegetarian/fish-napa-spring-onion-noodles.8232164dc24f3104.webp", 960, 960);
const nonVegetarian37 = publicImage("flourvi/src/assets/recipes/non-vegetarian/fish-green-bean-pepper-skillet.24664f54be26de8b.webp", 960, 960);
const nonVegetarian38 = publicImage("flourvi/src/assets/recipes/non-vegetarian/fish-methi-tomato-curry.c56b5f13f09157f0.webp", 960, 960);
const nonVegetarian39 = publicImage("flourvi/src/assets/recipes/non-vegetarian/fish-lettuce-carrot-cups.491c89746ca16727.webp", 960, 960);
const nonVegetarian40 = publicImage("flourvi/src/assets/recipes/non-vegetarian/fish-celery-tomato-stew.deb2e1d4db43139e.webp", 960, 960);
const nonVegetarian41 = publicImage("flourvi/src/assets/recipes/non-vegetarian/fish-beetroot-dill-salad.716d229f785aa9c9.webp", 960, 960);
const nonVegetarian42 = publicImage("flourvi/src/assets/recipes/non-vegetarian/fish-coriander-pepper-skewers.ca4b67f5f17221ff.webp", 960, 960);
const nonVegetarian43 = publicImage("flourvi/src/assets/recipes/non-vegetarian/fish-spinach-coconut-rice.19293e433eb97878.webp", 960, 960);
const nonVegetarian44 = publicImage("flourvi/src/assets/recipes/non-vegetarian/fish-eggplant-basil-bake.9fc067252a6e63e4.webp", 960, 960);
const nonVegetarian45 = publicImage("flourvi/src/assets/recipes/non-vegetarian/prawn-garlic-green-bean-skillet.9c60b715f12bdb67.webp", 960, 960);
const nonVegetarian46 = publicImage("flourvi/src/assets/recipes/non-vegetarian/prawn-coconut-tomato-curry.b0f33ae39776e36a.webp", 960, 960);
const nonVegetarian47 = publicImage("flourvi/src/assets/recipes/non-vegetarian/prawn-bok-choy-stir-fry.deaee0a92e3b76e4.webp", 960, 960);
const nonVegetarian48 = publicImage("flourvi/src/assets/recipes/non-vegetarian/prawn-basil-zucchini-pasta.0aea66069ed0eebd.webp", 960, 960);
const nonVegetarian49 = publicImage("flourvi/src/assets/recipes/non-vegetarian/prawn-cucumber-mint-salad.f046f0ff37672f28.webp", 960, 960);
const nonVegetarian50 = publicImage("flourvi/src/assets/recipes/non-vegetarian/prawn-pepper-spring-onion-rice.ca001b03452b6dea.webp", 960, 960);
const nonVegetarian51 = publicImage("flourvi/src/assets/recipes/non-vegetarian/prawn-lemongrass-noodle-soup.89b76560d44f0d10.webp", 960, 960);
const nonVegetarian52 = publicImage("flourvi/src/assets/recipes/non-vegetarian/prawn-lettuce-radish-wraps.0876632a9ca1302a.webp", 960, 960);
const nonVegetarian53 = publicImage("flourvi/src/assets/recipes/non-vegetarian/prawn-spinach-tomato-skillet.c29cfd4223888199.webp", 960, 960);
const nonVegetarian54 = publicImage("flourvi/src/assets/recipes/non-vegetarian/prawn-ginger-napa-noodles.4f4de96ccb50b30c.webp", 960, 960);
const nonVegetarian55 = publicImage("flourvi/src/assets/recipes/non-vegetarian/prawn-turmeric-potato-curry.7ce16506245c6ac7.webp", 960, 960);
const nonVegetarian56 = publicImage("flourvi/src/assets/recipes/non-vegetarian/prawn-rosemary-carrot-tray.28d47128922402c4.webp", 960, 960);
const nonVegetarian57 = publicImage("flourvi/src/assets/recipes/non-vegetarian/prawn-rocket-tomato-salad.0a92f100a06ff05f.webp", 960, 960);
const nonVegetarian58 = publicImage("flourvi/src/assets/recipes/non-vegetarian/prawn-chilli-pepper-skewers.a03128c4f40beeb3.webp", 960, 960);
const nonVegetarian59 = publicImage("flourvi/src/assets/recipes/non-vegetarian/prawn-celery-tomato-stew.c8e57d4ad24a2d12.webp", 960, 960);
const nonVegetarian60 = publicImage("flourvi/src/assets/recipes/non-vegetarian/prawn-methi-coconut-curry.3eab78769f25c0d0.webp", 960, 960);
const nonVegetarian61 = publicImage("flourvi/src/assets/recipes/non-vegetarian/mutton-spinach-tomato-curry.92c346e1353839ab.webp", 960, 960);
const nonVegetarian62 = publicImage("flourvi/src/assets/recipes/non-vegetarian/mutton-potato-pepper-stew.2ec5de944d7c9b1f.webp", 960, 960);
const nonVegetarian63 = publicImage("flourvi/src/assets/recipes/non-vegetarian/mutton-methi-yoghurt-curry.30506321d9c3879d.webp", 960, 960);
const nonVegetarian64 = publicImage("flourvi/src/assets/recipes/non-vegetarian/mutton-carrot-celery-soup.4307861a5e68b6cd.webp", 960, 960);
const nonVegetarian65 = publicImage("flourvi/src/assets/recipes/non-vegetarian/mutton-mint-tomato-rice.1d77a0468d4284e9.webp", 960, 960);
const nonVegetarian66 = publicImage("flourvi/src/assets/recipes/non-vegetarian/mutton-keema-spinach-skillet.f0ee027ccc6a3c33.webp", 960, 960);
const nonVegetarian67 = publicImage("flourvi/src/assets/recipes/non-vegetarian/mutton-keema-lettuce-wraps.d7eeefe8b63f3c7b.webp", 960, 960);
const nonVegetarian68 = publicImage("flourvi/src/assets/recipes/non-vegetarian/mutton-keema-pepper-pasta.894ebd471a9e7ba8.webp", 960, 960);
const nonVegetarian69 = publicImage("flourvi/src/assets/recipes/non-vegetarian/mutton-keema-potato-bowl.bc444c4c712b0a45.webp", 960, 960);
const nonVegetarian70 = publicImage("flourvi/src/assets/recipes/non-vegetarian/mutton-coconut-eggplant-curry.ae6f6fc6365e7287.webp", 960, 960);
const nonVegetarian71 = publicImage("flourvi/src/assets/recipes/non-vegetarian/mutton-mustard-greens-stew.33faf955586e4381.webp", 960, 960);
const nonVegetarian72 = publicImage("flourvi/src/assets/recipes/non-vegetarian/mutton-rosemary-root-stew.1e6d4edb0cf48aa0.webp", 960, 960);
const nonVegetarian73 = publicImage("flourvi/src/assets/recipes/non-vegetarian/mutton-keema-napa-noodles.8af015eb1a1f8dc9.webp", 960, 960);
const nonVegetarian74 = publicImage("flourvi/src/assets/recipes/non-vegetarian/mutton-tomato-green-bean-curry.37940a236e66b107.webp", 960, 960);
const nonVegetarian75 = publicImage("flourvi/src/assets/recipes/non-vegetarian/mutton-keema-coriander-rice.f5fe76c620651dbd.webp", 960, 960);
const nonVegetarian76 = publicImage("flourvi/src/assets/recipes/non-vegetarian/spinach-tomato-egg-scramble.67dc1789454f0a75.webp", 960, 960);
const nonVegetarian77 = publicImage("flourvi/src/assets/recipes/non-vegetarian/methi-spring-onion-omelette.5d5fc1d8b8581e4f.webp", 960, 960);
const nonVegetarian78 = publicImage("flourvi/src/assets/recipes/non-vegetarian/egg-tomato-coconut-curry.b254bb51c599e9d9.webp", 960, 960);
const nonVegetarian79 = publicImage("flourvi/src/assets/recipes/non-vegetarian/egg-bell-pepper-rice.bf6afc496ae866aa.webp", 960, 960);
const nonVegetarian80 = publicImage("flourvi/src/assets/recipes/non-vegetarian/egg-cucumber-dill-salad.3070150d1e3d56d0.webp", 960, 960);
const nonVegetarian81 = publicImage("flourvi/src/assets/recipes/non-vegetarian/egg-spinach-breakfast-wraps.b7ea80207f03a151.webp", 960, 960);
const nonVegetarian82 = publicImage("flourvi/src/assets/recipes/non-vegetarian/zucchini-basil-frittata.cc2ce2bb95a921a2.webp", 960, 960);
const nonVegetarian83 = publicImage("flourvi/src/assets/recipes/non-vegetarian/egg-bok-choy-noodle-broth.5345b948e969e0e6.webp", 960, 960);
const nonVegetarian84 = publicImage("flourvi/src/assets/recipes/non-vegetarian/egg-potato-coriander-curry.0729a4a3c0ec183a.webp", 960, 960);
const nonVegetarian85 = publicImage("flourvi/src/assets/recipes/non-vegetarian/egg-rocket-radish-toast.7d73d1741f055507.webp", 960, 960);
const nonVegetarian86 = publicImage("flourvi/src/assets/recipes/non-vegetarian/egg-napa-carrot-noodles.c9a298c2d60606bc.webp", 960, 960);
const nonVegetarian87 = publicImage("flourvi/src/assets/recipes/non-vegetarian/egg-green-bean-tomato-skillet.5e7195f742cd8139.webp", 960, 960);
const nonVegetarian88 = publicImage("flourvi/src/assets/recipes/non-vegetarian/egg-beetroot-mint-salad.1fe08e445a202922.webp", 960, 960);
const pantryRecipe0 = publicImage("flourvi/src/assets/recipes/pantry/banana-flour-yoghurt-pancakes.5699f70107e29dd3.webp", 1254, 1254);
const pantryRecipe1 = publicImage("flourvi/src/assets/recipes/pantry/banana-flour-cumin-flatbreads.cfd08d4e7092833e.webp", 1254, 1254);
const pantryRecipe2 = publicImage("flourvi/src/assets/recipes/pantry/banana-flour-savoury-waffles.fdefc45331f679d5.webp", 1254, 1254);
const pantryRecipe3 = publicImage("flourvi/src/assets/recipes/pantry/banana-flour-cardamom-muffins.690836a716cde00c.webp", 1254, 1254);
const pantryRecipe4 = publicImage("flourvi/src/assets/recipes/pantry/moringa-besan-chilla.1ec064be14d15e05.webp", 1254, 1254);
const pantryRecipe5 = publicImage("flourvi/src/assets/recipes/pantry/moringa-lemon-lentil-soup.163173b2e611d298.webp", 1254, 1254);
const pantryRecipe6 = publicImage("flourvi/src/assets/recipes/pantry/moringa-pea-pulao.2699c74557b59322.webp", 1254, 1254);
const pantryRecipe7 = publicImage("flourvi/src/assets/recipes/pantry/moringa-sesame-roti.40afa0ef91d13e83.webp", 1254, 1254);
const pantryRecipe8 = publicImage("flourvi/src/assets/recipes/pantry/beetroot-powder-hummus.fb0565753bc832bc.webp", 1254, 1254);
const pantryRecipe9 = publicImage("flourvi/src/assets/recipes/pantry/beetroot-cumin-paratha.260d948313d07065.webp", 1254, 1254);
const pantryRecipe10 = publicImage("flourvi/src/assets/recipes/pantry/beetroot-coconut-rice.9e9ee21be9caa127.webp", 1254, 1254);
const pantryRecipe11 = publicImage("flourvi/src/assets/recipes/pantry/beetroot-cocoa-pancakes.b108b655cad851b7.webp", 1254, 1254);
const pantryRecipe12 = publicImage("flourvi/src/assets/recipes/pantry/turmeric-lemon-chickpeas.bb5d68862fe550dc.webp", 1254, 1254);
const pantryRecipe13 = publicImage("flourvi/src/assets/recipes/pantry/turmeric-coconut-dal.b3d50297d1b96989.webp", 1254, 1254);
const pantryRecipe14 = publicImage("flourvi/src/assets/recipes/pantry/turmeric-cauliflower-tray-bake.13247ef17bb3cce5.webp", 1254, 1254);
const pantryRecipe15 = publicImage("flourvi/src/assets/recipes/pantry/turmeric-pea-upma.aae75e3256895d8e.webp", 1254, 1254);
const pantryRecipe16 = publicImage("flourvi/src/assets/recipes/pantry/onion-powder-potato-wedges.13a2a11f4ee0aabf.webp", 1254, 1254);
const pantryRecipe17 = publicImage("flourvi/src/assets/recipes/pantry/onion-powder-lentil-patties.110ec490dd2c00b4.webp", 1254, 1254);
const pantryRecipe18 = publicImage("flourvi/src/assets/recipes/pantry/onion-powder-creamy-polenta.3f1ed02c718fdb32.webp", 1254, 1254);
const pantryRecipe19 = publicImage("flourvi/src/assets/recipes/pantry/onion-powder-butter-beans.7e2836141a9840cb.webp", 1254, 1254);
const pantryRecipe20 = publicImage("flourvi/src/assets/recipes/pantry/onion-flake-rice-pilaf.42e2be4c05adf288.webp", 1254, 1254);
const pantryRecipe21 = publicImage("flourvi/src/assets/recipes/pantry/onion-flake-roast-potatoes.b97bfda366392b35.webp", 1254, 1254);
const pantryRecipe22 = publicImage("flourvi/src/assets/recipes/pantry/onion-flake-tomato-dal.f14a4490830820e0.webp", 1254, 1254);
const pantryRecipe23 = publicImage("flourvi/src/assets/recipes/pantry/spinach-powder-green-pasta.2570c2e007ef22a0.webp", 1254, 1254);
const pantryRecipe24 = publicImage("flourvi/src/assets/recipes/pantry/spinach-powder-paneer-paratha.a8b2617321af9ea5.webp", 1254, 1254);
const pantryRecipe25 = publicImage("flourvi/src/assets/recipes/pantry/spinach-powder-potato-soup.b23c57ea041ac192.webp", 1254, 1254);
const pantryRecipe26 = publicImage("flourvi/src/assets/recipes/pantry/spinach-powder-savoury-crepes.7f87689927d56993.webp", 1254, 1254);
const pantryRecipe27 = publicImage("flourvi/src/assets/recipes/pantry/carrot-powder-cumin-rice.5990bef7575d779d.webp", 1254, 1254);
const pantryRecipe28 = publicImage("flourvi/src/assets/recipes/pantry/carrot-powder-ginger-soup.c3d9ab5f78e666fb.webp", 1254, 1254);
const pantryRecipe29 = publicImage("flourvi/src/assets/recipes/pantry/carrot-powder-oat-pancakes.fc068d1f5adcd643.webp", 1254, 1254);
const pantryRecipe30 = publicImage("flourvi/src/assets/recipes/pantry/tomato-powder-pasta-sauce.17c600e55e4e7a2c.webp", 1254, 1254);
const pantryRecipe31 = publicImage("flourvi/src/assets/recipes/pantry/tomato-powder-chickpea-stew.e65ee0e9f0390eb8.webp", 1254, 1254);
const pantryRecipe32 = publicImage("flourvi/src/assets/recipes/pantry/tomato-powder-spiced-rice.bc676a5995b1bf52.webp", 1254, 1254);
const pantryRecipe33 = publicImage("flourvi/src/assets/recipes/pantry/tomato-powder-lentil-soup.f4ffb4f194ad3189.webp", 1254, 1254);
const pantryRecipe34 = publicImage("flourvi/src/assets/recipes/pantry/ginger-powder-pear-porridge.b945446354c3aef5.webp", 1254, 1254);
const pantryRecipe35 = publicImage("flourvi/src/assets/recipes/pantry/ginger-powder-coconut-chickpeas.a5563de33fb6fa95.webp", 1254, 1254);
const pantryRecipe36 = publicImage("flourvi/src/assets/recipes/pantry/ginger-powder-sesame-tofu.7ebb49fce02b363f.webp", 1254, 1254);
const pantryRecipe37 = publicImage("flourvi/src/assets/recipes/pantry/garlic-powder-yoghurt-dip.2499e128e58a0f9b.webp", 1254, 1254);
const pantryRecipe38 = publicImage("flourvi/src/assets/recipes/pantry/garlic-powder-roasted-chickpeas.a54c8734d13b4bb4.webp", 1254, 1254);
const pantryRecipe39 = publicImage("flourvi/src/assets/recipes/pantry/garlic-powder-herb-flatbreads.c1d2ca2c4fd75fb8.webp", 1254, 1254);
export const recipeImages: Record<string, StaticImageData> = {
  ...honeyRecipeImages,
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
  "recipe:banana-flour-yoghurt-pancakes": pantryRecipe0,
  "recipe:banana-flour-cumin-flatbreads": pantryRecipe1,
  "recipe:banana-flour-savoury-waffles": pantryRecipe2,
  "recipe:banana-flour-cardamom-muffins": pantryRecipe3,
  "recipe:moringa-besan-chilla": pantryRecipe4,
  "recipe:moringa-lemon-lentil-soup": pantryRecipe5,
  "recipe:moringa-pea-pulao": pantryRecipe6,
  "recipe:moringa-sesame-roti": pantryRecipe7,
  "recipe:beetroot-powder-hummus": pantryRecipe8,
  "recipe:beetroot-cumin-paratha": pantryRecipe9,
  "recipe:beetroot-coconut-rice": pantryRecipe10,
  "recipe:beetroot-cocoa-pancakes": pantryRecipe11,
  "recipe:turmeric-lemon-chickpeas": pantryRecipe12,
  "recipe:turmeric-coconut-dal": pantryRecipe13,
  "recipe:turmeric-cauliflower-tray-bake": pantryRecipe14,
  "recipe:turmeric-pea-upma": pantryRecipe15,
  "recipe:onion-powder-potato-wedges": pantryRecipe16,
  "recipe:onion-powder-lentil-patties": pantryRecipe17,
  "recipe:onion-powder-creamy-polenta": pantryRecipe18,
  "recipe:onion-powder-butter-beans": pantryRecipe19,
  "recipe:onion-flake-rice-pilaf": pantryRecipe20,
  "recipe:onion-flake-roast-potatoes": pantryRecipe21,
  "recipe:onion-flake-tomato-dal": pantryRecipe22,
  "recipe:spinach-powder-green-pasta": pantryRecipe23,
  "recipe:spinach-powder-paneer-paratha": pantryRecipe24,
  "recipe:spinach-powder-potato-soup": pantryRecipe25,
  "recipe:spinach-powder-savoury-crepes": pantryRecipe26,
  "recipe:carrot-powder-cumin-rice": pantryRecipe27,
  "recipe:carrot-powder-ginger-soup": pantryRecipe28,
  "recipe:carrot-powder-oat-pancakes": pantryRecipe29,
  "recipe:tomato-powder-pasta-sauce": pantryRecipe30,
  "recipe:tomato-powder-chickpea-stew": pantryRecipe31,
  "recipe:tomato-powder-spiced-rice": pantryRecipe32,
  "recipe:tomato-powder-lentil-soup": pantryRecipe33,
  "recipe:ginger-powder-pear-porridge": pantryRecipe34,
  "recipe:ginger-powder-coconut-chickpeas": pantryRecipe35,
  "recipe:ginger-powder-sesame-tofu": pantryRecipe36,
  "recipe:garlic-powder-yoghurt-dip": pantryRecipe37,
  "recipe:garlic-powder-roasted-chickpeas": pantryRecipe38,
  "recipe:garlic-powder-herb-flatbreads": pantryRecipe39,
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
