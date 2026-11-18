"use client";

import type { PostHog, CaptureResult } from "posthog-js";
import {
  analyticsToken,
  campaignProperties,
  publicAnalyticsPath,
  REPLAY_PRIVACY,
  type AnalyticsConsent,
} from "./analytics-policy";

export const CONSENT_KEY = "floruvi.privacy.v1";
let client: PostHog | undefined;
let loading: Promise<PostHog | undefined> | undefined;
let consent: AnalyticsConsent = { analytics: false, replay: false };
let events = 0;
let exceptions = 0;
let lastPage = "";
let internalTest = false;

export function analyticsConfigured() {
  return (
    !!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN &&
    process.env.NEXT_PUBLIC_POSTHOG_HOST === "https://us.i.posthog.com"
  );
}

function allowedHost() {
  return (
    typeof window !== "undefined" &&
    ["floruvi.com", "www.floruvi.com"].includes(window.location.hostname)
  );
}

/** Final boundary strips SDK-added URLs, person properties and arbitrary values. */
export function beforeSend(event: CaptureResult): CaptureResult | null {
  const path = publicAnalyticsPath(window.location.pathname);
  if (!allowedHost() || !consent.analytics) return null;
  if (event.event === "$snapshot") {
    return consent.replay &&
      path &&
      !window.location.search &&
      !window.location.hash
      ? event
      : null;
  }
  const allowed = [
    "$pageview",
    "product_viewed",
    "product_added_to_cart",
    "checkout_started",
    "payment_started",
    "payment_failed",
    "enquiry_submitted",
    "$exception",
    "$web_vitals",
  ];
  if (
    !allowed.includes(event.event) ||
    (!path &&
      ![
        "checkout_started",
        "payment_started",
        "payment_failed",
        "enquiry_submitted",
      ].includes(event.event))
  )
    return null;
  if (events++ >= 150 || (event.event === "$exception" && exceptions++ >= 5))
    return null;
  const source = event.properties;
  const properties: Record<string, unknown> = {
    // Required SDK transport field: this is the public ingestion token, not a secret.
    token: process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN,
    $process_person_profile: false,
    $ip: null,
    app: "floruvi",
    environment: "production",
    ...campaignProperties(source),
  };
  for (const key of [
    "distinct_id",
    "$device_id",
    "$session_id",
    "$window_id",
    "$lib",
    "$lib_version",
    "$browser",
    "$browser_version",
    "$os",
    "$os_version",
    "$device_type",
    "$screen_height",
    "$screen_width",
    "$viewport_height",
    "$viewport_width",
  ]) {
    if (["string", "number"].includes(typeof source[key]))
      properties[key] = source[key];
  }
  const publicRoute =
    path ||
    (/\/contact\/?$/.test(window.location.pathname) ? "/contact" : "/checkout");
  properties.$current_url = `https://floruvi.com${publicRoute}`;
  properties.$pathname = publicRoute;
  try {
    properties.$referring_domain = document.referrer
      ? new URL(document.referrer).hostname
      : "$direct";
  } catch {
    /* Ignore malformed referrers. */
  }
  for (const key of ["product_slug", "market", "form_type", "failure_stage"]) {
    const value = analyticsToken(source[key]);
    if (value) properties[key] = value;
  }
  if (typeof source.quantity === "number")
    properties.quantity = Math.min(
      99,
      Math.max(1, Math.round(source.quantity)),
    );
  if (source.internal_test === true || internalTest)
    properties.internal_test = true;
  if (event.event === "$web_vitals") {
    for (const name of ["LCP", "CLS", "FCP", "INP"]) {
      const key = `$web_vitals_${name}_value`;
      if (typeof source[key] === "number" && Number.isFinite(source[key]))
        properties[key] = source[key];
    }
  }
  if (event.event === "$exception") {
    // Error values can contain form data. Keep only frame locations in our static bundles.
    properties.$exception_list = Array.isArray(source.$exception_list)
      ? source.$exception_list.slice(0, 1).map((exception) => ({
          type: "StorefrontError",
          value: "Storefront error (message removed for privacy)",
          mechanism: { type: "generic", handled: true },
          stacktrace: {
            type: "raw",
            frames: (exception.stacktrace?.frames || [])
              .slice(0, 12)
              .map((frame: Record<string, unknown>) => ({
                filename:
                  typeof frame.filename === "string" &&
                  /^https:\/\/(?:www\.)?floruvi\.com\/_next\/static\//.test(
                    frame.filename,
                  )
                    ? frame.filename.split(/[?#]/, 1)[0]
                    : undefined,
                lineno:
                  typeof frame.lineno === "number" ? frame.lineno : undefined,
                colno:
                  typeof frame.colno === "number" ? frame.colno : undefined,
              })),
          },
        }))
      : [];
    properties.$exception_type = "StorefrontError";
    properties.$exception_message =
      "Storefront error (message removed for privacy)";
  }
  return {
    uuid: event.uuid,
    event: event.event,
    timestamp: event.timestamp,
    properties,
  };
}

async function getClient() {
  if (!allowedHost() || !analyticsConfigured()) return undefined;
  if (new URLSearchParams(window.location.search).get("floruvi_qa") === "1")
    internalTest = true;
  if (client) return client;
  if (loading) return loading;
  loading = import("posthog-js")
    .then(({ default: posthog }) => {
      if (!consent.analytics) return undefined;
      client = posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        ui_host: "https://us.posthog.com",
        defaults: "2026-08-30",
        persistence: consent.analytics ? "localStorage" : "memory",
        save_campaign_params: false,
        save_referrer: false,
        person_profiles: "never",
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        capture_dead_clicks: false,
        capture_exceptions: false,
        capture_performance: false,
        disable_session_recording: true,
        enable_recording_console_log: false,
        disable_surveys: true,
        disable_surveys_automatic_display: true,
        advanced_disable_feature_flags: true,
        capture_heatmaps: false,
        mask_all_text: true,
        mask_all_element_attributes: true,
        session_recording: {
          ...REPLAY_PRIVACY,
          maskCapturedNetworkRequestFn: () => null,
        },
        before_send: beforeSend,
      });
      client?.register(
        campaignProperties(
          Object.fromEntries(new URLSearchParams(window.location.search)),
        ),
      );
      return client;
    })
    .catch(() => undefined)
    .finally(() => {
      loading = undefined;
    });
  return loading;
}

