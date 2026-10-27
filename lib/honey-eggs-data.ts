/** Review/seed input. No supplier, stock or floral-source claim is verified here. */
export const honeyEggCategories = [
  {
    slug: "honey",
    name: "Honey",
    description: "Three honey choices in glass jars.",
  },
  {
    slug: "eggs",
    name: "Eggs",
    description: "Egg cartons for everyday cooking.",
  },
];
const honeyDetails = (title: string, explanation: string) => ({
  tagline: title,
  benefits: [
    { icon: "flower", title: "Know the difference", text: explanation },
    {
      icon: "utensils",
      title: "Ways to use",
      text: "Drizzle over toast, stir into yoghurt or mix into a dressing.",
    },
    {
      icon: "chef",
      title: "Use a dry spoon",
      text: "Keep crumbs and water out of the jar. Close the lid after use.",
    },
  ],
  preparation: "Add a little at a time and adjust to taste.",
  storage:
    "Keep the jar closed in a cool, dry place away from direct sunlight. Honey can crystallise naturally.",
  nutritionTitle: "Kitchen notes",
  nutrition: [
    {
      icon: "utensils",
      title: "For children",
      text: "Do not give honey to children younger than 12 months.",
    },
    {
      icon: "utensils",
      title: "A sweet ingredient",
      text: "Start with a small amount and adjust to taste.",
    },
    {
      icon: "flower",
      title: "Source matters",
      text: "Raw describes processing. Wildflower and single-flower describe floral source. These terms can overlap.",
    },
  ],
  nutritionSource: "https://floruvi.com/faq",
  bannerIndex: 0,
});
export const honeyEggProducts = [
  {
    slug: "raw-honey",
    name: "Raw honey",
    category: "honey",
    description:
      "Honey proposed for minimal processing. Stir into yoghurt, drizzle over toast or use in dressings.",
    uses: ["Breakfast", "Dressings", "Baking"],
    price: { amountMinor: 34825, currency: "INR", packLabel: "100 ml" },
    details: honeyDetails(
      "A honey choice for everyday cooking",
      "Raw describes how honey is processed. It does not identify the flowers visited by the bees. Supplier processing details must be confirmed.",
    ),
  },
  {
    slug: "wildflower-honey",
    name: "Wildflower honey",
    category: "honey",
    description:
      "Honey proposed from a mix of flower sources. Flavour and colour can vary by harvest.",
    uses: ["Drinks", "Breakfast", "Dressings"],
    price: { amountMinor: 31325, currency: "INR", packLabel: "100 ml" },
    details: honeyDetails(
      "A mix of floral sources",
      "Wildflower honey comes from more than one flower source. It can also be raw. The supplier must confirm the source of each batch.",
    ),
  },
  {
    slug: "single-flower-honey",
    name: "Single-flower honey",
    category: "honey",
    description:
      "Honey proposed with one predominant flower source. The final flower name will follow supplier verification.",
    uses: ["Dressings", "Breakfast", "Baking"],
    price: { amountMinor: 40075, currency: "INR", packLabel: "100 ml" },
    details: honeyDetails(
      "One predominant floral source",
      "Single-flower means one flower source predominates, not that every drop comes from one flower. A named floral variety needs supplier evidence before sale.",
    ),
  },
  {
    slug: "farm-eggs",
    name: "Farm eggs",
    category: "eggs",
    description:
      "Eggs in protective cartons for scrambles, omelettes, curries and baking. Choose 1, 2, 3 or 4 dozen.",
    uses: ["Breakfast", "Curries", "Baking"],
    price: { amountMinor: 17800, currency: "INR", packLabel: "12 eggs" },
    details: {
      tagline: "An everyday kitchen staple",
      benefits: [
        {
          icon: "chef",
          title: "Cook your way",
          text: "Use in omelettes, fully cooked scrambles, curries and baking.",
        },
        {
          icon: "utensils",
          title: "Four pack sizes",
          text: "Choose 12, 24, 36 or 48 eggs. Each egg has its own protective cell.",
        },
        {
          icon: "sun",
          title: "Check each egg",
          text: "Do not use cracked eggs. Follow the handling and date information on the carton.",
        },
      ],
      preparation:
        "Cook egg dishes fully. Keep raw eggs and their utensils separate from ready-to-eat food.",
      storage:
        "Keep refrigerated in the original carton. Follow the use-by date and handling instructions on the supplied pack.",
      nutritionTitle: "Kitchen notes",
      nutrition: [
        {
          icon: "chef",
          title: "Cook fully",
          text: "Cook until the white and yolk are firm. Follow each recipe’s cooking instructions.",
        },
        {
          icon: "utensils",
          title: "Allergen",
          text: "Contains egg. Check the other ingredients when cooking for someone with an allergy.",
        },
      ],
      nutritionSource: "https://floruvi.com/faq",
      bannerIndex: 0,
    },
  },
];

