import Image from "next/image";
import type { Messages } from "@/lib/i18n/messages";
import seasonings from "@/src/assets/pantry-banners/seasonings.webp";
import "./pantry-banner.css";

export function PantryBanner({ labels }: { labels: Messages["home"] }) {
  return (
    <div className="pantry-banner">
      <Image
        src={seasonings}
        alt={labels.pantry.alt}
        fill
        sizes="(max-width: 800px) 100vw, 1328px"
      />
      <div className="pantry-banner-copy">
        <span className="eyebrow">{labels.pantry.eyebrow}</span>
        <h2 id="home-pantry-title">{labels.pantry.title}</h2>
        <p>{labels.pantry.note}</p>
      </div>
    </div>
  );
}
