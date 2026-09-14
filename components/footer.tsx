import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Brand } from "./brand";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div>
          <Brand />
          <p>
            A fresh way to think about
            <br />
            what goes on your plate.
          </p>
        </div>
        <div>
          <span className="eyebrow">Explore</span>
          <Link href="/products">Our produce</Link>
          <Link href="/categories">Crop categories</Link>
          <Link href="/our-farm">Our story</Link>
          <Link href="/how-we-grow">How we grow</Link>
          <Link href="/sustainability">Sustainability</Link>
        </div>
        <div>
          <span className="eyebrow">Grow with us</span>
          <Link href="/wholesale">
            Business enquiries <ArrowUpRight size={13} />
          </Link>
          <Link href="/contact">Personal enquiries</Link>
          <Link href="/health">Health & nutrition</Link>
          <Link href="/recipes">Recipes</Link>
          <Link href="/real-talk">Real talk</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/delivery">Delivery information</Link>
          <Link href="/faq">Questions & answers</Link>
        </div>
        <div className="footer-note">
          <span className="eyebrow">A note from the farm</span>
          <p>
            Looking for something specific?
            <br />
            Tell us what you have in mind.
          </p>
          <Link className="text-link" href="/contact">
            Start a conversation <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Floruvi Farm</span>
        <span>Freshness worth growing</span>
        <span>Hydroponics · Aeroponics</span>
      </div>
    </footer>
  );
}