export async function setAnalyticsConsent(next: AnalyticsConsent) {
  consent = {
    analytics: next.analytics,
    replay: next.analytics && next.replay,
  };
  if (!consent.analytics) {
    client?.stopSessionRecording();
    client?.opt_out_capturing();
    client?.set_config({ persistence: "memory" });
    client?.reset();
    lastPage = "";
    return;
  }
  const sdk = await getClient();
  if (!consent.analytics) return;
  sdk?.set_config({ persistence: "localStorage" });
  sdk?.opt_in_capturing({ captureEventName: false });
  pageViewed();
}

export function stopRecording() {
  client?.stopSessionRecording();
}

export function pageViewed() {
  if (!consent.analytics || !client) return;
  const path = publicAnalyticsPath(window.location.pathname);
  // Stop synchronously before private form navigation; the route check is a second boundary.
  if (
    !path ||
    !consent.replay ||
    window.location.search ||
    window.location.hash
  )
    client.stopSessionRecording();
  else client.startSessionRecording();
  if (path && path !== lastPage) {
    lastPage = path;
    client.capture("$pageview");
    const product = path.match(/\/products\/([a-z0-9-]+)\/?$/)?.[1];
    if (product) client.capture("product_viewed", { product_slug: product });
  }
  if (!path) {
    if (
      /\/(?:checkout)\/?$/.test(window.location.pathname) &&
      lastPage !== "checkout"
    )
      client.capture("checkout_started");
    lastPage = "checkout";
  }
}

export function trackStorefront(
  event:
    | "product_added_to_cart"
    | "checkout_started"
    | "payment_started"
    | "payment_failed"
    | "enquiry_submitted",
  properties: Record<string, string | number> = {},
) {
  if (consent.analytics) client?.capture(event, properties);
}

export function captureStorefrontError(error: unknown) {
  if (consent.analytics && publicAnalyticsPath(window.location.pathname))
    client?.captureException(error);
}

/** Stable callback for Next.js; never send DOM attribution or performance entries. */
export function reportStorefrontVital(metric: { name: string; value: number }) {
  if (
    consent.analytics &&
    ["LCP", "CLS", "FCP", "INP"].includes(metric.name) &&
    Number.isFinite(metric.value)
  ) {
    client?.capture("$web_vitals", {
      [`$web_vitals_${metric.name}_value`]: metric.value,
    });
  }
}
