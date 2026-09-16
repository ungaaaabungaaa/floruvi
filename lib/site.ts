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
