// Seed input only. Public pages read Convex, never this file as a fallback.
export const sources = {
  flowers:
    "https://extension.illinois.edu/blogs/over-garden-fence/2025-05-29-spice-garden-edible-flowers",
  rhizomes: "https://ask.ifas.ufl.edu/publication/EP638",
  general: "https://extension.umn.edu/how/small-scale-hydroponics",
  hydroponics: "https://extension.okstate.edu/fact-sheets/hydroponics",
  microgreens: "https://extension.psu.edu/growing-microgreens",
  potato:
    "https://cipotato.org/publication/manual-on-quality-seed-potato-production-using-aeroponics/",
};

export const categories = [
  {
    slug: "leafy-greens",
    name: "Leafy greens",
    description:
      "Tender leaves, crisp hearts, and everyday greens for the centre of your plate.",
    color: "#e7ebda",
    symbol: "leaf",
    rank: 0,
  },
  {
    slug: "herbs",
    name: "Fresh herbs",
    description:
      "The fragrant finishing touch. A little leaf can change the whole dish.",
    color: "#dde7df",
    symbol: "herb",
    rank: 1,
  },
  {
    slug: "microgreens",
    name: "Microgreens & shoots",
    description:
      "Small leaves with distinct flavours, from peppery radish to sweet pea shoots.",
    color: "#ece6d7",
    symbol: "sprout",
    rank: 2,
  },
  {
    slug: "fruiting-crops",
    name: "Fruiting crops",
    description:
      "Colour, crunch, and sweetness for salads, cooking, and snacking.",
    color: "#f0e0d5",
    symbol: "tomato",
    rank: 3,
  },
  {
    slug: "roots-and-stems",
    name: "Roots & stems",
    description: "A specialist growing list for roots, bulbs, and crisp stems.",
    color: "#ece1dd",
    symbol: "root",
    rank: 4,
  },
  {
    slug: "edible-flowers",
    name: "Edible flowers",
    description:
      "Delicate colour for thoughtful plates. Food-grade varieties only.",
    color: "#eee1e6",
    symbol: "flower",
    rank: 5,
  },
];

