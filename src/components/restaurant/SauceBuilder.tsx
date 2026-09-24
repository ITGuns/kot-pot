"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import type { MenuItemLite } from "@/lib/menu-types";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

/* Bowl colours are design only: one swatch per position, so any sauce list works. */
const SWATCHES = ["#d5ad67", "#7c1627", "#a06b3a", "#cc3a1e", "#e9cb95", "#6b3d5a", "#4d805d", "#b9a281"];

export function SauceBuilder({ sauces, tagline, tone = "dark", compact = false }: { sauces: MenuItemLite[]; tagline: string | null; tone?: "dark" | "light"; compact?: boolean }) {
  const reduce = useReducedMotion();
  const [picked, setPicked] = useState<number[]>([]);
  const toggle = (id: number) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const selected = picked.map((id) => sauces.find((s) => s.id === id)!).filter(Boolean);
  const light = tone === "light";
  if (!sauces.length) return null;

  return (
    <section id="sauce-bar" aria-labelledby="sauce-title" className={cn("relative scroll-mt-24 overflow-hidden", light ? "bg-ivory-100 text-ink-900" : "bg-ink-950 text-ivory-50", compact ? "py-16 lg:py-20" : "py-24 lg:py-32")}>
      <div aria-hidden className={cn("pointer-events-none absolute -left-24 bottom-0 h-96 w-96 rounded-full blur-3xl", light ? "bg-bronze-400/20" : "bg-garnet-700/40")} />
      <div className="container-site relative z-[2] grid items-center gap-12 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Reveal>
            <p className={cn("eyebrow", light ? "text-chili-600" : "text-chili-300")}>Sauce bar</p>
            <h2 id="sauce-title" className="mt-4 font-display text-[clamp(2.6rem,5.5vw,4.6rem)] leading-[0.98]">
              Build your <em className={cn("italic", light ? "text-chili-500" : "text-chili-300")}>own</em> sauce.
            </h2>
            {tagline && <p className={cn("mt-4 max-w-md text-[16px] leading-relaxed", light ? "text-ink-700" : "text-ivory-100/70")}>{tagline} — tap the sauces you'd mix at the bar.</p>}
          </Reveal>
          <Reveal delay={0.1}>
            <ul className="mt-8 flex flex-wrap gap-2.5" aria-label="Sauces">
              {sauces.map((s, i) => {
                const on = picked.includes(s.id);
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle(s.id)}
                      className={cn(
                        "group flex h-12 items-center gap-3 rounded-full border pl-2 pr-5 text-[15px] font-semibold transition-all duration-300",
                        on
                          ? light
                            ? "border-ink-900 bg-ink-900 text-ivory-50"
                            : "border-ivory-50 bg-ivory-50 text-ink-900"
                          : light
                            ? "border-ink-900/15 bg-ivory-50 text-ink-800 hover:border-ink-900/50"
                            : "border-ivory-50/15 bg-ivory-50/5 text-ivory-100 hover:border-ivory-50/40",
                      )}
                    >
                      <span className="h-8 w-8 rounded-full ring-2 ring-white/20 transition-transform duration-300 group-hover:scale-110" style={{ background: SWATCHES[i % SWATCHES.length] }} aria-hidden />
                      {s.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </Reveal>
          <Reveal delay={0.15} className="mt-8">
            <div className={cn("rounded-[22px] border p-5", light ? "border-ink-900/10 bg-ivory-50" : "border-ivory-50/10 bg-ivory-50/5")} aria-live="polite">
              {selected.length === 0 ? (
                <p className={cn("text-[15px]", light ? "text-ink-500" : "text-ivory-100/70")}>Your bowl is empty. Pick a sauce or three.</p>
              ) : (
                <>
                  <p className="font-label text-[14px] tracking-[0.2em] text-chili-400">Your mix</p>
                  <ul className="mt-2 space-y-1.5">
                    {selected.map((s) => (
                      <li key={s.id} className="flex items-baseline justify-between gap-4 text-[15px]">
                        <span className="font-semibold">{s.name}</span>
                        {s.description && <span className={cn("text-right text-[13.5px]", light ? "text-ink-500" : "text-ivory-100/70")}>{s.description}</span>}
                      </li>
                    ))}
                  </ul>
                  <button type="button" onClick={() => setPicked([])} className={cn("mt-4 text-[13px] font-semibold underline-offset-4 hover:underline", light ? "text-ink-700" : "text-ivory-100/70")}>
                    Start over
                  </button>
                </>
              )}
            </div>
            <p className={cn("mt-4 text-[13px]", light ? "text-ink-500" : "text-ivory-100/70")}>
              Sauces are mixed at the table.{" "}
              <Link href="/menu?category=sauce-bar" className="font-semibold underline-offset-4 hover:underline">
                See the sauce bar on the menu
              </Link>
              .
            </p>
          </Reveal>
        </div>

        {/* Bowl */}
        <Reveal delay={0.1} className="lg:col-span-6" amount={0.2}>
          <div className="relative mx-auto aspect-square w-full max-w-[460px]">
            <div aria-hidden className={cn("absolute inset-[8%] rounded-full", light ? "bg-ink-900/6" : "bg-ivory-50/5")} />
            <svg viewBox="0 0 400 400" className="relative h-full w-full" role="img" aria-label={selected.length ? `A dipping bowl with ${selected.map((s) => s.name).join(", ")}` : "An empty dipping bowl"}>
              <defs>
                <radialGradient id="bowl" cx="50%" cy="45%" r="55%">
                  <stop offset="0%" stopColor={light ? "#faf5ea" : "#2a2422"} />
                  <stop offset="100%" stopColor={light ? "#e8dbc2" : "#121010"} />
                </radialGradient>
                <clipPath id="bowl-clip">
                  <circle cx="200" cy="200" r="150" />
                </clipPath>
              </defs>
              <circle cx="200" cy="200" r="168" fill="none" stroke={light ? "#1a1716" : "#faf5ea"} strokeOpacity="0.25" strokeWidth="2" />
              <circle cx="200" cy="200" r="150" fill="url(#bowl)" stroke={light ? "#1a1716" : "#faf5ea"} strokeOpacity="0.35" strokeWidth="1.5" />
              <g clipPath="url(#bowl-clip)">
                <AnimatePresence>
                  {selected.map((s, i) => {
                    const idx = sauces.findIndex((x) => x.id === s.id);
                    const angle = (i / Math.max(selected.length, 1)) * Math.PI * 2 - Math.PI / 2;
                    const dist = selected.length === 1 ? 0 : 52;
                    const cx = 200 + Math.cos(angle) * dist;
                    const cy = 200 + Math.sin(angle) * dist;
                    return (
                      <motion.circle
                        key={s.id}
                        r={selected.length === 1 ? 118 : 92}
                        fill={SWATCHES[idx % SWATCHES.length]}
                        fillOpacity={0.85}
                        style={{ mixBlendMode: light ? "multiply" : "screen" }}
                        initial={reduce ? { opacity: 0, cx, cy } : { opacity: 0, scale: 0.2, cx, cy }}
                        animate={{ opacity: 1, scale: 1, cx, cy }}
                        exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.3 }}
                        transition={{ type: "spring", stiffness: 160, damping: 18 }}
                      />
                    );
                  })}
                </AnimatePresence>
              </g>
              <ellipse cx="200" cy="120" rx="70" ry="18" fill="#fff" fillOpacity={light ? 0.35 : 0.08} />
            </svg>
            <AnimatePresence>
              {selected.length > 0 && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute right-[6%] top-[6%] flex h-12 w-12 items-center justify-center rounded-full bg-chili-600 font-label text-lg tracking-wide text-ivory-50 shadow-glow"
                  aria-hidden
                >
                  {selected.length}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
