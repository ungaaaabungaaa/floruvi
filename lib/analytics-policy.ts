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
