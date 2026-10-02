import test from "node:test";
import assert from "node:assert/strict";
import { locales, parseLocale } from "../lib/i18n/config";
import {
  individualProduceShippingService,
  productOfferPolicies,
} from "../lib/structured-data";

const shippingPolicyUrl = "https://floruvi.com/shipping";

test("product shipping embeds the confirmed India service and preserves the live fee", () => {
  for (const deliveryFeeMinor of [0, 9900, 14950]) {
    const shipping = individualProduceShippingService({
      policyUrl: shippingPolicyUrl,
      deliveryFeeMinor,
    });
    const policy = productOfferPolicies({
      country: "IN",
      currency: "INR",
      deliveryFeeMinor,
      shippingPolicyUrl,
    });
    assert.ok(shipping);
    assert.equal(
      shipping.shippingConditions.shippingRate.value,
      deliveryFeeMinor / 100,
    );
    assert.equal(shipping.shippingConditions.shippingRate.currency, "INR");
    assert.deepEqual(shipping.shippingConditions.shippingDestination, {
      "@type": "DefinedRegion",
      addressCountry: "IN",
    });
    assert.deepEqual(policy.shippingDetails?.hasShippingService, shipping);
    // A total delivery promise does not establish separate handling or transit times.
    assert.equal("handlingTime" in shipping, false);
    assert.equal("transitTime" in shipping.shippingConditions, false);
    assert.deepEqual(policy.hasMerchantReturnPolicy, {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "IN",
      returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
    });
  }
});

test("export product offers do not inherit domestic delivery or returns", () => {
  for (const locale of locales) {
    const { country, currency, domestic } = parseLocale(locale);
    if (domestic) continue;
    assert.deepEqual(
      productOfferPolicies({
        country,
        currency,
        deliveryFeeMinor: 9900,
        shippingPolicyUrl,
      }),
      {},
      locale,
    );
  }
});

test("unknown or invalid fees never create shipping claims", () => {
  for (const deliveryFeeMinor of [
    undefined,
    null,
    -1,
    0.5,
    NaN,
    Infinity,
    Number.MAX_SAFE_INTEGER + 1,
  ]) {
    assert.equal(
      individualProduceShippingService({
        policyUrl: shippingPolicyUrl,
        deliveryFeeMinor,
      }),
      null,
    );
    const policy = productOfferPolicies({
      country: "IN",
      currency: "INR",
      deliveryFeeMinor,
      shippingPolicyUrl,
    });
    assert.equal("shippingDetails" in policy, false);
    assert.ok(policy.hasMerchantReturnPolicy);
  }
  assert.equal(
    "shippingDetails" in
      productOfferPolicies({
        country: "IN",
        currency: "USD",
        deliveryFeeMinor: 9900,
        shippingPolicyUrl,
      }),
    false,
  );
});
