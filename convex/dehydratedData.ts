// Owner base prices, 18 October 2026. Confirmed 5% added once to banana flour,
// ginger and turmeric on 20 October. Moringa remains unchanged pending HSN.
export const dehydratedCategory = {
  slug: "flours-and-powders",
  name: "Flours & powders",
  description:
    "Flours, vegetable powders and onion flakes for everyday cooking.",
  color: "#efefe3",
  symbol: "leaf",
  rank: 6,
};

const items = [
  [
    "green-banana-flour",
    "Green banana flour",
    500,
    749,
    "A mild flour for baking and cooking.",
    "Pancakes, breads, soups, sauces",
    "Mix into a recipe with enough liquid. Adjust the flour blend to suit the dish.",
  ],
  [
    "onion-powder",
    "Onion powder",
    250,
    329,
    "Fine onion powder for a savoury base without chopping.",
    "Soups, sauces, marinades, seasoning blends",
    "Stir into sauces or mix with other dry seasonings. Start with a small amount.",
  ],
  [
    "onion-flakes",
    "Onion flakes",
    250,
    329,
    "Dried onion flakes for savoury flavour and a little texture.",
    "Soups, stews, rice dishes, sauces",
    "Add to a dish with cooking liquid, or soak before use when a softer texture is needed.",
  ],
  [
    "garlic-powder",
    "Garlic powder",
    200,
    349,
    "Garlic powder for a warm, savoury flavour.",
    "Marinades, sauces, soups, seasoning blends",
    "Mix into a sauce or marinade. Add gradually and taste as you cook.",
  ],
  [
    "ginger-powder",
    "Ginger powder",
    250,
    429,
    "Dried ginger powder with a warm, sharp flavour.",
    "Curries, baking, marinades, spice blends",
    "Add a small amount to cooking or baking. Adjust to suit the recipe.",
  ],
  [
    "turmeric-powder",
    "Turmeric powder",
    500,
    529,
    "Turmeric powder for golden colour and an earthy flavour.",
    "Curries, rice dishes, soups, marinades",
    "Stir a small amount into a dish during cooking. Avoid contact with surfaces that stain.",
  ],
  [
    "moringa-leaf-powder",
    "Moringa leaf powder",
    250,
    599,
    "Moringa leaf powder with a distinct green, earthy taste.",
    "Soups, sauces, flatbread dough, savoury mixes",
    "Start with a small amount and mix evenly into your recipe.",
  ],
  [
    "tomato-powder",
    "Tomato powder",
    200,
    479,
    "Tomato powder for a savoury tomato flavour in cooking.",
    "Soups, sauces, pasta, seasoning blends",
    "Mix with a little water to make a paste, or stir directly into a dish with cooking liquid.",
  ],
  [
    "beetroot-powder",
    "Beetroot powder",
    250,
    849,
    "Beetroot powder with an earthy taste and deep colour.",
    "Baking, sauces, flatbread dough, savoury mixes",
    "Mix a small amount into your recipe. Protect surfaces and utensils from staining.",
  ],
  [
    "carrot-powder",
    "Carrot powder",
    250,
    559,
    "Carrot powder for a mild vegetable flavour and warm colour.",
    "Soups, sauces, baking, flatbread dough",
    "Stir into cooking liquid or mix evenly with dry ingredients before baking.",
  ],
  [
    "spinach-powder",
    "Spinach powder",
    250,
    629,
    "Spinach powder for a green vegetable flavour in cooking.",
    "Pasta dough, flatbreads, soups, sauces",
    "Mix evenly into dough or stir into soups and sauces during cooking.",
  ],
] as const;

export const dehydratedProducts = items.map(
  ([slug, name, grams, rupees, flavour, uses, preparation], rank) => ({
    slug,
    name,
    category: dehydratedCategory.slug,
    description: flavour,
    uses: uses.split(", "),
    growingNote:
      "A dried pantry product for cooking. Follow the pack instructions.",
    suitability: "established" as const,
    methods: ["Dehydrated"],
    sourceUrl: "https://floruvi.com/products/" + slug,
    sourceNote:
      "Product name, pack size and India price supplied by the owner on 18 October 2026.",
    featured: false,
    status: "enquiry" as const,
    published: true,
    rank: 100 + rank,
    price: {
      amountMinor: Math.round(
        rupees *
          100 *
          (["green-banana-flour", "ginger-powder", "turmeric-powder"].includes(
            slug,
          )
            ? 1.05
            : 1),
      ),
      currency: "INR" as const,
      packLabel: `${grams} g`,
    },
    pricingRevision: "pantry-inclusive-2026-10-20",
    details: {
      tagline: flavour,
      benefits: [
        { icon: "chef", title: "Ways to use", text: uses + "." },
        { icon: "utensils", title: "Preparation", text: preparation },
        {
          icon: "sun",
          title: "Store with care",
          text: "Keep sealed in a cool, dry place away from sunlight. Use a clean, dry spoon.",
        },
      ],
      preparation,
      storage:
        "Keep sealed in a cool, dry place away from sunlight. Use a clean, dry spoon. Follow the best-before date on the pack.",
      nutritionTitle: "Cooking notes",
      nutrition: [
        {
          icon: "chef",
          title: "Add gradually",
          text: "Dried ingredients differ from fresh produce in texture and strength. Adjust the amount to suit your recipe.",
        },
        {
          icon: "leaf",
          title: "Check the pack",
          text: "Read the ingredient and allergen information before use.",
        },
      ],
      nutritionSource: "https://floruvi.com/faq",
      bannerIndex: 0,
    },
  }),
);
