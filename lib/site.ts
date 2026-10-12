const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
const production =
  process.env.VERCEL_ENV === "production" &&
  process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const siteUrl =
  configured ||
  (production
    ? `https://${production}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

/** Confirmed Lark shared inboxes, 12 October 2026. */
export const contactEmails = {
  support: "support@floruvi.com",
  orders: "orders@floruvi.com",
  marketing: "marketing@floruvi.com",
  accounts: "accounts@floruvi.com",
  legal: "legal@floruvi.com",
} as const;

/** Public contact details shared by the footer and search data. */
export const business = {
  name: process.env.BUSINESS_NAME?.trim() || "Floruvi",
  email: contactEmails.support,
  phone: process.env.SUPPORT_PHONE?.trim() || "+91 9071187879",
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

/** Official profiles confirmed in the account setup chat on 12 October 2026. */
export const socialProfiles = (
  [
    [
      "instagram",
      "Instagram",
      process.env.INSTAGRAM_URL || "https://www.instagram.com/floruvi/",
    ],
    [
      "facebook",
      "Facebook",
      process.env.FACEBOOK_URL ||
        "https://www.facebook.com/profile.php?id=61595080272376",
    ],
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

/** Official business number. WhatsApp registration still needs a phone check. */
export const whatsappUrl = "https://wa.me/919071187879";
