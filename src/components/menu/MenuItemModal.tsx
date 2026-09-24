"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import type { AvailabilityInfo } from "@/lib/availability";
import type { ItemNode } from "@/lib/data/menu";
import { DietaryBadge, Pill } from "@/components/ui/Badge";
import { DIETARY_LABELS } from "@/lib/constants";
import { priceAdjustment } from "@/lib/format";
import { PriceTag } from "./PriceTag";
import { cn } from "@/lib/cn";

export function MenuItemModal({ item, availability, onClose }: { item: ItemNode | null; availability: AvailabilityInfo | undefined; onClose: () => void }) {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<Element | null>(null);

  useEffect(() => {
    if (!item) return;
    lastFocused.current = document.activeElement;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>('button, [href], input, [tabindex]:not([tabindex="-1"])');
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const t = setTimeout(() => panelRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus(), 30);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      clearTimeout(t);
      (lastFocused.current as HTMLElement | null)?.focus?.();
    };
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key="backdrop"
          className="fixed inset-0 z-[70] flex items-end justify-center bg-ink-950/75 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="item-modal-title"
            onClick={(e) => e.stopPropagation()}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex max-h-[92svh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] bg-ivory-50 text-ink-900 shadow-lift sm:rounded-[28px]"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              data-autofocus
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-ink-950/60 text-ivory-50 backdrop-blur transition hover:bg-ink-950"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5 5l10 10M15 5L5 15" />
              </svg>
            </button>
            <div className="overflow-y-auto">
              {item.image ? (
                <div className="relative aspect-[16/10] w-full bg-ink-800">
                  <Image src={item.image} alt={item.imageAlt ?? item.name} fill sizes="(min-width: 640px) 672px, 100vw" className="object-cover" priority />
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-950/50 to-transparent" />
                </div>
              ) : (
                <div className="grain relative flex h-32 items-end overflow-hidden bg-ink-900 px-6 pb-4 sm:h-36 sm:px-8">
                  <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-chili-500/30 blur-3xl" />
                  <span className={cn("relative z-[2] leading-none text-chili-300", item.koreanName ? "korean text-5xl font-medium sm:text-6xl" : "font-display text-6xl sm:text-7xl")} lang={item.koreanName ? "ko" : undefined}>
                    {item.koreanName ?? item.name[0]}
                  </span>
                </div>
              )}
              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap gap-1.5">
                  <Pill tone="light" className="ring-ink-900/15">{item.categoryName}</Pill>
                  {item.sectionName !== item.categoryName && <Pill tone="light" className="ring-ink-900/15">{item.sectionName}</Pill>}
                  {item.featured && <Pill tone="chili" className="bg-chili-500/12 text-chili-600 ring-chili-500/30">Signature</Pill>}
                  {availability?.label && <Pill className={availability.availableToday ? "bg-bronze-400/25 text-wood-700 ring-bronze-500/40" : "bg-garnet-700/10 text-garnet-700 ring-garnet-600/30"}>{availability.label}</Pill>}
                  {availability?.availableNow && <Pill className="bg-jade-500/15 text-jade-700 ring-jade-500/30">Available now</Pill>}
                </div>
                <div className="mt-4 flex items-start justify-between gap-6">
                  <div>
                    <h2 id="item-modal-title" className="font-display text-3xl leading-[1.1] text-ink-900 sm:text-4xl">
                      {item.name}
                    </h2>
                    {item.koreanName && item.image && (
                      <p className="korean mt-1 text-[17px] text-ink-500" lang="ko">
                        {item.koreanName}
                      </p>
                    )}
                  </div>
                  <PriceTag item={item} size="lg" className="shrink-0 text-ink-900" />
                </div>
                {item.description && <p className="mt-4 text-[16px] leading-relaxed text-ink-700">{item.description}</p>}
                {item.notes && <p className="mt-3 text-[14px] leading-relaxed text-ink-500">{item.notes}</p>}
                {availability?.detail && <p className="mt-3 text-[14px] text-ink-500">{availability.detail}</p>}

                {item.dietaryTags.length > 0 && (
                  <ul className="mt-5 flex flex-wrap gap-2" aria-label="Dietary information">
                    {item.dietaryTags.map((t) => (
                      <li key={t} className="flex items-center gap-2 text-[14px] text-ink-700">
                        <DietaryBadge tag={t} tone="light" /> {DIETARY_LABELS[t].description}
                      </li>
                    ))}
                  </ul>
                )}

                {item.modifierGroups.length > 0 && (
                  <div className="mt-8 space-y-6">
                    {item.modifierGroups.map((g) => (
                      <section key={g.id} aria-labelledby={`group-${g.id}`}>
                        <div className="flex items-baseline justify-between gap-4 border-b border-ink-900/10 pb-2">
                          <h3 id={`group-${g.id}`} className="font-display text-xl text-ink-900">
                            {g.name}
                          </h3>
                          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-500">
                            {g.required ? "Required" : "Optional"}
                            {g.maxSelections > 1 ? ` · up to ${g.maxSelections}` : g.required ? " · choose 1" : ""}
                          </span>
                        </div>
                        {g.description && <p className="mt-2 text-[13.5px] text-ink-500">{g.description}</p>}
                        <ul className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2">
                          {g.modifiers.map((m) => (
                            <li key={m.id} className="flex items-baseline justify-between gap-3 border-b border-dotted border-ink-900/15 pb-1.5">
                              <span className="text-[15px] text-ink-800">
                                {m.name}
                                {m.description && <span className="text-ink-500">: {m.description}</span>}
                                {m.dietaryTags.map((t) => (
                                  <DietaryBadge key={t} tag={t} size="xs" tone="light" className="ml-1.5 align-middle" />
                                ))}
                                {m.availabilityNote && <span className="ml-1.5 text-[12px] text-ink-500">({m.availabilityNote})</span>}
                              </span>
                              <span className={cn("shrink-0 font-label text-[16px] tracking-wide", m.priceAdjustment ? "text-ink-900" : "text-ink-500")}>{priceAdjustment(m.priceAdjustment)}</span>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
