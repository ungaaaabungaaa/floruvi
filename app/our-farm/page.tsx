import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, Sprout, Droplets, HeartHandshake } from "lucide-react";
import Image from "next/image";
import towers from "@/src/assets/story-seedling.png";
import { Button } from "@/components/ui/button";
export const metadata: Metadata = {
  title: "Our approach",
  alternates: { canonical: "/our-farm" },
};
export default function OurFarm() {
  return (
    <div className="page-width section">
      <div className="about-hero">
        <div className="page-heading">
          <span className="eyebrow">THE IDEA BEHIND FLORUVI</span>
          <h1>Our farm.</h1>
          <p>Vegetables for homes, cafés, and restaurants.</p>
        </div>
        <div className="about-art">
          <Image
            src={towers}
            alt="grower’s hands holding a young lettuce plant"
            fill
            sizes="(max-width: 800px) 100vw, 50vw"
            preload
          />
        </div>
      </div>
      <div className="approach-grid">
        {[
          {
            icon: Droplets,
            title: "Explore soilless growing",
            body: "Hydroponics uses nutrient-rich water. Aeroponics uses a nutrient mist.",
          },
          {
            icon: Sprout,
            title: "Start with the right crop",
            body: "Browse the catalogue, then ask us what is in harvest.",
          },
          {
            icon: HeartHandshake,
            title: "Keep the conversation easy",
            body: "Send your crop list, quantity, and delivery area.",
          },
        ].map(({ icon: Icon, title, body }) => (
          <article key={title}>
            <Icon size={29} strokeWidth={1.3} />
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </div>
      <div className="about-cta">
        <h2>Ask about the farm.</h2>
        <Button asChild>
          <Link href="/contact">
            Tell us about it <ArrowUpRight size={18} />
          </Link>
        </Button>
      </div>
    </div>
  );
}
