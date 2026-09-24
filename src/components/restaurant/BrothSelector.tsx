"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import type { MediaLite, MenuItemLite } from "@/lib/menu-types";
import { money } from "@/lib/format";
import { cn } from "@/lib/cn";
import { onTabListKeyDown } from "@/lib/tabs";

export function BrothSelector({ broths, image, tagline, className }: { broths: MenuItemLite[]; image: MediaLite | null; tagline: string | null; className?: string }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const broth = broths[active];
  if (!broth) return null;


  return (
    <div className={cn("grid gap-6 lg:grid-cols-12 lg:gap-8", className)}>
      {/* Selector */}
      <div className="min-w-0 lg:col-span-5">
        <p className="eyebrow text-chili-300">Choose your broth</p>
        {tagline && <p className="mt-2 font-display text-2xl italic text-ivory-100/85">{tagline}</p>}
        <div role="tablist" aria-label="Hot pot broths" aria-orientation="vertical" onKeyDown={onTabListKeyDown} className="scrollbar-none -mx-5 mt-5 flex gap-2 overflow-x-auto px-5 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
          {broths.map((b, i) => {
            const on = i === active;
            return (
              <button
                key={b.id}
                type="button"
                role="tab"
                aria-selected={on}
                tabIndex={on ? 0 : -1}
                id={`broth-tab-${b.id}`}
                aria-controls="broth-panel"
                onClick={() => setActive(i)}
                onFocus={() => setActive(i)}
                className={cn(
                  "relative flex shrink-0 items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition-colors lg:w-full",
                  on ? "border-chili-400/60 text-ivory-50" : "border-ivory-50/10 text-ivory-100/70 hover:border-ivory-50/30 hover:text-ivory-50",
                )}
              >
                {on && <motion.span layoutId="broth-active" className="absolute inset-0 rounded-2xl bg-chili-500/15" transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 34 }} />}
                <span className="relative flex items-center gap-3">
                  <span className={cn("flex h-7 w-7 items-center justify-center rounded-full font-label text-[13px] tracking-wide", on ? "bg-chili-600 text-ivory-50" : "bg-ivory-50/10 text-ivory-100/70")}>{i + 1}</span>
                  <span className="whitespace-nowrap font-display text-[1.25rem] leading-none">{b.name}</span>
                </span>
                {b.price != null && <span className="relative font-label text-lg tracking-wide">{money(b.price)}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel */}
      <div id="broth-panel" role="tabpanel" aria-labelledby={`broth-tab-${broth.id}`} className="relative min-h-[420px] min-w-0 overflow-hidden rounded-[32px] bg-ink-800 shadow-lift lg:col-span-7 lg:min-h-[520px]">
        {image && (
          <motion.div key={broth.id} initial={reduce ? false : { scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0">
            <Image src={image.file} alt={image.alt} fill sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover" style={{ objectPosition: `${image.focalX}% ${image.focalY}%` }} />
          </motion.div>
        )}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-ink-950/10" />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_50%_at_70%_30%,rgb(204_58_30/0.25),transparent_70%)]" />
        <div aria-hidden className="steam-layer steam-a opacity-40" />
        <div className="relative flex h-full min-h-[420px] flex-col justify-end p-7 sm:p-10 lg:min-h-[520px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={broth.id}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="eyebrow text-chili-300">
                Broth {active + 1} of {broths.length}
              </p>
              <h3 className="mt-3 font-display text-[clamp(2.4rem,5vw,4.2rem)] leading-[0.98] text-ivory-50 text-shadow-hero">{broth.name}</h3>
              {broth.description && <p className="mt-3 max-w-md text-[17px] leading-relaxed text-ivory-100/85">{broth.description}</p>}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                {broth.price != null && (
                  <span className="font-label text-3xl tracking-wide text-ivory-50">
                    {money(broth.price)} <span className="text-[14px] tracking-[0.18em] text-ivory-100/70">per broth</span>
                  </span>
                )}
                <Link href={`/menu?item=${broth.slug}`} className="inline-flex items-center gap-2 text-[14px] font-semibold text-ivory-50 underline-offset-4 hover:underline">
                  View on menu <span aria-hidden>→</span>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
