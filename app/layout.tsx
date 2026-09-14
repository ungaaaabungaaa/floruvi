import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { siteUrl } from "@/lib/site";
import hero from "@/src/assets/hero-lifestyle.png";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Floruvi — Freshness worth growing",
    template: "%s | Floruvi Farm",
  },
  description:
    "Explore leafy greens, herbs, microgreens and more. Fresh produce for your home or business, delivered across India.",
  openGraph: {
    type: "website",
    siteName: "Floruvi Farm",
    locale: "en_IN",
    images: [
      {
        url: hero.src,
        width: hero.width,
        height: hero.height,
        alt: "Floruvi — Freshness worth growing",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
