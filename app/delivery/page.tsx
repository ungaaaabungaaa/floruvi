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
          <h1>
            Freshness.
            <br />
            With a little
            <br />
            <em>forward planning.</em>
          </h1>
          <p>
            Tell us what you would like and where you need it. We will confirm
            the produce, pack sizes, price, and delivery details before you
            place an order.
          </p>
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
            body: "Delivery coverage is being finalised. Include your city and postcode in your request so we can check your location.",
          },
          {
            icon: Sprout,
            title: "Plan for the harvest",
            body: "The catalogue shows crops that can suit soilless growing. It does not show live stock. Ask us to confirm the next available harvest.",
          },
          {
            icon: PackageCheck,
            title: "Know what to expect",
            body: "Pack sizes, delivery charges, minimum quantities, and delivery dates will be confirmed with your quote. No payment is collected on this site yet.",
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
          <h2>A regular supply starts with a conversation.</h2>
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
