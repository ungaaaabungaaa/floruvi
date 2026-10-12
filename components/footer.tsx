import Link from "@/components/i18n/link";
import { fill } from "@/lib/i18n/format";
import { getMessages } from "@/lib/i18n/server";
import { publishedCategories } from "@/lib/category-pages";
import { getShop } from "@/lib/storefront";
import { SocialLinks } from "./social-links";
import { Brand } from "./brand";

export async function Footer() {
  const [{ footer }, shop] = await Promise.all([
    getMessages().then((messages) => messages.common),
    // The footer still renders if the catalogue is unavailable.
    getShop().catch(() => null),
  ]);
  const categories = shop ? publishedCategories(shop) : [];
  const copyright = fill(footer.copyright, { year: new Date().getFullYear() });
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <Brand />
        <div>
          <span className="eyebrow">{footer.shop}</span>
          <Link href="/products">{footer.vegetables}</Link>
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/products/category/${category.slug}`}
            >
              {category.name}
            </Link>
          ))}
          <Link href="/boxes">{footer.boxes}</Link>
        </div>
        <div>
          <span className="eyebrow">{footer.learn}</span>
          <Link href="/how-we-grow">{footer.howWeGrow}</Link>
          <Link href="/recipes">{footer.recipes}</Link>
        </div>
        <div>
          <span className="eyebrow">{footer.help}</span>
          <Link href="/contact">{footer.contact}</Link>
          <Link href="/faq">{footer.faq}</Link>
          <Link href="/privacy">{footer.privacy}</Link>
          <Link href="/terms">{footer.terms}</Link>
          <Link href="/refunds">{footer.refunds}</Link>
          <Link href="/shipping">{footer.shipping}</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>{copyright}</span>
        <div className="footer-contact">
          <div className="footer-icon-row">
            <SocialLinks iconsOnly />
          </div>
        </div>
      </div>
      <span className="footer-copyright-mobile">{copyright}</span>
    </footer>
  );
}
