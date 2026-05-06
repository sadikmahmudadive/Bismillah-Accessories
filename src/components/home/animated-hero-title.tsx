"use client";

import { useEffect, useRef } from "react";

export function AnimatedHeroTitle() {
  const text = "Bismillah Accessories";
  const pRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    (async () => {
      const anime = await import("animejs");
      const { animate, stagger, splitText } = anime;
      if (!pRef.current) return;
      // Split text into chars and wrap
      const { chars } = splitText(pRef.current, {
        chars: { wrap: true },
      });
      // Apply green color to "Accessories" chars (starts after "Bismillah " = 10 chars)
      chars.forEach((char, index) => {
        if (index >= 9) {
          (char as HTMLElement).style.color = "#2f9e74";
        }
      });
      // Animate
      animate(chars, {
        y: ["75%", "0%"],
        duration: 750,
        ease: "out(3)",
        delay: stagger(50),
        loop: true,
        alternate: true,
      });
      // Cleanup if needed
      cleanup = () => {
        // Remove all char wrappers
        if (pRef.current) pRef.current.innerHTML = text;
      };
    })();
    return () => { if (cleanup) cleanup(); };
  }, []);

  return (
    <p
      ref={pRef}
      className="mt-6 max-w-2xl text-5xl font-bold leading-[1.05] tracking-tight text-neutral-950 sm:text-6xl lg:text-7xl"
      style={{ overflow: "hidden", color: "inherit", background: "none" }}
    >
      {text}
    </p>
  );
}
