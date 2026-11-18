/** Public catalogue paths only. Never send search strings, hashes, or private IDs. */
export function publicAnalyticsPath(path: string): string | null {
  const clean = path.split(/[?#]/, 1)[0];
  const route = clean.replace(/^\/[a-z]{2}-[a-z]{2}(?=\/|$)/, "") || "/";
  if (
    !/^\/(?:$|products(?:\/category\/[a-z0-9-]+|\/[a-z0-9-]+)?\/?$|boxes\/?$|recipes(?:\/[a-z0-9-]+)?\/?$|(?:how-we-grow|nutrition|faq|privacy|terms|refunds|shipping)\/?$)/.test(
      route,
    )
  )
    return null;
  return clean;
}

/** Fixed token vocabulary prevents free text, contact details and arbitrary IDs. */
export function analyticsToken(value: unknown): string | undefined {
  return typeof value === "string" && /^[a-z0-9][a-z0-9_-]{0,79}$/i.test(value)
    ? value
    : undefined;
}

export type AnalyticsConsent = { analytics: boolean; replay: boolean };

/** Global opt-in: country, shop market and language cannot grant permission. */
export function resolveAnalyticsConsent(
  saved: AnalyticsConsent | null,
  signals: {
    doNotTrack?: string | null;
    globalPrivacyControl?: boolean;
  } = {},
): AnalyticsConsent | null {
  if (signals.doNotTrack === "1" || signals.globalPrivacyControl === true)
    return { analytics: false, replay: false };
  // Preserve the first-visit state so the inline notice can offer a choice.
  if (!saved) return null;
  return {
    analytics: saved.analytics === true,
    replay: saved.analytics === true && saved.replay === true,
  };
}

export function isCheckoutEntry(path: string, previousPath: string) {
  return /\/checkout\/?$/.test(path) && path !== previousPath;
}

/** Only published campaign labels. Expand this list with the ads setup, never with visitor data. */
export function campaignProperties(values: Record<string, unknown>) {
  const safe: Record<string, string> = {};
  const vocabulary: Record<string, readonly string[]> = {
    utm_source: [
      "google",
      "meta",
      "facebook",
      "instagram",
      "whatsapp",
      "pinterest",
    ],
    utm_medium: [
      "cpc",
      "paid_social",
      "social",
      "organic",
      "email",
      "referral",
    ],
    utm_campaign: ["floruvi_launch"],
  };
  for (const [key, allowed] of Object.entries(vocabulary)) {
    const value = values[key];
    if (typeof value === "string" && allowed.includes(value)) safe[key] = value;
  }
  return safe;
}
export function parseAnalyticsConsent(
  raw: string | null,
): AnalyticsConsent | null {
  try {
    const value = JSON.parse(raw || "null");
    if (
      value?.version !== 1 ||
      typeof value.analytics !== "boolean" ||
      typeof value.replay !== "boolean"
    )
      return null;
    return {
      analytics: value.analytics,
      replay: value.analytics && value.replay,
    };
  } catch {
    return null;
  }
}

export const REPLAY_PRIVACY = {
  maskAllInputs: true,
  maskTextSelector: "*",
  maskAllElementAttributes: true,
  blockSelector:
    "form, input, textarea, select, iframe, video, canvas, [data-private], .ph-no-capture",
  recordHeaders: false,
  recordBody: false,
  recordCrossOriginIframes: false,
  captureJsonLd: false,
  captureCanvas: { recordCanvas: false },
  sampleRate: 0.1,
  minimumDurationMilliseconds: 10000,
  strictMinimumDuration: true,
} as const;
