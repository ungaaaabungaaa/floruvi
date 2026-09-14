import type { Product } from "./catalogue";
export function findProducts(
  products: Product[],
  search: string,
  category = "all",
) {
  const terms = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return products.filter(
    (p) =>
      (category === "all" || p.category === category) &&
      terms.every((term) =>
        `${p.name} ${p.description} ${p.uses.join(" ")}`
          .toLowerCase()
          .includes(term),
      ),
  );
}
