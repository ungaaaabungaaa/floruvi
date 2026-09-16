// Export the live English catalogue text that translators work from.
// Usage: node --import tsx scripts/i18n/extract-content.ts [convex-url]
import { mkdir, writeFile } from "node:fs/promises";
import {
  fingerprint,
  productText,
  recipeText,
} from "../../lib/i18n/content-source";

const convex =
  process.argv[2] ??
  process.env.NEXT_PUBLIC_CONVEX_URL ??
  "https://polished-mosquito-828.eu-west-1.convex.cloud";

async function query<T>(path: string, args: Record<string, unknown> = {}) {
  const response = await fetch(`${convex}/api/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, args, format: "json" }),
  });
  const body = await response.json();
  if (body.status !== "success") throw new Error(`${path}: ${JSON.stringify(body)}`);
  return body.value as T;
}

type Browse = {
  products: { slug: string; name: string; description: string; uses: string[] }[];
};
type Details = Parameters<typeof productText>[1];
type Recipe = Parameters<typeof recipeText>[0] & { slug: string };

async function main() {
  const { products } = await query<Browse>("catalogue:browse");
  const productSource: Record<string, unknown> = {};
  for (const product of products) {
    const details = await query<Details>("catalogue:details", { slug: product.slug });
    const text = productText(product, details);
    productSource[product.slug] = { source: fingerprint(text), ...text };
  }

  const list = await query<{ slug: string }[]>("recipes:list");
  const recipeSource: Record<string, unknown> = {};
  for (const { slug } of list) {
    const recipe = await query<Recipe | null>("recipes:get", { slug });
    if (!recipe) continue;
    const text = recipeText(recipe);
    recipeSource[slug] = { source: fingerprint(text), ...text };
  }

  await mkdir("content/i18n/en", { recursive: true });
  await writeFile(
    "content/i18n/en/products.json",
    `${JSON.stringify(productSource, null, 2)}\n`,
  );
  await writeFile(
    "content/i18n/en/recipes.json",
    `${JSON.stringify(recipeSource, null, 2)}\n`,
  );
  console.log(
    `Exported ${Object.keys(productSource).length} products and ${Object.keys(recipeSource).length} recipes from ${convex}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
