import type { NextConfig } from "next";

// One public address for search engines: other hosts of the live site redirect to it.
const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
const aliasHosts = site
  ? ["floruvi.vercel.app", "www.floruvi.com"].filter((host) => new URL(site).host !== host)
  : [];

const config: NextConfig = {
  devIndicators: false,
  // Do not advertise the framework in every response.
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  // Old addresses of removed pages keep their visitors and search signals.
  // /wholesale stays temporary: a wholesale page may return.
  async redirects() {
    const version = "/:version([a-z]{2}-[a-z]{2})";
    return [
      ...aliasHosts.map((host) => ({
        source: "/:path*",
        has: [{ type: "host" as const, value: host }],
        destination: `${site}/:path*`,
        permanent: true,
      })),
      { source: "/wholesale", destination: "/contact", permanent: false },
      { source: `${version}/wholesale`, destination: "/:version/contact", permanent: false },
      { source: "/real-talk", destination: "/contact", permanent: true },
      { source: `${version}/real-talk`, destination: "/:version/contact", permanent: true },
      { source: "/delivery", destination: "/faq#delivery", permanent: true },
      { source: "/health", destination: "/products", permanent: true },
      { source: "/our-farm", destination: "/how-we-grow", permanent: true },
      { source: "/sustainability", destination: "/how-we-grow", permanent: true },
      { source: "/categories", destination: "/products", permanent: true },
      { source: "/categories/:slug", destination: "/products/category/:slug", permanent: true },
      { source: `${version}/categories`, destination: "/:version/products", permanent: true },
      { source: `${version}/categories/:slug`, destination: "/:version/products/category/:slug", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      // Owner pages and APIs never enter search results, archives or AI answers.
      ...["/admin", "/admin/:path*", "/api/:path*"].map((source) => ({
        source,
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" }],
      })),
      // Owner pages show customer details: no browser, proxy or back-button copy,
      // and no admin address in the Referer of any outgoing request.
      ...["/admin", "/admin/:path*"].map((source) => ({
        source,
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      })),
    ];
  },
};
export default config;
