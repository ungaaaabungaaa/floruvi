import type { Messages } from "./i18n/messages";
import { fill, formatCurrency, type CurrencyCode } from "./i18n/format";
import { storefrontCopy } from "./storefront-copy";

type Price = { amountMinor: number; currency: string; packLabel: string } | null;
type Product = { slug: string; category: string; name: string; description: string; price: Price };
type Recipe = { slug: string; name: string; description: string; minutes: number };

/** /llms.txt (llmstxt.org): the India English site as plain Markdown for AI assistants. */
export function llmsText({
  site,
  messages,
  categories,
  products,
  recipes,
  deliveryFeeMinor,
}: {
  site: string;
  messages: Messages;
  categories: { slug: string; name: string }[];
  products: Product[];
  recipes: Recipe[];
  deliveryFeeMinor: number | null | undefined;
}) {
  const url = (path: string) => new URL(path, site).toString();
  const money = (minor: number, currency: string) =>
    formatCurrency(minor, currency as CurrencyCode, "en-IN");
  const { meta, faq } = messages;
  const categoryNames = messages.categories as Record<string, { name: string } | undefined>;
  const deliveryFee =
    deliveryFeeMinor == null
      ? faq.deliveryFeeMissing
      : fill(faq.deliveryFee, { fee: money(deliveryFeeMinor, "INR") });

  const pages: [string, string, string][] = [
    ["/products", meta.products.title, meta.products.description],
    ["/boxes", meta.boxes.title, meta.boxes.description],
    ["/recipes", meta.recipes.title, meta.recipes.description],
    ["/how-we-grow", meta.howWeGrow.title, meta.howWeGrow.description],
    ["/faq", meta.faq.title, meta.faq.description],
    ["/contact", meta.contact.title, meta.contact.description],
  ];
  const lines = [
    `# ${meta.siteName}`,
    "",
    `> ${meta.description}`,
    "",
    `${messages.common.brand.tagline}. Prices below are for India, in INR, from the live catalogue. Product pages show the current price and pack size.`,
    "",
    "## Main pages",
    "",
    ...pages.map(([path, title, description]) => `- [${title}](${url(path)}): ${description}`),
    "",
    "## Produce",
  ];
  for (const category of categories) {
    const items = products.filter((product) => product.category === category.slug);
    if (!items.length) continue;
    lines.push("", `### ${categoryNames[category.slug]?.name ?? storefrontCopy(category.name)}`, "");
    for (const product of items) {
      const price = product.price
        ? ` ${product.price.packLabel}: ${money(product.price.amountMinor, product.price.currency)}.`
        : "";
      lines.push(
        `- [${storefrontCopy(product.name)}](${url(`/products/${product.slug}`)}): ${storefrontCopy(product.description)}${price}`,
      );
    }
  }
  lines.push("", "## Questions & answers");
  for (const group of Object.values(faq.groups)) {
    lines.push("", `### ${group.title}`, "");
    for (const [question, answer] of group.questions)
      lines.push(`- **${question}** ${fill(answer, { deliveryFee })}`);
  }
  lines.push(
    "",
    "## Optional",
    "",
    `- [${meta.privacy.title}](${url("/privacy")}): ${meta.privacy.description}`,
    `- [${meta.terms.title}](${url("/terms")}): ${meta.terms.description}`,
    `- [${meta.refunds.title}](${url("/refunds")}): ${meta.refunds.description}`,
    `- [${meta.shipping.title}](${url("/shipping")}): ${meta.shipping.description}`,
    `- [Sitemap](${url("/sitemap.xml")}): every page in all 32 country & language versions.`,
    "",
    `### ${meta.recipes.title}`,
    "",
    ...recipes.map(
      (recipe) =>
        `- [${storefrontCopy(recipe.name)}](${url(`/recipes/${recipe.slug}`)}): ${storefrontCopy(recipe.description)} (${recipe.minutes} min)`,
    ),
    "",
  );
  return lines.join("\n");
}
