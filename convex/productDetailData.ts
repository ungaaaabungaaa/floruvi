import { servingNotes } from "./productServingNotes";
import { cropCatalogue } from "./catalogueData";

const vegetableSource = "https://www.myplate.gov/eat-healthy/vegetables";
const microgreenSource = "https://extension.psu.edu/the-abcs-of-microgreens";
const flowerSource = "https://extension.umn.edu/flowers/edible-flowers";
const prep: Record<string, string> = {
  "butterhead-lettuce":
    "Separate the leaves, rinse and dry. Leave them whole for lettuce cups.",
  "romaine-lettuce":
    "Rinse between the leaves. Chop across the rib, or halve the heart for grilling.",
  "green-oakleaf-lettuce":
    "Rinse gently, dry well and tear into a salad just before dressing.",
  "red-oakleaf-lettuce":
    "Keep the delicate leaves whole. Add dressing just before serving.",
  "lollo-rosso-lettuce":
    "Tear the frilled leaves into small pieces and mix with milder salad leaves.",
  "lollo-bionda-lettuce":
    "Rinse and dry the curly leaves well so dressing does not pool between them.",
  "iceberg-lettuce":
    "Remove the core, rinse the leaves and slice into wedges or shreds.",
  arugula:
    "Rinse and dry. Add to pizza after baking, or toss into a salad at the last moment.",
  spinach:
    "Rinse thoroughly. Use tender leaves raw, or wilt briefly into dal or a warm pan.",
  "baby-kale":
    "Rinse and dry. Toss tender leaves straight into salads or warm grain bowls.",
  "curly-kale":
    "Strip thick stems. Massage chopped leaves for salads, or cook until tender.",
  "lacinato-kale":
    "Remove tough ribs and slice the leaves thinly for soups or braises.",
  "swiss-chard":
    "Separate stems from leaves. Cook the chopped stems first, then add the leaves.",
  "bok-choy":
    "Rinse between the stems. Cook stems first and add the leaves near the end.",
  tatsoi:
    "Separate and rinse the leaves. Add whole to soup or a quick stir-fry.",
  mizuna:
    "Rinse the fine leaves gently and add at the end to keep their texture.",
  "mustard-greens":
    "Remove coarse stems and cook the leaves until tender to soften their bite.",
  watercress:
    "Rinse thoroughly and trim coarse stems. Add to salads or blend into cooked soup.",
  sorrel:
    "Use a few rinsed leaves for a tart finish. Add gradually and taste as you go.",
  endive:
    "Separate the leaves for small salad cups, or halve the head before roasting.",
  radicchio:
    "Remove the core. Slice thinly for salads or cut into wedges for grilling.",
  "amaranth-greens":
    "Rinse well, trim tough stems and cook the leaves into dal or a vegetable dish.",
  "fenugreek-greens":
    "Pick the leaves from thick stems, rinse well and chop for dal or parathas.",
  "napa-cabbage":
    "Rinse between the layers. Slice stems and leaves separately for even cooking.",
  "sweet-basil":
    "Tear the leaves just before serving. Add after cooking to keep their aroma.",
  "thai-basil":
    "Pick the leaves and add near the end of a curry or noodle soup.",
  "holy-basil":
    "Rinse the leaves and use a small amount in a culinary infusion or cooked dish.",
  mint: "Pick and rinse the leaves. Chop just before adding to raita, chutney or drinks.",
  coriander:
    "Rinse leaves and tender stems thoroughly. Chop both for chutneys or a finishing garnish.",
  "flat-leaf-parsley":
    "Rinse, dry and chop the leaves and tender stems finely for salads and sauces.",
  "curly-parsley":
    "Rinse between the curled leaves and dry before chopping for butter or garnish.",
  dill: "Snip the fine fronds just before adding to potatoes, yoghurt or a dressing.",
  chives:
    "Snip into short pieces with clean scissors and scatter over the finished dish.",
  "garlic-chives":
    "Rinse, trim the ends and chop into dumpling fillings or quick stir-fries.",
  oregano:
    "Strip leaves from woody stems. Chop and add to tomato sauces or marinades.",
  thyme:
    "Strip the tiny leaves, or cook with a whole sprig and remove the woody stem before serving.",
  rosemary:
    "Strip and finely chop the needles. Use sparingly; remove whole sprigs before serving.",
  sage: "Pat leaves dry and briefly cook in butter, or finely chop into a stuffing.",
  "lemon-balm":
    "Gently bruise rinsed leaves for an infusion, or chop a few over fruit.",
  shiso:
    "Rinse and dry the leaves. Slice thinly or leave whole as a small food wrap.",
  chervil:
    "Snip the tender leaves and add after cooking to keep their delicate aroma.",
  tarragon:
    "Strip the leaves and chop finely. Start with a small amount in a dressing or sauce.",
  marjoram:
    "Strip the small leaves and add near the end of cooking soups or sauces.",
  lemongrass:
    "Remove tough outer layers. Bruise the stem for broth and remove before serving, or mince the tender base.",
  wheatgrass:
    "Rinse the cut shoots and use a suitable grass juicer. Serve freshly prepared; do not use as a salad leaf.",
  "cherry-tomatoes":
    "Rinse and halve for salads, or roast whole until the skins soften.",
  "beefsteak-tomatoes":
    "Remove the stem core and cut into thick slices for sandwiches or salads.",
  "plum-tomatoes":
    "Remove the stem core, chop and simmer for sauces, or halve before roasting.",
  cucumber:
    "Rinse, trim the ends and slice or dice. Peel only if you prefer a softer texture.",
  "bell-peppers":
    "Remove the stalk, seeds and white ribs. Slice for salads or halve for stuffing.",
  "green-chillies":
    "Trim the stalk and chop carefully. Add gradually; wash hands after handling.",
  "jalapeno-peppers":
    "Remove the stalk and slice. Remove seeds and inner ribs for a milder dish; wash hands after handling.",
  strawberries:
    "Rinse just before eating, then remove the green hulls. Pat dry for desserts.",
  eggplant:
    "Trim the stalk, cut evenly and cook until the flesh is soft throughout.",
  zucchini:
    "Trim the ends and slice evenly. Cook briefly for firmer pieces or longer for a soft texture.",
  muskmelon:
    "Scrub the rind before cutting. Remove seeds, slice the flesh and refrigerate cut pieces.",
  "green-beans":
    "Trim the ends and cook until tender. Cool cooked beans for a salad.",
  "spring-onions":
    "Rinse, trim roots and slice. Cook the white ends first; use greens to finish.",
  celery:
    "Rinse between ribs, trim the base and slice. Use the leaves in stocks or a garnish.",
  radish:
    "Scrub, trim and slice thinly. Roast halves for a softer, milder bite.",
  beetroot:
    "Scrub and cook until tender, then peel if preferred. Wear an apron to avoid stains.",
  carrot: "Scrub or peel, trim and cut into even pieces for roasting or soup.",
  ginger: "Scrub or peel thinly, then grate, mince or slice across the fibres.",
  turmeric:
    "Scrub or peel thinly and grate into cooking. Protect surfaces from its strong colour.",
  potato:
    "Scrub, remove sprouts and green areas, and cook thoroughly. Discard very green or bitter potatoes.",
  "nasturtium-flowers":
    "Use food-grade flowers only. Rinse gently and add a few just before serving.",
  "viola-flowers":
    "Use food-grade blooms. Rinse gently, pat dry and place on the finished dish.",
  "pansy-flowers":
    "Use food-grade blooms. Handle gently and add to salads or cakes just before serving.",
  "calendula-petals":
    "Use food-grade petals, separated from the flower base, to finish rice or salads.",
  "borage-flowers":
    "Use food-grade flowers only as an occasional small garnish, not as an everyday vegetable serving.",
};

