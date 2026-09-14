"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import harvest from "@/src/assets/home-hero/harvest.webp";
import dailyGreens from "@/src/assets/home-hero/daily-greens.webp";
import colour from "@/src/assets/home-hero/colour.webp";
import microgreens from "@/src/assets/home-hero/microgreens.webp";
import growing from "@/src/assets/home-hero/growing.webp";
import table from "@/src/assets/home-hero/table.webp";

const stories = [
  {
    name: "The harvest",
    eyebrow: "FRESHNESS WORTH GROWING",
    title: ["Fresh greens.", "Brighter days."],
    note: "A little more green. A lot more to look forward to.",
    image: harvest,
    alt: "A wooden crate filled with lettuce, kale and fresh herbs.",
    signature: "Good things\nare growing.",
  },
  {
    name: "Your everyday",
    eyebrow: "MAKE ROOM FOR FRESH",
    title: ["Small rituals.", "Fresh beginnings."],
    note: "Something crisp. Something green. Something just for you.",
    image: dailyGreens,
    alt: "Crisp green leaves being rinsed in an ivory colander.",
    signature: "A fresh start,\nevery day.",
  },
  {
    name: "More colour",
    eyebrow: "A FEAST FOR THE SENSES",
    title: ["Eat in", "full colour."],
    note: "Sweet tomatoes. Crisp leaves. A plate worth slowing down for.",
    image: colour,
    alt: "Colourful tomatoes, radishes, carrots and fresh leaves on pale stone.",
    signature: "Colour looks\ngood on you.",
  },
  {
    name: "Little wonders",
    eyebrow: "MEET THE MICROGREENS",
    title: ["Small leaves.", "Big flavour."],
    note: "The fresh finishing touch your everyday meals deserve.",
    image: microgreens,
    alt: "Fresh radish microgreens with green leaves and delicate pink stems.",
    signature: "Little leaves,\nlots to love.",
  },
  {
    name: "Growing better",
    eyebrow: "A FRESH WAY TO GROW",
    title: ["Rooted in care.", "Grown differently."],
    note: "Discover the world of hydroponics & aeroponics.",
    image: growing,
    alt: "Illustration of leafy greens growing in sunlit vertical towers.",
    signature: "A little closer\nto nature.",
  },
  {
    name: "At your table",
    eyebrow: "GOOD FOOD. GOOD COMPANY.",
    title: ["The best things", "are shared."],
    note: "Fresh ingredients. Simple meals. One more reason to gather.",
    image: table,
    alt: "A fresh colourful salad and plates set for a shared lunch.",
    signature: "Make room\nfor good food.",
  },
];

function subscribeToMotion(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

export function HomeHero() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeToMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => true,
  );
  const rotating = playing && !hovered && !focused && !reducedMotion;

  useEffect(() => {
    if (!rotating) return;
    const timer = window.setInterval(() => {
      const bounds = heroRef.current?.getBoundingClientRect();
      if (
        !document.hidden &&
        bounds &&
        bounds.bottom > 0 &&
        bounds.top < window.innerHeight
      ) {
        setActive((current) => (current + 1) % stories.length);
      }
    }, 7000);
    return () => window.clearInterval(timer);
  }, [rotating, active]);

  function select(index: number) {
    setActive((index + stories.length) % stories.length);
    setPlaying(false);
  }

  return (
    <section
      ref={heroRef}
      className="home-hero"
      aria-roledescription="carousel"
      aria-label="Freshness worth growing"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
      onTouchStart={(event) => {
        touchStart.current = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        };
      }}
      onTouchEnd={(event) => {
        if (!touchStart.current) return;
        const dx = event.changedTouches[0].clientX - touchStart.current.x;
        const dy = event.changedTouches[0].clientY - touchStart.current.y;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy))
          select(active + (dx < 0 ? 1 : -1));
        touchStart.current = null;
      }}
    >
      <h1 className="sr-only">Floruvi — Freshness worth growing</h1>
      <div
        className="home-hero-stories"
        aria-live={rotating ? "off" : "polite"}
        aria-atomic="false"
      >
        {stories.map((story, index) => (
          <div
            key={story.name}
            id={`home-story-${index}`}
            className={`home-hero-slide${index === active ? " is-active" : ""}`}
            aria-hidden={index !== active}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${stories.length}: ${story.name}`}
          >
            <Image
              src={story.image}
              alt={story.alt}
              fill
              sizes="100vw"
              preload={index === 0}
              className="home-hero-photo"
            />
            <div className="home-hero-copy">
              <span className="eyebrow">{story.eyebrow}</span>
              <h2>
                {story.title.map((line, lineIndex) => (
                  <span
                    key={line}
                    className={
                      lineIndex === story.title.length - 1
                        ? "hero-title-accent"
                        : undefined
                    }
                  >
                    {line}
                  </span>
                ))}
              </h2>
              <span className="home-hero-stroke" aria-hidden="true" />
              <p>{story.note}</p>
            </div>
            <span
              className="handwritten home-hero-signature"
              aria-hidden="true"
            >
              {story.signature}
            </span>
          </div>
        ))}
      </div>
      <div className="home-hero-bottom">
        <div className="home-hero-index" aria-hidden="true">
          <span>{String(active + 1).padStart(2, "0")}</span>
          <span className="home-hero-index-line" />
          <span>06</span>
        </div>
        <div
          className="home-hero-pagination"
          role="group"
          aria-label="Choose a story"
        >
          {stories.map((story, index) => (
            <button
              key={story.name}
              type="button"
              onClick={() => select(index)}
              aria-label={`Show story ${index + 1}: ${story.name}`}
              aria-controls={`home-story-${index}`}
              aria-current={active === index ? "true" : undefined}
            >
              <span />
              <span className="home-hero-tab-name">{story.name}</span>
            </button>
          ))}
        </div>
        <div className="home-hero-controls">
          <button
            type="button"
            onClick={() => select(active - 1)}
            aria-label="Previous story"
          >
            <ArrowLeft size={18} />
          </button>
          {!reducedMotion && (
            <button
              type="button"
              onClick={() => setPlaying(!playing)}
              aria-label={playing ? "Pause stories" : "Play stories"}
            >
              {playing ? <Pause size={15} /> : <Play size={15} />}
            </button>
          )}
          <button
            type="button"
            onClick={() => select(active + 1)}
            aria-label="Next story"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
