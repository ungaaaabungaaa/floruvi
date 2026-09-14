import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { MapPin, Sprout, PackageCheck, ArrowRight } from "lucide-react";
import greens from "@/src/assets/delivery-greens.png";
import { Button } from "@/components/ui/button";
export const metadata: Metadata = {
  title: "Delivery & availability",
  alternates: { canonical: "/delivery" },
};
export default function Delivery() {
  return (
    <div className="page-width section">
      <div className="about-hero">
        <div className="page-heading">
          <span className="eyebrow">FROM THE FARM TO YOUR TABLE</span>
          <h1>Delivery.</h1>
          <p>Send your city and postcode. We’ll confirm coverage and fees.</p>
          <Button asChild>
            <Link href="/products">
              Build your basket <ArrowRight size={17} />
            </Link>
          </Button>
        </div>
        <div className="about-art">
          <Image
            src={greens}
            alt="Illustrative box of fresh greens, ready to be packed"
            fill
            sizes="(max-width: 800px) 100vw, 50vw"
            preload
          />
        </div>
      </div>
      <div className="delivery-grid">
        {[
          {
            icon: MapPin,
            title: "Check your area",
            body: "Send your city and postcode to check coverage.",
          },
          {
            icon: Sprout,
            title: "Plan for the harvest",
            body: "Ask us for the next harvest date.",
          },
          {
            icon: PackageCheck,
            title: "Know what to expect",
            body: "Your quote will include pack sizes, fees, and delivery dates.",
          },
        ].map(({ icon: Icon, title, body }) => (
          <article key={title}>
            <Icon size={26} strokeWidth={1.3} />
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </div>
      <div className="about-cta">
        <div>
          <span className="eyebrow">FOR CAFÉS, RESTAURANTS & RETAIL</span>
          <h2>Need regular deliveries?</h2>
        </div>
        <Button asChild>
          <Link href="/wholesale">
            Business enquiries <ArrowRight size={17} />
          </Link>
        </Button>
      </div>
    </div>
  );
}
