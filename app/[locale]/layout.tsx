import type { Metadata } from "next";
import { SiteMotion } from "@/components/site-motion";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { I18nProvider } from "@/components/i18n/provider";
import { CartPill } from "@/components/cart-pill";
import { cartThumbnails } from "@/lib/cart-thumbnails";
import { siteUrl } from "@/lib/site";
import { getI18n } from "@/lib/i18n/server";
import { localizePath, locales, marketCodes, markets } from "@/lib/i18n/config";
import { countryName, fill } from "@/lib/i18n/format";
import { absoluteUrl, jsonLd } from "@/lib/seo";
import mark from "@/src/assets/floruvi-mark.png";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const { locale, messages } = await getI18n();
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: messages.meta.defaultTitle,
      template: messages.meta.titleTemplate,
    },
    description: locale.domestic
      ? messages.meta.description
      : fill(messages.meta.descriptionExport, { country: locale.countryName }),
    applicationName: messages.meta.siteName,
    formatDetection: { telephone: false },
  };
}

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const { locale, messages } = await getI18n();
  const organization = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: messages.meta.siteName,
        alternateName: "Floruvi",
        url: siteUrl,
        logo: absoluteUrl(mark.src),
        slogan: messages.common.brand.tagline,
        description: messages.meta.description,
        areaServed: marketCodes.map((market) => ({
          "@type": "Country",
          name: countryName(markets[market].country, "en"),
        })),
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website-${locale.locale}`,
        name: messages.meta.siteName,
        url: absoluteUrl(localizePath(locale.locale, "/")),
        inLanguage: locale.tag,
        publisher: { "@id": `${siteUrl}/#organization` },
      },
    ],
  };
  return (
    <html lang={locale.tag} dir={locale.dir} data-scroll-behavior="smooth">
      <body>
        <I18nProvider locale={locale} common={messages.common}>
          <a className="skip-link" href="#main">
            {messages.common.skipToContent}
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <CartPill thumbnails={cartThumbnails} />
        </I18nProvider>
        <SiteMotion />
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(organization)} />
      </body>
    </html>
  );
}
