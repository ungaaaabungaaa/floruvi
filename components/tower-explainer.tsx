"use client";
import { useState } from "react";
import Image from "next/image";
import { ArrowDown, Droplets, Sprout, Waves, ArrowUp } from "lucide-react";
import cutaway from "@/src/assets/pineapple-cutaway.png";
import type { Messages } from "@/lib/i18n/messages";
import { fill } from "@/lib/i18n/format";
const partStyles = [
  { icon: Sprout, position: "pockets" },
  { icon: ArrowUp, position: "supply" },
  { icon: Droplets, position: "roots" },
  { icon: Waves, position: "reservoir" },
];
export function TowerExplainer({
  labels,
}: {
  labels: Messages["howWeGrow"]["tower"];
}) {
  const [active, setActive] = useState(0);
  const parts = partStyles.map((style, index) => ({
    ...style,
    ...labels.parts[index],
  }));
  return (
    <div className="tower-explainer">
      <div className="tower-cutaway">
        <Image
          src={cutaway}
          alt={labels.cutawayAlt}
          fill
          sizes="(max-width: 800px) 100vw, 600px"
        />
        {parts.map((part, index) => (
          <button
            key={part.position}
            className={`tower-hotspot hotspot-${part.position}`}
            aria-label={fill(labels.explore, { title: part.title })}
            aria-pressed={active === index}
            onClick={() => setActive(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>
      <div className="tower-parts">
        <p className="tower-small-label">
          {labels.follow} <ArrowDown size={15} />
        </p>
        {parts.map(({ title, icon: Icon, text, position }, index) => (
          <div
            className={`tower-part ${active === index ? "is-active" : ""}`}
            key={position}
          >
            <button
              onClick={() => setActive(index)}
              aria-expanded={active === index}
              aria-controls={`tower-part-${index}`}
            >
              <span className="tower-part-number">0{index + 1}</span>
              <Icon size={22} strokeWidth={1.5} />
              <span>{title}</span>
            </button>
            <p id={`tower-part-${index}`} hidden={active !== index}>
              {text}
            </p>
          </div>
        ))}
        <span className="tower-cycle-note">{labels.cycle}</span>
      </div>
    </div>
  );
}
