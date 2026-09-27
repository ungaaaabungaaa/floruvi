import { aliasesOf } from "./search-aliases";

type Product = {
  slug: string;
  name: string;
  description: string;
  uses: string[];
  category: string;
  featured: boolean;
  price?: { amountMinor: number } | null;
  // English name, so English search terms still work on translated pages.
  englishName?: string;
};

export function normalizeSearch(value: string) {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/**
 * Folds common spelling variants of Indian names typed in English letters, so
 * kheera/khira, mooli/muli and baingan/bengan meet. Other scripts pass through.
 */
export function foldSpelling(word: string) {
  if (!/^[a-z]+$/.test(word)) return word;
  return word
    .replace(/ee/g, "i")
    .replace(/oo/g, "u")
    .replace(/aa/g, "a")
    .replace(/ph/g, "f")
    .replace(/w/g, "v")
    .replace(/z/g, "j")
    .replace(/ai/g, "e")
    .replace(/au|ow/g, "o")
    .replace(/([bcdgjkpst])h/g, "$1")
    .replace(/(.)\1+/g, "$1");
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

function nearly(term: string, words: string[]) {
  const tolerance = term.length < 4 ? 0 : term.length < 7 ? 1 : 2;
  return (
    tolerance > 0 &&
    words.some(
      (word) =>
        Math.abs(word.length - term.length) <= tolerance && distance(term, word) <= tolerance,
    )
  );
}

export function findProducts<T extends Product>(
  products: T[],
  search: string,
  category = "all",
) {
  const query = normalizeSearch(search.slice(0, 100));
  const terms = query.split(" ").filter(Boolean).slice(0, 8);
  const scored = products
    .filter((p) => category === "all" || p.category === category)
    .map((p) => {
      const { own, inherited } = aliasesOf(p.slug);
      const name = normalizeSearch(p.name);
      const names = normalizeSearch(
        `${p.name} ${p.englishName ?? ""} ${[...own, ...inherited].join(" ")}`,
      ).split(" ");
      const folded = names.map(foldSpelling);
      const detail = normalizeSearch(
        `${p.description} ${p.uses.join(" ")} ${p.category}`,
      );
      // The whole query as the name, or as one of the crop's own local names, ranks first.
      let score =
        name === query ? 100 : own.some((alias) => normalizeSearch(alias) === query) ? 60 : 0;
      let missed = 0;
      // Whole-word name matches of 3+ letters, for the fallback below.
      let strong = 0;
      for (const term of terms) {
        const fold = foldSpelling(term);
        if (names.includes(term) || folded.includes(fold)) {
          score += names.includes(term) ? 20 : 16;
          if (term.length >= 3) strong++;
        } else if (names.some((word) => word.startsWith(term))) score += 12;
        else if (detail.includes(term)) score += 4;
        else if (nearly(term, names) || nearly(fold, folded)) score += 2;
        else missed++;
      }
      return { product: p, score, missed, strong };
    });
  const complete = scored.filter((s) => s.missed === 0);
  // No product matches every word ("palak chahiye"): show products that match at
  // least one whole word by name, best first.
  const shown =
    complete.length || terms.length < 2 ? complete : scored.filter((s) => s.strong > 0);
  return shown.sort((a, b) => b.score - a.score).map((s) => s.product);
}

export function sortProducts<T extends Product>(
  products: T[],
  sort: string,
  searching: boolean,
  language?: string,
) {
  return [...products].sort((a, b) => {
    if (sort === "az") return a.name.localeCompare(b.name, language);
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
