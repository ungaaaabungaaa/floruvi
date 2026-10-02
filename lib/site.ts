const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
const production =
  process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const siteUrl =
  configured ||
  (production
    ? `https://${production}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

/**
 * Business contact details for the Contact page and footer. Razorpay's website
 * review needs them. SUPPORT_EMAIL, SUPPORT_PHONE and BUSINESS_ADDRESS are set in
 * Vercel; each line shows only when it is set. The name is Floruvi (owner, 28 September 2026).
 */
export const business = {
  name: process.env.BUSINESS_NAME?.trim() || "Floruvi",
  email: process.env.SUPPORT_EMAIL?.trim() || null,
  phone: process.env.SUPPORT_PHONE?.trim() || null,
  address: process.env.BUSINESS_ADDRESS?.trim() || null,
};

/** Only a full https:// address is used, so a typo cannot publish a broken link. */
function httpsUrl(value: string | undefined) {
  try {
    const url = new URL(value?.trim() ?? "");
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/**
 * Official social profiles, set in Vercel when the accounts exist. Each one shows
 * in the footer and in the Organization search data (sameAs) only when it is set.
 */
export const socialProfiles = (
  [
    ["instagram", "Instagram", process.env.INSTAGRAM_URL],
    ["facebook", "Facebook", process.env.FACEBOOK_URL],
    ["youtube", "YouTube", process.env.YOUTUBE_URL],
    ["linkedin", "LinkedIn", process.env.LINKEDIN_URL],
    ["x", "X", process.env.X_URL],
  ] as const
).flatMap(([key, label, value]) => {
  const url = httpsUrl(value);
  return url ? [{ key, label, url }] : [];
});

/** Search Console and Bing Webmaster HTML-tag verification codes (optional). */
export const searchVerification = {
  google: process.env.GOOGLE_SITE_VERIFICATION?.trim() || null,
  bing: process.env.BING_SITE_VERIFICATION?.trim() || null,
};
