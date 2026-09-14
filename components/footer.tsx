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
        </div>
        <div>
          <span className="eyebrow">Learn</span>
          <Link href="/how-we-grow">How we grow</Link>
          <Link href="/recipes">Recipes</Link>
        </div>
        <div>
          <span className="eyebrow">Help</span>
          <Link href="/contact">Contact</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/privacy">Privacy</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Floruvi Farm</span>
      </div>
    </footer>
  );
}
