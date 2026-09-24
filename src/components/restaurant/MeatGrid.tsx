"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import type { MenuItemLite } from "@/lib/menu-types";
import { money } from "@/lib/format";
import { cn } from "@/lib/cn";

const card = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: (i: number) => ({ opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] as const } }),
};

/** Typography-first meat cards with a subtle grill-grate motif. */
export function MeatGrid({ items, trigger = "view", className, columns = 4 }: { items: MenuItemLite[]; trigger?: "view" | "mount"; className?: string; columns?: 3 | 4 }) {
  const reduce = useReducedMotion();
  const anim = reduce ? {} : trigger === "mount" ? { initial: "hidden", animate: "show" } : { initial: "hidden", whileInView: "show", viewport: { once: true, amount: 0.15 } };
  return (
    <motion.ul {...anim} className={cn("grid gap-4 sm:grid-cols-2", columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3", className)}>
      {items.map((item, i) => (
        <motion.li key={item.id} variants={card} custom={i}>
          <Link
            href={`/menu?item=${item.slug}`}
            className="group relative flex h-full min-h-[240px] flex-col overflow-hidden rounded-[24px] border border-ivory-50/10 bg-ink-800 p-6 text-ivory-50 shadow-card transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:border-chili-400/50 hover:shadow-glow"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.12] transition-opacity duration-500 group-hover:opacity-20"
              style={{ backgroundImage: "repeating-linear-gradient(135deg, rgb(250 245 234 / 0.9) 0 1px, transparent 1px 14px)" }}
            />
            <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-chili-500/0 blur-2xl transition-colors duration-500 group-hover:bg-chili-500/30" />
            <div className="relative flex items-start justify-between gap-3">
              {item.koreanName ? (
                <span className="korean text-[2rem] font-medium leading-none text-chili-300 transition-transform duration-500 group-hover:-translate-y-0.5" lang="ko">
                  {item.koreanName}
                </span>
              ) : (
                <span className="font-display text-[2.6rem] leading-none text-chili-300/80">{item.name[0]}</span>
              )}
              {item.price != null && <span className="font-label text-2xl tracking-wide text-ivory-50 transition-transform duration-500 group-hover:-translate-x-1">{money(item.price)}</span>}
            </div>
            <div className="relative mt-auto pt-8">
              <h3 className="font-display text-[1.6rem] leading-[1.05] text-ivory-50">{item.name}</h3>
              {item.description && <p className="mt-2 text-[14.5px] leading-relaxed text-ivory-100/70">{item.description}</p>}
              <span className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-ivory-100/70 transition-colors group-hover:text-chili-300">
                Details
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 10h12M11 5l5 5-5 5" />
                </svg>
              </span>
            </div>
          </Link>
        </motion.li>
      ))}
    </motion.ul>
  );
}
