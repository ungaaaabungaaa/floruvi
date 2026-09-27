import type { NextConfig } from "next";

const config: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  // Old addresses of removed pages keep their visitors and search signals.
  // /wholesale stays temporary: a wholesale page may return.
  async redirects() {
    const version = "/:version([a-z]{2}-[a-z]{2})";
    return [
      { source: "/wholesale", destination: "/contact", permanent: false },
      { source: `${version}/wholesale`, destination: "/:version/contact", permanent: false },
      { source: "/real-talk", destination: "/contact", permanent: true },
      { source: `${version}/real-talk`, destination: "/:version/contact", permanent: true },
      { source: "/delivery", destination: "/faq#delivery", permanent: true },
      { source: "/health", destination: "/products", permanent: true },
      { source: "/our-farm", destination: "/how-we-grow", permanent: true },
      { source: "/sustainability", destination: "/how-we-grow", permanent: true },
      { source: "/categories", destination: "/products", permanent: true },
      { source: "/categories/:slug", destination: "/products?category=:slug", permanent: true },
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
    ];
  },
};
export default config;