type Crop = [name: string, description: string, uses: string, note?: string];
const groups: Record<string, Crop[]> = {
  "leafy-greens": [
    [
      "Butterhead lettuce",
      "Soft, rounded leaves with a gentle flavour and a delicate, buttery bite.",
      "Salads, lettuce cups, sandwiches",
    ],
    [
      "Romaine lettuce",
      "Long leaves and a firm central rib bring a satisfying crunch to a salad.",
      "Caesar salads, wraps, grilled hearts",
    ],
    [
      "Green oakleaf lettuce",
      "Light, deeply lobed leaves that work well in a mixed salad bowl.",
      "Salad mixes, sandwiches",
    ],
    [
      "Red oakleaf lettuce",
      "Bronze-red leaves add a soft texture and colour to fresh dishes.",
      "Mixed salads, plating",
    ],
    [
      "Lollo rosso lettuce",
      "Frilled red leaves with a slightly bitter finish and an airy texture.",
      "Salad mixes, garnish",
    ],
    [
      "Lollo bionda lettuce",
      "Curly green leaves make a light, crisp base for simple dressings.",
      "Salads, sandwiches",
    ],
    [
      "Iceberg lettuce",
      "A crisp-heading lettuce known for its clean flavour and crunchy leaves.",
      "Wedges, wraps, burgers",
      "Heading needs more space and careful temperature management than loose-leaf lettuce.",
    ],
    [
      "Arugula",
      "Peppery leaves that give a fresh salad or a finished pizza a little bite.",
      "Salads, pizza, pesto",
    ],
    [
      "Spinach",
      "Versatile green leaves for fresh bowls or quick, gentle cooking.",
      "Salads, dal, sautéed greens",
      "Keep the root zone cool; cultivar and temperature strongly affect performance.",
    ],
    [
      "Baby kale",
      "Young kale leaves with a softer texture than mature leaves.",
      "Salads, grain bowls, quick sautés",
    ],
    [
      "Curly kale",
      "Textured green leaves that hold their shape well in hearty dishes.",
      "Soups, sautés, kale chips",
    ],
    [
      "Lacinato kale",
      "Long, dark leaves with a firm texture for cooking and chopped salads.",
      "Soups, braises, salads",
    ],
    [
      "Swiss chard",
      "Broad leaves and crisp stems, useful as two textures in the same dish.",
      "Sautés, gratins, soups",
    ],
    [
      "Bok choy",
      "Spoon-shaped leaves and crisp pale stems with a mild cabbage flavour.",
      "Stir-fries, broths, steamed greens",
    ],
    [
      "Tatsoi",
      "Small, rounded leaves with a mild mustard note.",
      "Salads, soups, stir-fries",
    ],
    [
      "Mizuna",
      "Fine, fringed leaves with a light peppery taste.",
      "Salad mixes, noodle bowls",
    ],
    [
      "Mustard greens",
      "Bold leaves with a mustard bite that softens during cooking.",
      "Saag, stir-fries, pickling",
    ],
    [
      "Watercress",
      "Small, rounded leaves with a lively peppery flavour.",
      "Soups, salads, sandwiches",
      "Use controlled, clean-water production and crop-specific hygiene management.",
    ],
    [
      "Sorrel",
      "Tangy, lemony leaves used in small amounts to brighten a dish.",
      "Sauces, soups, mixed salads",
    ],
    [
      "Endive",
      "Firm leaves with a pleasantly bitter edge.",
      "Salads, roasting, appetisers",
    ],
    [
      "Radicchio",
      "Red leaves and white ribs bring bitterness and contrast to a plate.",
      "Salads, grilling, risotto",
      "A specialist heading crop; colour and head quality depend on the cultivar and conditions.",
    ],
    [
      "Amaranth greens",
      "Tender leaves used in many regional Indian vegetable dishes.",
      "Dal, stir-fries, cooked greens",
    ],
    [
      "Fenugreek greens",
      "Aromatic methi leaves with a characteristic bitter-savoury note.",
      "Parathas, dal, vegetable dishes",
    ],
    [
      "Napa cabbage",
      "Tender layered leaves and mild, crisp stems.",
      "Stir-fries, soups, fermented dishes",
      "Full heads need more room and a longer crop cycle than baby-leaf harvests.",
    ],
  ],
  herbs: [
    [
      "Sweet basil",
      "Broad, fragrant leaves with a warm, sweet aroma.",
      "Pesto, tomato salads, pasta",
    ],
    [
      "Thai basil",
      "Firm aromatic leaves with an anise-like note.",
      "Curries, noodle soups, stir-fries",
    ],
    [
      "Holy basil",
      "Small aromatic tulsi leaves for culinary infusions and selected regional dishes.",
      "Infusions, regional cooking",
    ],
    [
      "Mint",
      "Fresh, cooling leaves for bright chutneys and drinks.",
      "Chutneys, raita, drinks",
    ],
    [
      "Coriander",
      "Fresh cilantro leaves and tender stems with a distinctive citrus-like aroma.",
      "Chutneys, curries, garnish",
    ],
    [
      "Flat-leaf parsley",
      "Fresh, grassy leaves with a clean finish.",
      "Tabbouleh, sauces, garnish",
    ],
    [
      "Curly parsley",
      "Curled leaves add texture and a gentle herbal flavour.",
      "Garnish, salads, herb butter",
    ],
    [
      "Dill",
      "Fine feathery leaves with a bright, anise-like aroma.",
      "Pickles, potatoes, dressings",
    ],
    [
      "Chives",
      "Slender green leaves with a mild onion flavour.",
      "Eggs, soups, dips",
    ],
    [
      "Garlic chives",
      "Flat leaves with a gentle garlic note.",
      "Dumplings, stir-fries, omelettes",
    ],
    [
      "Oregano",
      "Small leaves with a warm, robust herbal aroma.",
      "Tomato sauces, roasting, marinades",
    ],
    [
      "Thyme",
      "Tiny leaves with an earthy, fragrant character.",
      "Roasting, stocks, sauces",
      "A slower perennial herb; use an airy root zone and avoid persistent waterlogging.",
    ],
    [
      "Rosemary",
      "Needle-like leaves with a strong pine-like aroma.",
      "Roast vegetables, breads, marinades",
      "A woody perennial that needs an adapted, well-aerated system and a longer establishment period.",
    ],
    [
      "Sage",
      "Soft grey-green leaves with a deep, savoury aroma.",
      "Brown butter, roasting, stuffing",
      "A woody herb; trial the cultivar in a well-aerated substrate system.",
    ],
    [
      "Lemon balm",
      "Tender leaves with a gentle lemon scent.",
      "Infusions, fruit dishes, garnish",
    ],
    [
      "Shiso",
      "Distinctive aromatic leaves used as a wrap or garnish.",
      "Rice dishes, pickles, garnish",
    ],
    [
      "Chervil",
      "Delicate leaves with a light anise note.",
      "Eggs, salads, finishing sauces",
    ],
    [
      "Tarragon",
      "Narrow leaves with a pronounced anise-like flavour.",
      "Sauces, dressings, herb butter",
      "French tarragon is normally propagated vegetatively; confirm the cultivar before production.",
    ],
    [
      "Marjoram",
      "Soft leaves with a gentle, sweet oregano-like flavour.",
      "Soups, sauces, roast vegetables",
    ],
    [
      "Lemongrass",
      "Fragrant stems with a clear citrus aroma.",
      "Curries, broths, infusions",
      "A large, warm-season clumping crop that needs substrate volume and root space.",
    ],
  ],
  microgreens: [
    [
      "Broccoli microgreens",
      "Small brassica shoots with a mild cabbage-like flavour.",
      "Sandwiches, salads, finishing plates",
    ],
    [
      "Radish microgreens",
      "Crisp little shoots with a clear peppery kick.",
      "Tacos, salads, bowls",
    ],
    [
      "Pea shoots",
      "Tender stems and leaves with a fresh pea flavour.",
      "Salads, sandwiches, quick stir-fries",
    ],
    [
      "Sunflower shoots",
      "Substantial young shoots with a nutty taste and crisp bite.",
      "Salads, wraps, bowls",
    ],
    [
      "Mustard microgreens",
      "Small leaves with a strong mustard warmth.",
      "Sandwiches, garnish, salads",
    ],
    [
      "Red cabbage microgreens",
      "Purple-stemmed young leaves with a mild brassica taste.",
      "Salads, bowls, garnish",
    ],
    [
      "Kale microgreens",
      "Tender young kale leaves for a soft green finish.",
      "Sandwiches, salads, garnish",
    ],
    [
      "Arugula microgreens",
      "Fine leaves with a familiar peppery rocket note.",
      "Pizza, pasta, salads",
    ],
    [
      "Beet microgreens",
      "Colourful stems and young leaves with an earthy taste.",
      "Salads, plating, sandwiches",
    ],
    [
      "Amaranth microgreens",
      "Very fine young leaves with vivid colour in red cultivars.",
      "Garnish, salads, plating",
    ],
    [
      "Basil microgreens",
      "Tiny aromatic leaves with a clear basil fragrance.",
      "Tomato dishes, soups, plating",
    ],
    [
      "Coriander microgreens",
      "Young coriander leaves with a concentrated herbal aroma.",
      "Tacos, soups, garnish",
    ],
    [
      "Fenugreek microgreens",
      "Young methi shoots with a savoury, slightly bitter taste.",
      "Salads, sandwiches, regional dishes",
    ],
    [
      "Wheatgrass",
      "Young wheat shoots grown for fresh preparation.",
      "Juicing",
      "Harvest with clean equipment; suitability for a diet or allergy must not be inferred from the crop name.",
    ],
    [
      "Kohlrabi microgreens",
      "Tender shoots with a gentle cabbage taste.",
      "Salads, bowls, garnish",
    ],
    [
      "Garden cress microgreens",
      "Fine shoots with a sharp, peppery flavour.",
      "Egg dishes, sandwiches, salads",
    ],
  ],
  "fruiting-crops": [
    [
      "Cherry tomatoes",
      "Small tomatoes for sweet-acid contrast in fresh and cooked dishes.",
      "Snacking, salads, roasting",
    ],
    [
      "Beefsteak tomatoes",
      "Large slicing tomatoes for substantial slices and sauces.",
      "Sandwiches, salads, sauces",
    ],
    [
      "Plum tomatoes",
      "Firm, fleshy tomatoes well suited to slow cooking.",
      "Sauces, roasting, soups",
    ],
    [
      "Cucumber",
      "Crisp, refreshing fruit with a mild flavour.",
      "Salads, raita, pickling",
    ],
    [
      "Bell peppers",
      "Thick-walled sweet peppers that bring colour and crunch.",
      "Salads, stuffing, roasting",
    ],
    [
      "Green chillies",
      "Fresh chillies for heat and bright flavour.",
      "Curries, chutneys, pickles",
    ],
    [
      "Jalapeño peppers",
      "Firm chillies with a distinctive flavour and variable heat.",
      "Salsas, pickling, stuffing",
    ],
    [
      "Strawberries",
      "Aromatic soft fruit for fresh eating and simple desserts.",
      "Snacking, desserts, preserves",
    ],
    [
      "Eggplant",
      "Tender-fleshed fruit that absorbs flavour well during cooking.",
      "Curries, roasting, grilling",
      "Needs a supported substrate system, ample light, and crop-specific pollination management.",
    ],
    [
      "Zucchini",
      "Tender summer squash for light cooking.",
      "Grilling, sautés, baking",
      "A space-demanding crop; manage support, pollination, and fruit load in a specialist system.",
    ],
    [
      "Muskmelon",
      "Sweet aromatic melon for fresh slices and fruit dishes.",
      "Fresh eating, fruit salads",
      "A specialist fruiting crop that needs trellising, fruit support, light, and pollination planning.",
    ],
    [
      "Green beans",
      "Tender pods for quick cooking and crisp vegetable dishes.",
      "Stir-fries, salads, sautés",
      "Choose a suitable bush or supported climbing cultivar and trial the nutrient programme.",
    ],
  ],
  "roots-and-stems": [
    [
      "Spring onions",
      "Tender green stems with a mild onion flavour.",
      "Soups, stir-fries, garnish",
      "Often grown for green stems rather than full bulbs; match spacing to the intended harvest.",
    ],
    [
      "Celery",
      "Crisp, aromatic stalks for fresh crunch or a savoury base.",
      "Soups, stocks, salads",
      "A longer-cycle crop requiring generous root space and stable nutrition.",
    ],
    [
      "Radish",
      "Crisp roots with a fresh peppery bite.",
      "Salads, pickles, roasting",
      "Use an adapted deep media or root-support system; ordinary narrow lettuce channels are unsuitable.",
    ],
    [
      "Beetroot",
      "Sweet, earthy roots for cooking or pickling.",
      "Roasting, salads, pickles",
      "A specialist root crop that needs adequate root volume and a suitable support medium.",
    ],
    [
      "Carrot",
      "Crunchy roots with a gentle sweetness.",
      "Salads, roasting, soups",
      "Requires a deep, adapted substrate or specialist root system; not a routine NFT crop.",
    ],
    [
      "Ginger",
      "Aromatic rhizomes with a warm, sharp flavour.",
      "Curries, infusions, marinades",
      "A long-cycle specialist substrate crop; requires space for rhizome development and a farm trial.",
    ],
    [
      "Turmeric",
      "Colourful rhizomes with an earthy, slightly bitter taste.",
      "Curries, pickles, cooking",
      "A long-cycle specialist substrate crop; viable growing is not a guarantee of commercial yield.",
    ],
    [
      "Potato",
      "Versatile tubers for cooking, with specialist aeroponic propagation uses.",
      "Roasting, boiling, mashing",
      "Established aeroponic use is seed minituber production. Table-potato supply needs a separate production trial.",
    ],
  ],
  "edible-flowers": [
    [
      "Nasturtium flowers",
      "Bright blossoms with a peppery taste.",
      "Salads, savoury garnish",
      "Use confirmed edible Tropaeolum majus cultivars grown for food; support the spreading plant.",
    ],
    [
      "Viola flowers",
      "Small, delicate blossoms for subtle colour.",
      "Dessert garnish, salads",
      "Use correctly identified edible Viola species and food-grade production; farm suitability requires a trial.",
    ],
    [
      "Pansy flowers",
      "Broad, colourful blossoms used as a delicate finishing touch.",
      "Cake decoration, salads",
      "Use confirmed edible Viola × wittrockiana varieties grown for food, not florist stock.",
    ],
    [
      "Calendula petals",
      "Golden petals for a light floral accent.",
      "Salads, rice dishes, garnish",
      "Use confirmed Calendula officinalis, with edible petals separated appropriately; trial substrate production.",
    ],
    [
      "Borage flowers",
      "Small blue blossoms with a mild cucumber-like character.",
      "Occasional garnish",
      "Specialist, correctly identified Borago officinalis only. Confirm local food-use guidance and suitability before offering for sale.",
    ],
  ],
};

