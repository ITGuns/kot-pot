"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export type Slide = { src: string; alt: string; caption?: string; position?: string };

/**
 * Crossfading image carousel with slow Ken Burns drift and segmented progress bars.
 * Pauses when the tab is hidden, on hover, or when reduced motion is preferred.
 */
export function ImageCarousel({
  slides,
  interval = 6500,
  className,
  sizes = "100vw",
  priority = false,
  showProgress = true,
  showCaption = false,
  kenBurns = true,
  overlay,
  progressClassName,
}: {
  slides: Slide[];
  interval?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  showProgress?: boolean;
  showCaption?: boolean;
  kenBurns?: boolean;
  overlay?: React.ReactNode;
  progressClassName?: string;
}) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cycle, setCycle] = useState(0); // bumps to restart the progress animation
  const timer = useRef<number | null>(null);
  const count = slides.length;
  const animated = !reduce && count > 1;

  const go = useCallback(
    (next: number) => {
      setIndex(((next % count) + count) % count);
      setCycle((c) => c + 1);
    },
    [count],
  );

  useEffect(() => {
    if (!animated || paused) return;
    timer.current = window.setTimeout(() => go(index + 1), interval);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [animated, paused, index, interval, go, cycle]);

  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const slide = slides[index];

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Photo carousel"
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={slide.src}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 1.4, ease: "easeInOut" }}
          aria-hidden={false}
        >
          <motion.div
            className="absolute inset-0 will-change-transform"
            initial={{ scale: kenBurns && animated ? 1.06 : 1, x: 0 }}
            animate={{ scale: kenBurns && animated ? 1.16 : 1, x: kenBurns && animated ? (index % 2 ? "-1.5%" : "1.5%") : 0 }}
            transition={{ duration: (interval + 1500) / 1000, ease: "linear" }}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              sizes={sizes}
              priority={priority && index === 0}
              fetchPriority={priority && index === 0 ? "high" : undefined}
              className="object-cover"
              style={{ objectPosition: slide.position ?? "50% 50%" }}
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Preload the next slide so crossfades never show a flash */}
      {count > 1 && (
        <div className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0" aria-hidden>
          <Image src={slides[(index + 1) % count].src} alt="" fill sizes="10px" />
        </div>
      )}

      {overlay}

      {showCaption && slide.caption && (
        <AnimatePresence mode="wait">
          <motion.p
            key={slide.src + "-cap"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.5 }}
            className="absolute bottom-5 left-5 z-[3] max-w-[70%] text-[13px] font-medium leading-snug text-ivory-50 text-shadow-hero"
          >
            {slide.caption}
          </motion.p>
        </AnimatePresence>
      )}

      {showProgress && count > 1 && (
        <div className={cn("absolute bottom-5 right-5 z-[3] flex items-center gap-1.5", progressClassName)} role="tablist" aria-label="Slides">
          {slides.map((s, i) => (
            <button
              key={s.src}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show slide ${i + 1}: ${s.alt}`}
              onClick={() => go(i)}
              className="group relative h-6 w-8 sm:w-10"
            >
              <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-ivory-50/30 transition-colors group-hover:bg-ivory-50/50">
                {i === index && (
                  <motion.span
                    key={cycle}
                    className="block h-full bg-chili-300"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: paused || !animated ? 1 : 1 }}
                    transition={{ duration: animated && !paused ? interval / 1000 : 0, ease: "linear" }}
                    style={{ transformOrigin: "left" }}
                  />
                )}
                {i < index && <span className="block h-full bg-ivory-50/80" />}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
