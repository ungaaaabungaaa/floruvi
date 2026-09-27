// Other names that search accepts, for the shop search and the chat assistant.
// Sources and the review list: docs/28-shipping-and-languages-research.md (B1).
// Names marked there as unverified, or that are common words in another site
// language (for example Malay "besar", Hindi "kaha"), are left out.

const lettuce = ["salad patta", "salad ka patta", "सलाद पत्ता"];
const tomato = ["tamatar", "tameta", "thakkali", "takkali", "टमाटर"];
const pea = ["matar", "vatana", "batani", "pattani", "मटर"];
const sunflower = ["suraj mukhi", "surajmukhi", "surya mukhi", "suryakanthi", "सूरजमुखी"];

export const productAliases: Record<string, string[]> = {
  spinach: ["palak", "paalak", "palakura", "palong", "paleng", "pasalai keerai", "nivithi", "पालक"],
  "amaranth-greens": ["chaulai", "cholai", "lal saag", "thotakura", "thandu keerai", "cheera", "math", "चौलाई"],
  "fenugreek-greens": ["methi", "methi saag", "methi bhaji", "menthya soppu", "vendhaya keerai", "menthikoora", "मेथी"],
  "mustard-greens": ["sarson", "sarson ka saag", "sorisa", "rayo", "kadugu", "सरसों"],
  "butterhead-lettuce": lettuce,
  "romaine-lettuce": lettuce,
  "green-oakleaf-lettuce": lettuce,
  "red-oakleaf-lettuce": lettuce,
  "lollo-rosso-lettuce": lettuce,
  "lollo-bionda-lettuce": lettuce,
  "iceberg-lettuce": lettuce,
  arugula: ["rocket", "roquette", "rucola", "taramira", "tara mira", "तारामीरा"],
  "napa-cabbage": ["chinese cabbage"],
  "bok-choy": ["pak choi", "pakchoi", "bokchoy"],
  coriander: [
    "dhaniya",
    "dhania",
    "cilantro",
    "hara dhaniya",
    "dhaniya patta",
    "kothimbir",
    "kothamalli",
    "kothimiri",
    "kothambari",
    "dhone pata",
    "धनिया",
  ],
  mint: ["pudina", "podina", "phudino", "babari", "पुदीना"],
  "holy-basil": ["tulsi", "tulasi", "thulasi", "तुलसी"],
  "sweet-basil": ["sabja", "babui tulsi", "ban tulsi"],
  dill: ["sowa", "surva", "shepu", "sabasige", "sathakuppi", "सोआ"],
  celery: ["ajmod", "ajmud", "ajmoda", "shalari", "अजमोद"],
  "flat-leaf-parsley": ["ajmod"],
  "curly-parsley": ["ajmod"],
  lemongrass: ["nimbu ghas", "sera", "serai"],
  radish: ["mooli", "muli", "mula", "mullangi", "rabu", "मूली"],
  carrot: ["gajar", "gajor", "gajjare", "gajjara gadda", "गाजर"],
  beetroot: ["chukandar", "chukandhar", "चुकंदर"],
  ginger: ["adrak", "inji", "allam", "aduwa", "inguru", "अदरक"],
  turmeric: ["haldi", "kachi haldi", "halad", "holud", "manjal", "pasupu", "हल्दी"],
  potato: ["aloo", "alu", "batata", "urulai kizhangu", "bangala dumpa", "आलू"],
  "spring-onions": ["scallions", "green onions", "hari pyaz", "hare pyaaz", "ulli kadalu", "piyaj paat", "हरा प्याज़"],
  cucumber: ["kheera", "khira", "kakdi", "kakadi", "vellarikkai", "dosakaya", "pipinna", "खीरा"],
  "cherry-tomatoes": tomato,
  "beefsteak-tomatoes": tomato,
  "plum-tomatoes": tomato,
  eggplant: ["brinjal", "aubergine", "baingan", "baigan", "begun", "vange", "kathirikkai", "vankaya", "bhanta", "wambatu", "बैंगन"],
  "bell-peppers": ["capsicum", "shimla mirch", "shimla mirchi", "simla mirch", "koda milagai", "शिमला मिर्च"],
  "green-chillies": ["chili", "chilli", "mirch", "hari mirch", "hari mirchi", "pachai milagai", "kancha lanka", "khursani", "हरी मिर्च"],
  "green-beans": ["french beans", "beans", "fansi", "farasbi"],
  zucchini: ["courgette"],
  muskmelon: ["cantaloupe", "kharbuja", "kharbooja", "kharamuja", "mulam pazham", "खरबूजा"],
  "pea-shoots": pea,
  "pea-microgreens-live-tray": pea,
  "sunflower-shoots": sunflower,
  "sunflower-microgreens-live-tray": sunflower,
  wheatgrass: ["gehun", "gehu", "गेहूं"],
  "garden-cress-microgreens": ["halim", "ahiva", "asadiyo", "हलीम"],
  "kohlrabi-microgreens": ["ganth gobhi", "knol khol", "nool kol", "olkopi", "गांठ गोभी"],
};

/** Microgreens and live trays also answer to their parent crop's names, ranked below the crop. */
const parents: Record<string, string> = {
  "radish-microgreens": "radish",
  "radish-microgreens-live-tray": "radish",
  "fenugreek-microgreens": "fenugreek-greens",
  "fenugreek-microgreens-live-tray": "fenugreek-greens",
  "mustard-microgreens": "mustard-greens",
  "amaranth-microgreens": "amaranth-greens",
  "red-amaranth-microgreens-live-tray": "amaranth-greens",
  "coriander-microgreens": "coriander",
  "basil-microgreens": "sweet-basil",
  "beet-microgreens": "beetroot",
  "arugula-microgreens": "arugula",
};

export function aliasesOf(slug: string) {
  const own = productAliases[slug] ?? [];
  const parent = parents[slug];
  return { own, inherited: parent ? (productAliases[parent] ?? []) : [] };
}
