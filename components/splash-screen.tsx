"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import mark from "@/src/assets/floruvi-mark.webp";
import "./splash-screen.css";

/** Replays on a full refresh, not on client navigation. */
export function SplashScreen({ tagline }: { tagline: string }) {
  const overlay = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let cancelled = false;
    const reveal = () => {
      if (!cancelled && overlay.current) overlay.current.dataset.ready = "true";
    };
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // Only the first visible page image is needed for the reveal.
    // Other images keep their normal lazy loading and public data stays server-rendered.
    const image = document.querySelector<HTMLImageElement>("#main img");
    let entranceTimer: ReturnType<typeof setTimeout>;
    const entrance = new Promise<void>((resolve) => {
      entranceTimer = setTimeout(resolve, reduced ? 0 : 2800);
    });
    const timeout = setTimeout(reveal, 4500);
    Promise.all([
      entrance,
      image?.decode().catch(() => {}),
      document.fonts.ready,
    ]).then(reveal);
    const skip = (event: KeyboardEvent) => {
      if (event.key === "Tab" || event.key === "Escape") reveal();
    };
    window.addEventListener("keydown", skip);
    return () => {
      cancelled = true;
      clearTimeout(entranceTimer);
      clearTimeout(timeout);
      window.removeEventListener("keydown", skip);
    };
  }, []);

  return (
    <>
      <div
        ref={overlay}
        className="floruvi-splash"
        aria-hidden="true"
        onPointerDown={() => {
          if (overlay.current) overlay.current.dataset.ready = "true";
        }}
      >
        <div className="splash-identity">
          <div className="splash-mark-wrap">
            <Image
              src={mark}
              alt=""
              width={88}
              height={88}
              preload
              className="splash-mark"
            />
          </div>
          <div className="splash-name-wrap">
            <span className="splash-name">floruvi</span>
          </div>
          <p className="splash-tagline">{tagline}</p>
        </div>
      </div>
      <noscript>
        <style>{".floruvi-splash{display:none!important}"}</style>
      </noscript>
    </>
  );
}