type Note = { icon: string; title: string; text: string };
const nutrientNotes: Record<string, { rows: Note[]; source: string }> = {
  spinach: {
    source: "https://ods.od.nih.gov/factsheets/list-VitaminsMinerals/",
    rows: [
      {
        icon: "leaf",
        title: "Vitamin K",
        text: "A naturally occurring nutrient involved in normal blood clotting.",
      },
      {
        icon: "sun",
        title: "Provitamin A",
        text: "Plant carotenoids that the body can convert to vitamin A.",
      },
      {
        icon: "sprout",
        title: "Folate",
        text: "A B vitamin involved in making new cells.",
      },
      {
        icon: "utensils",
        title: "Potassium",
        text: "A mineral used in normal muscle and nerve function.",
      },
    ],
  },
  kale: {
    source: "https://ods.od.nih.gov/factsheets/vitaminK-HealthProfessional/",
    rows: [
      {
        icon: "leaf",
        title: "Vitamin K",
        text: "Kale contains vitamin K, used in normal blood clotting.",
      },
      {
        icon: "utensils",
        title: "Fibre",
        text: "Whole leaves add dietary fibre to the meal.",
      },
      {
        icon: "sprout",
        title: "Serving matters",
        text: "Portion size and cooking affect the nutrients on your plate.",
      },
    ],
  },
  carrot: {
    source: "https://ods.od.nih.gov/factsheets/VitaminA-HealthProfessional/",
    rows: [
      {
        icon: "sun",
        title: "Beta-carotene",
        text: "An orange plant pigment the body can convert to vitamin A.",
      },
      {
        icon: "leaf",
        title: "Fibre",
        text: "Keep the whole carrot in the dish for its dietary fibre.",
      },
      {
        icon: "utensils",
        title: "Raw or cooked",
        text: "Grate into salads or cook until tender.",
      },
    ],
  },
  vitaminC: {
    source: "https://ods.od.nih.gov/factsheets/VitaminC-Consumer/",
    rows: [
      {
        icon: "sun",
        title: "Vitamin C",
        text: "Contributes to vitamin C intake as part of a varied diet.",
      },
      {
        icon: "leaf",
        title: "Whole food",
        text: "Use the edible flesh and skin for texture and fibre.",
      },
      {
        icon: "utensils",
        title: "Preparation matters",
        text: "Long cooking and storage can reduce vitamin C.",
      },
    ],
  },
};
function nutritionFor(slug: string) {
  if (slug === "spinach") return nutrientNotes.spinach;
  if (["baby-kale", "curly-kale", "lacinato-kale"].includes(slug))
    return nutrientNotes.kale;
  if (slug === "carrot") return nutrientNotes.carrot;
  if (
    [
      "cherry-tomatoes",
      "beefsteak-tomatoes",
      "plum-tomatoes",
      "bell-peppers",
      "strawberries",
    ].includes(slug)
  )
    return nutrientNotes.vitaminC;
  return null;
}