export const honeyRecipes = [
  {
    slug: "honey-yoghurt-fruit-bowl",
    name: "Honey yoghurt fruit bowl",
    category: "Breakfast",
    description: "Yoghurt, banana and oats with a drizzle of honey.",
    minutes: 5,
    prepMinutes: 5,
    cookMinutes: 0,
    servings: 2,
    ingredients: [
      "300 g plain yoghurt",
      "1 banana, sliced",
      "4 tbsp rolled oats",
      "2 tsp Floruvi raw honey",
    ],
    steps: [
      "Divide the yoghurt between two bowls.",
      "Add the banana and oats.",
      "Drizzle one teaspoon of honey over each bowl.",
      "Serve at once.",
    ],
    crops: ["raw-honey"],
    tip: "Wildflower or single-flower honey can replace raw honey. Choose one, not all three. Contains milk and oats.",
    imageKey: "recipe:honey-yoghurt-fruit-bowl",
  },
  {
    slug: "honey-lemon-mint-drink",
    name: "Honey lemon mint drink",
    category: "Smoothies",
    description:
      "A simple lemon and mint drink sweetened with wildflower honey.",
    minutes: 5,
    prepMinutes: 5,
    cookMinutes: 0,
    servings: 2,
    ingredients: [
      "500 ml drinking water",
      "2 tbsp lemon juice",
      "2 tsp Floruvi wildflower honey",
      "6 mint leaves",
      "Ice, optional",
    ],
    steps: [
      "Stir the honey into a little room-temperature water until it dissolves.",
      "Add the remaining water and lemon juice.",
      "Lightly crush the mint leaves and add them.",
      "Pour into two glasses. Add ice if wanted.",
    ],
    crops: ["wildflower-honey"],
    tip: "Adjust lemon and honey to taste. This is a drink recipe, not a health treatment.",
    imageKey: "recipe:honey-lemon-mint-drink",
  },
  {
    slug: "honey-mustard-salad-dressing",
    name: "Honey mustard salad dressing",
    category: "Salads",
    description: "A quick dressing with honey, mustard, lemon and olive oil.",
    minutes: 5,
    prepMinutes: 5,
    cookMinutes: 0,
    servings: 4,
    ingredients: [
      "1 tbsp Floruvi single-flower honey",
      "1 tbsp prepared mustard",
      "2 tbsp lemon juice",
      "3 tbsp olive oil",
      "A pinch of black pepper",
    ],
    steps: [
      "Whisk the honey, mustard and lemon juice in a bowl.",
      "Pour in the olive oil slowly while whisking.",
      "Add black pepper.",
      "Taste and spoon over a freshly prepared salad.",
    ],
    crops: ["single-flower-honey"],
    tip: "Raw or wildflower honey can be used instead. Contains mustard. Check the mustard label for other allergens.",
    imageKey: "recipe:honey-mustard-salad-dressing",
  },
];
