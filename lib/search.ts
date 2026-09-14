import type { Product } from "./catalogue";

const aliases: Record<string, string> = {
  spinach: "palak",
  coriander: "dhaniya dhania cilantro",
  mint: "pudina",
  "bell-peppers": "capsicum shimla mirch",
  eggplant: "brinjal baingan aubergine",
  arugula: "rocket roquette rucola",
  "bok-choy": "pak choi pakchoi bokchoy",
  "fenugreek-greens": "methi",
  "holy-basil": "tulsi",
  "green-beans": "french beans",
  "spring-onions": "scallions green onions",
  zucchini: "courgette",
  muskmelon: "cantaloupe kharbuja",
  radish: "mooli",
  carrot: "gajar",
  potato: "aloo",
  ginger: "adrak",
  turmeric: "haldi",
  "green-chillies": "chili chilli mirch",
};
export function normalizeSearch(value: string) {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}
// Small catalogue: bounded edit distance, including swapped adjacent letters.
function distance(a: string, b: string) {
  const rows = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  rows[0] = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) {
      rows[i][j] = Math.min(
        rows[i - 1][j] + 1,
        rows[i][j - 1] + 1,
        rows[i - 1][j - 1] + Number(a[i - 1] !== b[j - 1]),
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1])
        rows[i][j] = Math.min(rows[i][j], rows[i - 2][j - 2] + 1);
    }
  return rows[a.length][b.length];
}
export function findProducts(
  products: Product[],
  search: string,
  category = "all",
) {
  const query = normalizeSearch(search.slice(0, 100));
  const terms = query.split(" ").filter(Boolean).slice(0, 8);
  return products
    .filter((p) => category === "all" || p.category === category)
    .map((p) => {
      const name = normalizeSearch(p.name);
      const names = normalizeSearch(`${p.name} ${aliases[p.slug] ?? ""}`).split(
        " ",
      );
      const detail = normalizeSearch(
        `${p.description} ${p.uses.join(" ")} ${p.category}`,
      );
      let score = name === query ? 100 : 0;
      for (const term of terms) {
        if (names.includes(term)) {
          score += 20;
          continue;
        }
        if (names.some((word) => word.startsWith(term))) {
          score += 12;
          continue;
        }
        if (detail.includes(term)) {
          score += 4;
          continue;
        }
        const tolerance = term.length < 4 ? 0 : term.length < 7 ? 1 : 2;
        if (
          tolerance &&
          names.some(
            (word) =>
              Math.abs(word.length - term.length) <= tolerance &&
              distance(term, word) <= tolerance,
          )
        ) {
          score += 2;
          continue;
        }
        return { product: p, score: -1 };
      }
      return { product: p, score };
    })
    .filter((p) => p.score >= 0)
    .sort((a, b) => b.score - a.score)
    .map((p) => p.product);
}

export function sortProducts(
  products: Product[],
  sort: string,
  searching: boolean,
) {
  return [...products].sort((a, b) => {
    if (sort === "az") return a.name.localeCompare(b.name);
    if (sort === "price-asc" || sort === "price-desc") {
      if (!a.price || !b.price) return Number(!!b.price) - Number(!!a.price);
      return (
        (a.price.amountMinor - b.price.amountMinor) *
        (sort === "price-asc" ? 1 : -1)
      );
    }
    return searching ? 0 : Number(b.featured) - Number(a.featured);
  });
}
