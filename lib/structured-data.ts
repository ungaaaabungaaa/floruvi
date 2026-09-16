import { currencyExponent, type CurrencyCode } from "./i18n/format";

/** Decimal price string for schema.org, e.g. 14000 INR minor → "140.00". */
export function schemaPrice(minor: number, currency: string) {
  const exponent = currencyExponent[currency as CurrencyCode] ?? 2;
  return (minor / 10 ** exponent).toFixed(exponent);
}

export function breadcrumbList(items: { name: string; url: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
