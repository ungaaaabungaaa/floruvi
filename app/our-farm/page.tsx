import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, Sprout, Droplets, HeartHandshake } from "lucide-react";
import Image from "next/image";
import towers from "@/src/assets/growing-towers.png";
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
          <h1>
            Good food.
            <br />
            Fresh thinking.
            <br />
            <em>Room to grow.</em>
          </h1>
          <p>
            We’re building a simple connection between the farm and the people
            who cook. For a home, a café, or a whole kitchen team.
          </p>
        </div>
        <div className="about-art">
          <Image
            src={towers}
            alt="An illustrative hydroponic tower with leafy greens"
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
            body: "Hydroponics supplies plant roots with water and nutrients without conventional soil. Aeroponics delivers a nutrient mist to suspended roots. Each crop needs the right system.",
          },
          {
            icon: Sprout,
            title: "Start with the right crop",
            body: "Our catalogue brings together familiar soilless crops and specialist possibilities. A listing is a starting point for a conversation, not a promise that every crop is in harvest.",
          },
          {
            icon: HeartHandshake,
            title: "Keep the conversation easy",
            body: "Browse freely. Tell us about the produce, quantity, and location you have in mind. We can then confirm what is available and what comes next.",
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
        <h2>What would you like to see growing?</h2>
        <Button asChild>
          <Link href="/contact">
            Tell us about it <ArrowUpRight size={18} />
          </Link>
        </Button>
      </div>
    </div>
  );
}