export const cropCatalogue = Object.entries(groups).flatMap(
  ([category, crops]) =>
    crops.map(([name, description, uses, note], index) => ({
      slug: name
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/-$/, ""),
      name,
      category,
      description,
      uses: uses.split(", "),
      growingNote:
        note ??
        (category === "microgreens"
          ? "Suitable for clean soilless trays or hydroponic mats. Harvest above the growing surface; not sold as sprouts."
          : category === "fruiting-crops"
            ? "Hydroponic substrate systems with plant support are a practical starting point. Light, cultivar, and pollination affect results."
            : "A candidate for soilless production. Hydroponic or adapted aeroponic suitability depends on the cultivar and farm system."),
      suitability:
        category === "roots-and-stems" ||
        category === "edible-flowers" ||
        [
          "Eggplant",
          "Zucchini",
          "Muskmelon",
          "Green beans",
          "Rosemary",
          "Sage",
          "Lemongrass",
        ].includes(name)
          ? ("specialist" as const)
          : ("established" as const),
      methods:
        name === "Potato"
          ? ["Aeroponics (seed production)"]
          : category === "microgreens"
            ? ["Soilless trays"]
            : ["Hydroponics"],
      sourceUrl:
        category === "edible-flowers"
          ? sources.flowers
          : ["Ginger", "Turmeric"].includes(name)
            ? sources.rhizomes
            : name === "Potato"
              ? sources.potato
              : category === "microgreens"
                ? sources.microgreens
                : sources.general,
      sourceNote:
        category === "edible-flowers"
          ? "Reference covers edible species and culinary use. Soilless production and local food suitability need a separate farm trial."
          : ["Ginger", "Turmeric"].includes(name)
            ? "Reference covers container and soilless-substrate production in Florida. Local climate, system, and yield require a farm trial."
            : name === "Potato"
              ? "Source documents seed-potato aeroponics, not retail table-potato yields."
              : "Category-level growing reference. Individual cultivars and farm systems require local validation.",
      featured: [
        "Butterhead lettuce",
        "Arugula",
        "Sweet basil",
        "Radish microgreens",
        "Cherry tomatoes",
        "Strawberries",
      ].includes(name),
      status: "enquiry" as const,
      published: true,
      rank: index,
    })),
);
