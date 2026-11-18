import test from "node:test";
import assert from "node:assert/strict";
import {
  publicAnalyticsPath,
  parseAnalyticsConsent,
  REPLAY_PRIVACY,
  campaignProperties,
  isCheckoutEntry,
} from "../lib/analytics-policy";
import { beforeSend, setAnalyticsConsent } from "../lib/analytics";
import type { CaptureResult } from "posthog-js";
test("basket navigation does not suppress checkout entries or count duplicate renders", () => {
  assert.equal(isCheckoutEntry("/cart", "/products/basil"), false);
  assert.equal(isCheckoutEntry("/checkout", "/cart"), true);
  assert.equal(isCheckoutEntry("/checkout", "/checkout"), false);
  assert.equal(isCheckoutEntry("/en-in/checkout", "/en-in/cart"), true);
  assert.equal(isCheckoutEntry("/en-in/checkout", "/en-in/checkout"), false);
  assert.equal(isCheckoutEntry("/contact", "/cart"), false);
});
test("analytics excludes private paths in all locales and strips URL secrets", () => {
  for (const path of [
    "/checkout",
    "/cart",
    "/contact",
    "/admin",
    "/account",
    "/api/orders/abc",
    "/ar-ae/checkout",
    "/en-in/contact",
    "/products/private%40email.com",
    "/products/../account",
  ])
    assert.equal(publicAnalyticsPath(path), null, path);
  assert.equal(
    publicAnalyticsPath("/products/basil?email=private@example.com#token"),
    "/products/basil",
  );
  assert.equal(
    publicAnalyticsPath("/ar-ae/products/category/herbs"),
    "/ar-ae/products/category/herbs",
  );
  assert.equal(
    parseAnalyticsConsent('{"version":1,"analytics":false,"replay":true}')
      ?.replay,
    false,
  );
  assert.equal(parseAnalyticsConsent('{"analytics":true}'), null);
  assert.equal(REPLAY_PRIVACY.maskAllInputs, true);
  assert.equal(REPLAY_PRIVACY.maskAllElementAttributes, true);
  assert.equal(REPLAY_PRIVACY.recordBody, false);
  assert.equal(REPLAY_PRIVACY.recordHeaders, false);
  assert.deepEqual(
    campaignProperties({
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "floruvi_launch",
      utm_content: "private@example.com",
      gclid: "private-id",
    }),
    { utm_source: "google", utm_medium: "cpc", utm_campaign: "floruvi_launch" },
  );
  assert.deepEqual(
    campaignProperties({
      utm_source: "private@example.com",
      utm_campaign: "customer_123",
    }),
    {},
  );
});

test("final event boundary enforces consent, redaction, replay exclusions and volume caps", async () => {
  const oldToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN = "phc_test_public_ingestion";
  const oldWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const oldDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  const location = {
    hostname: "floruvi.com",
    pathname: "/products/basil",
    search: "",
    hash: "",
  };
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { location },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { referrer: "https://google.com/?q=private@example.com" },
  });
  const event = (name: string): CaptureResult => ({
    uuid: "00000000-0000-4000-8000-000000000000",
    event: name,
    $set: { email: "private@example.com" },
    properties: {
      distinct_id: "random-anonymous-id",
      $current_url: "https://floruvi.com/?email=private@example.com",
      email: "private@example.com",
      product_slug: "basil",
      quantity: 2,
      token: "untrusted-token",
      utm_source: "google",
      utm_campaign: "private@example.com",
      $initial_referrer: "https://private.example.com/?token=secret",
    },
  });
  try {
    await setAnalyticsConsent({ analytics: false, replay: false });
    assert.equal(beforeSend(event("$pageview")), null);
    await setAnalyticsConsent({ analytics: true, replay: false });
    assert.equal(beforeSend(event("survey sent")), null);
    const safe = beforeSend(event("product_added_to_cart"));
    assert.equal(
      safe?.properties.$current_url,
      "https://floruvi.com/products/basil",
    );
    assert.equal(safe?.properties.$referring_domain, "google.com");
    assert.equal(safe?.properties.product_slug, "basil");
    assert.equal(
      safe?.properties.token,
      process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN,
    );
    assert.notEqual(safe?.properties.token, "untrusted-token");
    assert.equal(safe?.properties.utm_source, "google");
    assert.equal(safe?.properties.utm_campaign, undefined);
    assert.doesNotMatch(JSON.stringify(safe), /private@|secret|\$set/);
    assert.equal(beforeSend(event("$snapshot")), null);
    await setAnalyticsConsent({ analytics: true, replay: true });
    assert.ok(beforeSend(event("$snapshot")));
    location.search = "?token=secret";
    assert.equal(beforeSend(event("$snapshot")), null);
    location.search = "";
    location.pathname = "/ar-ae/checkout";
    assert.equal(beforeSend(event("$snapshot")), null);
    assert.equal(beforeSend(event("$pageview")), null);
    assert.ok(beforeSend(event("checkout_started")));
    location.pathname = "/products/basil";
    const exception = event("$exception");
    exception.properties.$exception_list = [
      {
        type: "Error",
        value: "private@example.com",
        stacktrace: {
          frames: [
            {
              filename: "https://floruvi.com/_next/static/test.js?token=secret",
              lineno: 5,
              vars: { otp: "123456" },
            },
          ],
        },
      },
    ];
    const safeError = beforeSend(exception);
    assert.doesNotMatch(
      JSON.stringify(safeError),
      /private@|secret|123456|vars/,
    );
    await setAnalyticsConsent({ analytics: false, replay: false });
    assert.equal(beforeSend(event("$pageview")), null);
    location.hostname = "preview.vercel.app";
    await setAnalyticsConsent({ analytics: true, replay: false });
    assert.equal(beforeSend(event("$pageview")), null);
    location.hostname = "floruvi.com";
    for (let i = 0; i < 150; i++) beforeSend(event("$pageview"));
    assert.equal(beforeSend(event("$pageview")), null);
  } finally {
    await setAnalyticsConsent({ analytics: false, replay: false });
    if (oldToken === undefined)
      delete process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
    else process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN = oldToken;
    if (oldWindow) Object.defineProperty(globalThis, "window", oldWindow);
    else Reflect.deleteProperty(globalThis, "window");
    if (oldDocument) Object.defineProperty(globalThis, "document", oldDocument);
    else Reflect.deleteProperty(globalThis, "document");
  }
});
