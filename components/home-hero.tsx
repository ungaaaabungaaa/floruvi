"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, Pause, Play, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useI18n } from "./i18n/provider";
import { Suspense, useEffect, useRef, useState, useSyncExternalStore } from "react";
import harvest from "@/src/assets/home-hero/harvest.webp";
import dailyGreens from "@/src/assets/home-hero/daily-greens.webp";
import colour from "@/src/assets/home-hero/colour.webp";
import microgreens from "@/src/assets/home-hero/microgreens.webp";
import growing from "@/src/assets/home-hero/growing.webp";
import table from "@/src/assets/home-hero/table.webp";
import type { Messages } from "@/lib/i18n/messages";
import type { ShopCategory } from "@/lib/storefront";
import { fill } from "@/lib/i18n/format";
import { HomeHeroChips } from "./home-hero-chips";

const storyImages = [harvest, dailyGreens, colour, microgreens, growing, table];

function subscribeToMotion(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

export function HomeHero({
  labels,
  search,
  categories,
}: {
  labels: Messages["home"];
  search: Messages["shop"];
  categories: ShopCategory[];
}) {
  const router = useRouter();
  const { href } = useI18n();
  const [query, setQuery] = useState("");
  const stories = labels.stories.map((story, index) => ({
    ...story,
    image: storyImages[index],
  }));
  const total = stories.length;
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
        setActive((current) => (current + 1) % total);
      }
    }, 7000);
    return () => window.clearInterval(timer);
  }, [rotating, active, total]);

  function select(index: number) {
    setActive((index + stories.length) % stories.length);
    setPlaying(false);
  }

  return (
    <section
      ref={heroRef}
      className="home-hero"
      aria-roledescription="carousel"
      aria-label={labels.carousel}
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
      <h1 className="sr-only">{labels.srTitle}</h1>
      <div
        className="home-hero-stories"
        aria-live={rotating ? "off" : "polite"}
        aria-atomic="false"
      >
        {stories.map((story, index) => (
          <div
            key={index}
            id={`home-story-${index}`}
            className={`home-hero-slide${index === active ? " is-active" : ""}`}
            aria-hidden={index !== active}
            role="group"
            aria-roledescription="slide"
            aria-label={fill(labels.slide, {
              index: index + 1,
              total: stories.length,
              name: story.name,
            })}
          >
            <Image
              src={story.image}
              alt={story.alt}
              fill
              sizes="100vw"
              preload={index === 0}
              className="home-hero-photo"
            />
          </div>
        ))}
      </div>
      <span className="handwritten home-hero-signature" aria-hidden="true">
        {stories[active].signature}
      </span>
      <div className="home-hero-content">
        <div className="home-hero-copy">
          <h2>
            {stories[active].title.map((line, lineIndex) => (
              <span
                key={lineIndex}
                className={
                  lineIndex === stories[active].title.length - 1
                    ? "hero-title-accent"
                    : undefined
                }
              >
                {line}
              </span>
            ))}
          </h2>
          <p>{stories[active].note}</p>
        </div>
        <div className="home-hero-actions">
          <form
            className="recipe-search home-hero-search"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              const term = query.trim();
              router.push(href(term ? `/products?q=${encodeURIComponent(term)}` : "/products"));
            }}
          >
            <Search size={19} aria-hidden="true" />
            <label className="sr-only" htmlFor="home-search">
              {search.searchLabel}
            </label>
            <input
              id="home-search"
              type="search"
              name="q"
              maxLength={100}
              autoComplete="off"
              placeholder={search.searchPlaceholder}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button
              type="submit"
              className="button button-primary home-hero-search-submit"
              aria-label={labels.searchAction}
            >
              <Search size={17} aria-hidden="true" className="home-hero-search-submit-icon" />
              <span>{labels.searchAction}</span>
            </button>
          </form>
        </div>
        <Suspense fallback={null}>
          <HomeHeroChips categories={categories} labels={search} />
        </Suspense>
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
          aria-label={labels.chooseStory}
        >
          {stories.map((story, index) => (
            <button
              key={index}
              type="button"
              onClick={() => select(index)}
              aria-label={fill(labels.showStory, { index: index + 1, name: story.name })}
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
            aria-label={labels.previous}
          >
            <ArrowLeft size={18} />
          </button>
          {!reducedMotion && (
            <button
              type="button"
              onClick={() => setPlaying(!playing)}
              aria-label={playing ? labels.pause : labels.play}
            >
              {playing ? <Pause size={15} /> : <Play size={15} />}
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
    </section>
  );
}
