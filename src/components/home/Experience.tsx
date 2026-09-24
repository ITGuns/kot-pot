"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { BrothSelector } from "@/components/restaurant/BrothSelector";
import { MeatGrid } from "@/components/restaurant/MeatGrid";
import { Reveal } from "@/components/ui/Reveal";
import type { MediaLite, MenuItemLite } from "@/lib/menu-types";
import { cn } from "@/lib/cn";

type Mode = "bbq" | "hotpot";

export function Experience({ meats, broths, hotpotImage, bbqTagline, brothTagline }: { meats: MenuItemLite[]; broths: MenuItemLite[]; hotpotImage: MediaLite | null; bbqTagline: string | null; brothTagline: string | null }) {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<Mode>("bbq");
  const tabs: { key: Mode; label: string; hint: string | null }[] = [
    { key: "bbq", label: "Korean BBQ", hint: bbqTagline },
    { key: "hotpot", label: "Hot Pot", hint: brothTagline },
  ];
  return (
    <section id="experience" aria-labelledby="experience-title" className="grain relative scroll-mt-24 overflow-hidden bg-ink-900 py-24 text-ivory-50 lg:py-32">
      <div aria-hidden className={cn("pointer-events-none absolute -left-40 top-20 h-[520px] w-[520px] rounded-full blur-3xl transition-colors duration-1000", mode === "bbq" ? "bg-chili-500/15" : "bg-garnet-700/40")} />
      <div className="container-site relative z-[2]">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <p className="eyebrow text-chili-300">Two ways to feast</p>
            <h2 id="experience-title" className="mt-4 font-display text-[clamp(2.6rem,5.5vw,4.8rem)] leading-[0.98]">
              Choose your <em className="italic text-chili-300">experience</em>.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div role="tablist" aria-label="Experience" className="inline-flex rounded-full border border-ivory-50/12 bg-ivory-50/5 p-1">
              {tabs.map((t) => {
                const on = t.key === mode;
                return (
                  <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    aria-controls={`experience-${t.key}`}
                    onClick={() => setMode(t.key)}
                    className={cn("relative h-12 rounded-full px-6 font-label text-[16px] tracking-[0.2em] transition-colors sm:px-8", on ? "text-ink-900" : "text-ivory-100/75 hover:text-ivory-50")}
                  >
                    {on && <motion.span layoutId="experience-pill" className="absolute inset-0 rounded-full bg-ivory-50" transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 36 }} />}
                    <span className="relative">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </Reveal>
        </div>

        <div className="relative mt-12 min-h-[420px] min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            {mode === "bbq" ? (
              <motion.div key="bbq" id="experience-bbq" role="tabpanel" initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
                {bbqTagline && <p className="mb-6 font-display text-2xl italic text-ivory-100/80">{bbqTagline}</p>}
                <MeatGrid items={meats} trigger="mount" />
                <div className="mt-8">
                  <Link href="/korean-bbq" className="inline-flex items-center gap-2 font-label text-[16px] tracking-[0.18em] text-ivory-50 hover:text-chili-300">
                    See Korean BBQ <span aria-hidden>→</span>
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div key="hotpot" id="experience-hotpot" role="tabpanel" initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
                <BrothSelector broths={broths} image={hotpotImage} tagline={brothTagline} />
                <div className="mt-8">
                  <Link href="/hot-pot" className="inline-flex items-center gap-2 font-label text-[16px] tracking-[0.18em] text-ivory-50 hover:text-chili-300">
                    Explore Hot Pot <span aria-hidden>→</span>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
