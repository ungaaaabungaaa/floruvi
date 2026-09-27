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
