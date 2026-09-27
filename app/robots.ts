import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
export default function robots(): MetadataRoute.Robots {
  const production =
    process.env.VERCEL_ENV === "production" && !siteUrl.includes("localhost");
  return {
    rules: production
      ? // Admin is not listed: robots.txt is public, and naming it would point scrapers there.
        // Admin responses send X-Robots-Tag: noindex instead (next.config.ts).
        { userAgent: "*", allow: "/", disallow: "/api/" }
      : { userAgent: "*", disallow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
