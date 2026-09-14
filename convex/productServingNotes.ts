// Culinary suggestions, not measured nutrition or medical claims.
export function servingNotes(slug: string, category: string): [string, string] {
  if (slug === "wheatgrass")
    return [
      "Blend a small amount of freshly extracted juice with apple or cucumber juice.",
      "Prepare only the juice you plan to serve. Strain out coarse fibres for a smoother drink.",
    ];
  if (slug === "borage-flowers")
    return [
      "Use a few food-grade blooms to finish a cucumber salad or a cold drink.",
      "Keep this to an occasional small garnish; do not use a bowlful as a vegetable serving.",
    ];
  if (category === "edible-flowers")
    return slug === "calendula-petals"
      ? [
          "Scatter petals over rice, soft cheese or a simple green salad.",
          "Add the petals after cooking so their colour remains visible on the plate.",
        ]
      : slug === "nasturtium-flowers"
        ? [
            "Pair the peppery flowers with cucumber, soft cheese or a mild leaf salad.",
            "Add a few whole flowers at the last moment. Keep dressings light so the petals hold their shape.",
          ]
        : [
            "Pair a few food-grade blooms with fruit, yoghurt or a lightly dressed salad.",
            "Place on the finished dish just before serving, away from hot sauces and heavy dressings.",
          ];
  if (category === "microgreens") {
    const pair = /radish|mustard|arugula|cress/.test(slug)
      ? "Balance peppery shoots with avocado, hummus or a cool yoghurt dressing."
      : /pea|sunflower/.test(slug)
        ? "Pair the shoots with cucumber, soft cheese or a lemon-dressed grain bowl."
        : /basil|coriander/.test(slug)
          ? "Use the aromatic shoots with tomatoes, rice or a warm bowl of soup."
          : /fenugreek/.test(slug)
            ? "Pair the savoury shoots with potatoes, lentils or a chickpea filling."
            : "Pair the young leaves with roasted vegetables, hummus or a lightly dressed salad.";
    return [
      pair,
      slug.endsWith("-live-tray")
        ? "Harvest just the section you need. Leave the rest standing for the next meal; do not rely on cut shoots to regrow."
        : "Scatter over the plate after cooking. A small loose handful keeps the texture light.",
    ];
  }
  if (/lettuce/.test(slug))
    return [
      "Pair with cucumber, tomatoes and a lemon or yoghurt dressing.",
      "Dress only the leaves you will eat straight away. Keep the rest dry for your next salad or sandwich.",
    ];
  if (/kale/.test(slug))
    return [
      "Pair with white beans, roasted squash, garlic or a little lemon.",
      "Slice the leaves finely for even cooking. For a softer salad, massage them with a little dressing.",
    ];
  const notes: Record<string, [string, string]> = {
    spinach: [
      "Pair with chickpeas, paneer, garlic or a squeeze of lemon.",
      "Stir into dal or soup near the end of cooking. The leaves wilt quickly and take up less room in the pan.",
    ],
    arugula: [
      "Pair the peppery leaves with pear, walnuts, tomatoes or shaved cheese.",
      "Scatter over pizza after baking, or fold through warm pasta just before serving.",
    ],
    "swiss-chard": [
      "Pair with garlic, lentils, white beans or a little lemon zest.",
      "Chop the stems small and save them for a sauté; they need more time in the pan than the leaves.",
    ],
    "bok-choy": [
      "Pair with ginger, sesame, mushrooms or tofu.",
      "Halve small heads lengthways for an attractive plate. Keep the base intact to hold the leaves together.",
    ],
    tatsoi: [
      "Pair with sesame, ginger, noodles or tofu.",
      "Add tender leaves to a warm bowl just before serving so they keep some shape.",
    ],
    mizuna: [
      "Pair with citrus, sesame, radish or a mild noodle dressing.",
      "Mix with milder leaves for a salad, or use a loose handful to finish a noodle bowl.",
    ],
    "mustard-greens": [
      "Pair with garlic, potatoes, lentils or a mild yoghurt side.",
      "Chop finely for saag, or mix with milder greens to soften the mustard flavour.",
    ],
    watercress: [
      "Pair with potatoes, eggs, citrus or a mild creamy dressing.",
      "Use tender tips for salads and save firmer stems for a cooked soup.",
    ],
    sorrel: [
      "Pair a few leaves with potatoes, eggs or a creamy sauce.",
      "Taste before adding lemon or vinegar: sorrel already brings a tart note.",
    ],
    endive: [
      "Pair with orange, walnuts, apple or soft cheese.",
      "Use the firm outer leaves as small cups for a chopped salad filling.",
    ],
    radicchio: [
      "Pair with pear, orange, walnuts or a mild cheese.",
      "Mix raw shreds with sweeter ingredients, or grill wedges to soften their texture.",
    ],
    "amaranth-greens": [
      "Pair with lentils, garlic, coconut or cumin.",
      "Chop leaves and tender stems for a cooked side; remove the coarse stalks first.",
    ],
    "fenugreek-greens": [
      "Pair with potatoes, peas, lentils or whole-wheat dough.",
      "Fold chopped leaves into paratha dough, or add a small handful to a vegetable curry.",
    ],
    "napa-cabbage": [
      "Pair with ginger, mushrooms, tofu or spring onions.",
      "Use the thicker ribs for crunch and the softer leaves to soak up a light broth.",
    ],
    mint: [
      "Pair with cucumber, yoghurt, peas or fresh lime.",
      "Chop just before serving. Fold into cooled food when you want its fresh, cooling flavour.",
    ],
    coriander: [
      "Pair with lime, tomatoes, lentils or green chilli.",
      "Use tender stems in chutneys and save the leafy tops to finish the dish.",
    ],
    dill: [
      "Pair with cucumber, potatoes, yoghurt or lemon.",
      "Snip over the finished dish, or stir into a cold dressing just before serving.",
    ],
    chives: [
      "Pair with potatoes, eggs, cream cheese or a yoghurt dip.",
      "Use clean scissors to make small, even pieces without crushing the leaves.",
    ],
    "garlic-chives": [
      "Pair with mushrooms, tofu, eggs or dumpling fillings.",
      "Cut into short lengths for stir-fries, or chop finely when mixing into a filling.",
    ],
    lemongrass: [
      "Pair with ginger, coconut milk, lime or mushrooms.",
      "Use bruised stems to scent a broth. Remove large fibrous pieces before serving.",
    ],
    ginger: [
      "Pair with garlic, lime, carrots or coconut milk.",
      "Grate for an even background flavour; use thin slices when you want to remove the ginger after cooking.",
    ],
    turmeric: [
      "Pair with ginger, coconut milk, lentils or cauliflower.",
      "Start with a small amount and taste. Grate over a washable surface because the colour can stain.",
    ],
    cucumber: [
      "Pair with mint, yoghurt, tomatoes or a little lime.",
      "For a thicker raita, squeeze excess moisture from grated cucumber before mixing it with yoghurt.",
    ],
    "bell-peppers": [
      "Pair with tomatoes, onions, beans or a rice filling.",
      "Cut into wide pieces for roasting and thin strips for quick pan cooking.",
    ],
    "green-chillies": [
      "Pair with coriander, lime, tomatoes or yoghurt.",
      "Add a little at a time and taste the dish. Heat can vary between individual chillies.",
    ],
    "jalapeno-peppers": [
      "Pair with tomatoes, lime, beans or a soft cheese filling.",
      "Slice thinly to spread the heat through a salsa or sandwich rather than concentrating it in one bite.",
    ],
    strawberries: [
      "Pair with yoghurt, basil, mint or a little lemon zest.",
      "Slice just before serving, or gently crush a few berries to make a quick topping.",
    ],
    eggplant: [
      "Pair with tomatoes, garlic, yoghurt or tahini.",
      "Leave space between pieces when roasting. Crowding the tray gives a softer, more steamed result.",
    ],
    zucchini: [
      "Pair with lemon, mint, basil or a little grated cheese.",
      "Use thicker slices for grilling and small pieces for a quick sauté.",
    ],
    muskmelon: [
      "Pair with mint, lime, yoghurt or other fresh fruit.",
      "Cut into bite-size pieces for a bowl and chill after cutting. Keep the rind out of the serving dish.",
    ],
    "green-beans": [
      "Pair with garlic, sesame, lemon or toasted almonds.",
      "Cut to a similar length for even cooking, then toss with dressing while still warm.",
    ],
    "spring-onions": [
      "Pair with ginger, eggs, tofu or a rice dish.",
      "Slice the green tops thinly for a garnish and save the white ends for the pan.",
    ],
    celery: [
      "Pair with carrots, onions, beans or apples.",
      "Dice finely for a soup base, or slice across the ribs for a crisp salad texture.",
    ],
    radish: [
      "Pair with cucumber, yoghurt, butter or a little lemon.",
      "Slice very thinly for a crisp topping, or roast halves to mellow their sharpness.",
    ],
    beetroot: [
      "Pair with orange, dill, yoghurt or walnuts.",
      "Cook separately from pale ingredients if you want to keep their colours distinct.",
    ],
    carrot: [
      "Pair with cumin, ginger, citrus or chickpeas.",
      "Cut into similar-size pieces for roasting, or grate finely to soften the bite in a raw salad.",
    ],
    potato: [
      "Pair with rosemary, garlic, peas or a yoghurt dressing.",
      "Use even chunks for boiling and leave space between pieces when roasting for crisp edges.",
    ],
  };
  if (notes[slug]) return notes[slug];
  if (/tomato/.test(slug))
    return [
      "Pair with basil, olive oil, garlic or a mild fresh cheese.",
      slug === "plum-tomatoes"
        ? "Simmer chopped tomatoes gently until the sauce reaches the thickness you like."
        : "Slice with a sharp knife to keep the juices in the flesh. Season shortly before serving.",
    ];
  if (category === "herbs") {
    if (/basil/.test(slug))
      return [
        slug === "sweet-basil"
          ? "Pair with tomatoes, mozzarella, lemon or toasted seeds."
          : "Pair with ginger, coconut milk or a warm rice dish.",
        "Add tender leaves late in cooking. Tear rather than finely chop when you want larger pieces on the plate.",
      ];
    if (/parsley|chervil/.test(slug))
      return [
        "Pair with lemon, potatoes, eggs or a simple bean salad.",
        "Dry the leaves before chopping so they stay loose and mix evenly through a dressing.",
      ];
    if (/rosemary|thyme|oregano|sage|marjoram/.test(slug))
      return [
        "Pair with roast potatoes, mushrooms, beans or a tomato sauce.",
        "Start with a little and taste as the dish cooks. Remove woody stems before serving.",
      ];
    if (slug === "lemon-balm")
      return [
        "Pair with berries, melon or a mild herbal infusion.",
        "Gently bruise a few leaves to release their scent, then add them to a cooled drink.",
      ];
    if (slug === "shiso")
      return [
        "Pair with cucumber, rice, sesame or pickled vegetables.",
        "Stack a few dry leaves and slice into fine ribbons for a neat finishing garnish.",
      ];
    if (slug === "tarragon")
      return [
        "Pair with mustard, potatoes, eggs or a creamy dressing.",
        "Use a small amount first: the anise-like flavour can dominate a delicate sauce.",
      ];
  }
  throw new Error(`Missing serving notes: ${slug}`);
}
