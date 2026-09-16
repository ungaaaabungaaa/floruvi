import type { Metadata } from "next";
import { reviewBasket } from "@/lib/pricing";
import { boxSizes, boxContents } from "@/lib/boxes";
import { getRecipeList, getShop } from "@/lib/storefront";
import { getI18n } from "@/lib/i18n/server";
import { localizePath } from "@/lib/i18n/config";
import { fill } from "@/lib/i18n/format";
import { siteUrl } from "@/lib/site";
import { absoluteUrl, jsonLd, pageMetadata } from "@/lib/seo";
import { schemaPrice } from "@/lib/structured-data";
import { BoxSelector } from "@/components/box-selector";
import dualBox from "@/src/assets/boxes/dual.webp";

export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getI18n();
  return pageMetadata({
    path: "/boxes",
    title: messages.meta.boxes.title,
    description: messages.meta.boxes.description,
    image: { url: dualBox.src, width: dualBox.width, height: dualBox.height, alt: messages.boxes.heroAlt },
  });
}

export default async function Boxes() {
  const [{ locale, messages }, { products }, recipes] = await Promise.all([
    getI18n(),
    getShop(),
    getRecipeList(),
  ]);
  const meals = recipes
    .filter((recipe) =>
      recipe.crops.some((slug) => boxContents.some((item) => item.slug === slug)),
    )
    .slice(0, 5);
  const plans = boxSizes.map((box, index) => ({
    id: box.id,
    ...reviewBasket(
      boxContents.map((line) => ({
        ...line,
        quantity: line.quantity * [1, 2, 4][index],
      })),
      products,
      { currency: "INR", deliveryFeeMinor: 0 },
      locale.market,
    ),
  }));
  const contents = boxContents.map((item) => {
    const product = products.find((p) => p.slug === item.slug);
    return {
      slug: item.slug,
      name: product?.name ?? item.slug,
      packLabel: product?.price?.packLabel ?? "",
    };
  });
  const priced = plans.filter((plan) => plan.total !== null);
  const url = absoluteUrl(localizePath(locale.locale, "/boxes"));
  const schema = priced.length
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: messages.meta.boxes.title,
        description: messages.meta.boxes.description,
        url,
        inLanguage: locale.tag,
        image: absoluteUrl(dualBox.src),
        brand: { "@type": "Brand", name: "Floruvi" },
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: locale.currency,
          lowPrice: schemaPrice(Math.min(...priced.map((p) => p.total!)), locale.currency),
          highPrice: schemaPrice(Math.max(...priced.map((p) => p.total!)), locale.currency),
          offerCount: priced.length,
          seller: { "@id": `${siteUrl}/#organization` },
        },
      }
    : null;
  const faq = locale.domestic
    ? messages.boxes.faq
    : [
        messages.boxes.faqExportPrice.map((text) =>
          fill(text, { country: locale.countryName }),
        ),
        ...messages.boxes.faq.slice(1),
      ];
  return (
    <>
      {schema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} />
      )}
      <BoxSelector
        plans={plans}
        contents={contents}
        recipes={meals}
        labels={{ ...messages.boxes, faq }}
      />
    </>
  );
}
