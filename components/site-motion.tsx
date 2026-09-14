"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";

/** One motion layer keeps timing, cleanup & reduced-motion behaviour consistent. */
export function SiteMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", (context) => {
      const main = document.getElementById("main");
      if (!main) return;

      // Keep the header stable, navigation immediate & all content visible without JS.
      gsap.fromTo(
        main,
        { opacity: 0.65 },
        {
          opacity: 1,
          duration: 0.28,
          ease: "power1.out",
          clearProps: "opacity",
        },
      );

      const reveal = context.add("reveal", (element: Element) => {
        gsap.fromTo(
          element,
          { y: 10, opacity: 0.65 },
          {
            y: 0,
            opacity: 1,
            duration: 0.45,
            ease: "power2.out",
            clearProps: "transform,opacity",
          },
        );
      });
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              reveal(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 },
      );
      main
        .querySelectorAll(
          "h1, .section-heading h2, .tower-section-heading h2, .editorial-banner h2",
        )
        .forEach((heading) => observer.observe(heading));

      const feedback = context.add("feedback", (event: MouseEvent) => {
        if (!(event.target instanceof Element)) return;
        const button = event.target.closest<HTMLElement>(
          "button, a.button, a.btn",
        );
        if (!button || button.matches(":disabled, [aria-disabled='true']"))
          return;
        gsap.fromTo(
          button,
          { scale: 0.97 },
          {
            scale: 1,
            duration: 0.2,
            ease: "power2.out",
            overwrite: true,
            clearProps: "transform",
          },
        );
      });
      const onClick = (event: MouseEvent) => feedback(event);
      document.addEventListener("click", onClick);
      return () => {
        observer.disconnect();
        document.removeEventListener("click", onClick);
      };
    });
    return () => media.revert();
  }, [pathname]);

  return null;
}
