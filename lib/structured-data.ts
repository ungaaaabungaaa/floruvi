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

const validDeliveryFee = (minor: number | null | undefined): minor is number =>
  typeof minor === "number" && Number.isSafeInteger(minor) && minor >= 0;

/** The confirmed India fee applies to baskets containing individual produce. */
export function individualProduceShippingService({
  policyUrl,
  deliveryFeeMinor,
}: {
  policyUrl: string;
  deliveryFeeMinor: number | null | undefined;
}) {
  if (!validDeliveryFee(deliveryFeeMinor)) return null;
  return {
    "@type": "ShippingService",
    "@id": `${policyUrl}#individual-produce`,
    name: "India delivery for baskets with individual produce",
    fulfillmentType: "https://schema.org/FulfillmentTypeDelivery",
    shippingConditions: {
      "@type": "ShippingConditions",
      shippingDestination: { "@type": "DefinedRegion", addressCountry: "IN" },
      shippingRate: {
        "@type": "MonetaryAmount",
        value: Number(schemaPrice(deliveryFeeMinor, "INR")),
        currency: "INR",
      },
    },
  };
}

type ProductOfferPolicies = {
  hasMerchantReturnPolicy?: {
    "@type": "MerchantReturnPolicy";
    applicableCountry: "IN";
    returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted";
  };
  shippingDetails?: {
    "@type": "OfferShippingDetails";
    hasShippingService: NonNullable<
      ReturnType<typeof individualProduceShippingService>
    >;
  };
};

/** Export delivery is quoted. The confirmed no-return policy covers India only. */
export function productOfferPolicies({
  country,
  currency,
  deliveryFeeMinor,
  shippingPolicyUrl,
}: {
  country: string;
  currency: string;
  deliveryFeeMinor: number | null | undefined;
  shippingPolicyUrl: string;
}): ProductOfferPolicies {
  if (country !== "IN") return {};
  const shipping =
    currency === "INR"
      ? individualProduceShippingService({
          policyUrl: shippingPolicyUrl,
          deliveryFeeMinor,
        })
      : null;
  return {
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "IN",
      returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
    },
    ...(shipping
      ? {
          shippingDetails: {
            "@type": "OfferShippingDetails",
            hasShippingService: shipping,
          },
        }
      : {}),
  };
}