export const productDetailCatalogue = cropCatalogue.map((p, index) => {
  const [pairing, serving] = servingNotes(p.slug, p.category);
  const nutrientProfile = nutritionFor(p.slug);
  const tray = p.slug.endsWith("-live-tray");
  const micro = p.category === "microgreens";
  const flowers = p.category === "edible-flowers";
  const herbs = p.category === "herbs";
  const preparation =
    prep[p.slug] ??
    (micro
      ? tray
        ? "Cut shoots above the growing medium with clean scissors. Rinse the harvested shoots before eating; leave roots and medium in the tray."
        : "Rinse gently and drain well. Add a small handful to the finished dish to keep the shoots crisp."
      : "");
  if (!preparation) throw new Error(`Missing preparation: ${p.slug}`);
  return {
    slug: p.slug,
    details: {
      tagline:
        p.uses
          .filter((u) => u !== "Harvest at home")
          .slice(0, 3)
          .map((use) => use.charAt(0).toUpperCase() + use.slice(1))
          .join(". ") + ".",
      benefits: [
        { icon: "leaf", title: "Flavour & texture", text: p.description },
        {
          icon: "utensils",
          title: "An easy addition",
          text: `Try ${p.name.toLowerCase()} in ${p.uses
            .filter((u) => u !== "Harvest at home")
            .slice(0, 3)
            .join(", ")
            .toLowerCase()}.`,
        },
        {
          icon: "chef",
          title: tray ? "Cut when you need it" : "Simple to prepare",
          text: preparation,
        },
        { icon: "salad", title: "Pairs well with", text: pairing },
        { icon: "lightbulb", title: "A serving tip", text: serving },
      ],
      preparation,
      storage: tray
        ? "Keep upright in bright, indirect light. Keep the growing medium lightly moist, not waterlogged. Refrigerate cut shoots and use promptly."
        : p.slug === "potato"
          ? "Keep in a cool, dark, ventilated place, separate from onions."
          : ["sweet-basil", "thai-basil", "holy-basil"].includes(p.slug)
            ? "Stand trimmed stems in a little water, away from direct sun. Keep leaves dry and use promptly."
            : "Keep chilled and protect from crushing. Rinse just before use and use promptly after opening.",
      nutritionTitle: nutrientProfile
        ? "Natural nutrients"
        : flowers
          ? "A little finishing touch"
          : herbs
            ? "Small leaves, plenty of flavour"
            : micro
              ? "About microgreens"
              : "Part of a varied plate",
      nutrition: nutrientProfile
        ? nutrientProfile.rows
        : flowers
          ? [
              {
                icon: "flower",
                title: "A garnish",
                text: "Use a few blooms or petals for colour and texture.",
              },
              {
                icon: "leaf",
                title: "Food-grade only",
                text: "Eat only flowers grown and identified for food use.",
              },
              {
                icon: "utensils",
                title: "Small portions",
                text: "Flowers complement a meal; they do not replace a vegetable serving.",
              },
            ]
          : herbs
            ? [
                {
                  icon: "leaf",
                  title: "Aroma",
                  text: "Fresh leaves add flavour in small amounts.",
                },
                {
                  icon: "utensils",
                  title: "A finishing ingredient",
                  text: "Pair with vegetables, pulses and grains for a complete dish.",
                },
                {
                  icon: "sprout",
                  title: "Portion matters",
                  text: "A few leaves are a garnish, not a full vegetable serving.",
                },
              ]
            : micro
              ? [
                  {
                    icon: "sprout",
                    title: "Young shoots",
                    text: "Harvested at an early stage for their flavour and texture.",
                  },
                  {
                    icon: "leaf",
                    title: "Natural variation",
                    text: "Vitamin and mineral content varies with species and growing conditions.",
                  },
                  {
                    icon: "utensils",
                    title: "Mix it up",
                    text: "Enjoy different shoots alongside other vegetables.",
                  },
                ]
              : [
                  {
                    icon: "leaf",
                    title: "Fibre",
                    text: "Vegetables contribute fibre to a varied diet.",
                  },
                  {
                    icon: "sun",
                    title: "Vitamins & minerals",
                    text: "The mix depends on the vegetable, portion and preparation.",
                  },
                  {
                    icon: "utensils",
                    title: "Variety",
                    text: "Combine different colours with grains and a protein source.",
                  },
                ],
      nutritionSource: nutrientProfile
        ? nutrientProfile.source
        : micro
          ? microgreenSource
          : flowers
            ? flowerSource
            : vegetableSource,
      bannerIndex: index % 6,
    },
  };
});
