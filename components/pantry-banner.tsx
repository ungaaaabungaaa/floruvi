"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Messages } from "@/lib/i18n/messages";
import baking from "@/src/assets/pantry-banners/baking.webp";
import seasonings from "@/src/assets/pantry-banners/seasonings.webp";
import vegetables from "@/src/assets/pantry-banners/vegetables.webp";
import "./pantry-banner.css";

const images = [baking, seasonings, vegetables];
function subscribe(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

export function PantryBanner({ labels }: { labels: Messages["home"] }) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const reduced = useSyncExternalStore(
    subscribe,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => true,
  );
  const rotating = playing && !hovered && !focused && !reduced;
  useEffect(() => {
    if (!rotating) return;
    const timer = window.setInterval(() => {
      const bounds = container.current?.getBoundingClientRect();
      if (
        !document.hidden &&
        bounds &&
        bounds.bottom > 0 &&
        bounds.top < window.innerHeight
      )
        setActive((index) => (index + 1) % images.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [rotating]);
  function select(index: number) {
    setActive((index + images.length) % images.length);
    setPlaying(false);
  }
  return (
    <div
      ref={container}
      className="pantry-story"
      aria-roledescription="carousel"
      aria-label={labels.pantry.title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      <div className="pantry-banner">
        <Image
          src={images[active]}
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
      <div className="pantry-controls">
        <span aria-live={rotating ? "off" : "polite"} aria-atomic="true">
          {active + 1} / {images.length}
        </span>
        <div>
          <button
            type="button"
            onClick={() => select(active - 1)}
            aria-label={labels.previous}
          >
            <ArrowLeft size={18} />
          </button>
          {!reduced && (
            <button
              type="button"
              onClick={() => setPlaying(!playing)}
              aria-label={playing ? labels.pause : labels.play}
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
          )}
          <button
            type="button"
            onClick={() => select(active + 1)}
            aria-label={labels.next}
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
