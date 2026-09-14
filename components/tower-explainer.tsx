"use client";
import { useState } from "react";
import Image from "next/image";
import { ArrowDown, Droplets, Sprout, Waves, ArrowUp } from "lucide-react";
import cutaway from "@/src/assets/pineapple-cutaway.png";
const parts = [
  {
    title: "Plant pockets",
    icon: Sprout,
    text: "Small cups support each plant. Its roots extend into the tower.",
    position: "pockets",
  },
  {
    title: "Water up",
    icon: ArrowUp,
    text: "A pump moves nutrient-rich water from the base into the central supply pipe.",
    position: "supply",
  },
  {
    title: "Roots fed",
    icon: Droplets,
    text: "Nozzles spray the suspended roots with water & dissolved nutrients. Air surrounds the roots.",
    position: "roots",
  },
  {
    title: "Water returns",
    icon: Waves,
    text: "Unused solution drains back to the reservoir for recirculation.",
    position: "reservoir",
  },
];
export function TowerExplainer() {
  const [active, setActive] = useState(0);
  return (
    <div className="tower-explainer">
      <div className="tower-cutaway">
        <Image
          src={cutaway}
          alt="Cutaway of a pineapple-shaped aeroponic tower showing suspended roots, spray nozzles, central pipe & reservoir"
          fill
          sizes="(max-width: 800px) 100vw, 600px"
        />
        {parts.map((part, index) => (
          <button
            key={part.title}
            className={`tower-hotspot hotspot-${part.position}`}
            aria-label={`Explore ${part.title}`}
            aria-pressed={active === index}
            onClick={() => setActive(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>
      <div className="tower-parts">
        <p className="tower-small-label">
          FOLLOW THE FLOW <ArrowDown size={15} />
        </p>
        {parts.map(({ title, icon: Icon, text }, index) => (
          <div
            className={`tower-part ${active === index ? "is-active" : ""}`}
            key={title}
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
        <span className="tower-cycle-note">One loop. Water keeps moving.</span>
      </div>
    </div>
  );
}
