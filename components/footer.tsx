import Link from "next/link";
import { Brand } from "./brand";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <Brand />
        <div>
          <span className="eyebrow">Shop</span>
          <Link href="/products">Vegetables</Link>
          <Link href="/boxes">Box subscriptions</Link>
          <Link href="/categories">Categories</Link>
          <Link href="/wholesale">Business enquiries</Link>
        </div>
        <div>
          <span className="eyebrow">Learn</span>
          <Link href="/our-farm">Our farm</Link>
          <Link href="/how-we-grow">How we grow</Link>
          <Link href="/recipes">Recipes</Link>
          <Link href="/health">Nutrition</Link>
          <Link href="/sustainability">Sustainability</Link>
        </div>
        <div>
          <span className="eyebrow">Help</span>
          <Link href="/contact">Contact</Link>
          <Link href="/delivery">Delivery</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/privacy">Privacy</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Floruvi Farm</span>
        <span>Hydroponics · Aeroponics</span>
      </div>
    </footer>
  );
}
