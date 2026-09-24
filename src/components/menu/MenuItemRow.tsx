"use client";

import Image from "next/image";
import type { AvailabilityInfo } from "@/lib/availability";
import type { ItemNode } from "@/lib/data/menu";
import { DietaryBadge, Pill } from "@/components/ui/Badge";
import { PriceTag } from "./PriceTag";
import { cn } from "@/lib/cn";

/**
 * Desktop: thumbnail left · content centre · price right.
 * Mobile: thumbnail + name/Korean name, then description and price stacked.
 */
export function MenuItemRow({ item, availability, onOpen }: { item: ItemNode; availability: AvailabilityInfo | undefined; onOpen: (slug: string) => void }) {
  const hasImage = Boolean(item.image);
  const customizable = item.modifierGroups.length > 0;
  const unavailableToday = availability && !availability.availableToday;
  const badges = item.featured || availability?.label || customizable;

  return (
    <button
      type="button"
      onClick={() => onOpen(item.slug)}
      aria-haspopup="dialog"
      className={cn(
        "group grid w-full grid-cols-[72px_1fr] items-start gap-4 rounded-[22px] border border-ink-900/8 bg-ivory-50 p-4 text-left shadow-[0_1px_2px_rgb(10_9_8/0.04)] transition-all duration-500 ease-out-expo",
        "hover:-translate-y-0.5 hover:border-chili-400/40 hover:bg-white hover:shadow-card focus-visible:outline-offset-4",
        "sm:grid-cols-[96px_1fr_auto] sm:items-center sm:gap-5 sm:p-5",
        unavailableToday && "opacity-75",
      )}
    >
      <span className={cn("relative block aspect-square w-[72px] overflow-hidden rounded-2xl sm:w-[96px]", hasImage ? "bg-ink-800" : "bg-ink-900")}>
        {hasImage ? (
          <Image src={item.image!} alt={item.imageAlt ?? item.name} fill sizes="96px" className="object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.08]" />
        ) : (
          <span className="flex h-full w-full items-center justify-center px-1 text-center" aria-hidden>
            {item.koreanName ? (
              <span className="korean text-[15px] font-medium leading-tight text-chili-300 sm:text-[17px]" lang="ko">
                {item.koreanName}
              </span>
            ) : (
              <span className="font-display text-3xl leading-none text-chili-300/90 sm:text-4xl">{item.name[0]}</span>
            )}
          </span>
        )}
      </span>

      <span className="min-w-0">
        <span className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <span className="font-display text-[1.35rem] leading-[1.15] text-ink-900 transition-colors group-hover:text-chili-600 sm:text-[1.5rem]">{item.name}</span>
          {item.koreanName && (
            <span className="korean text-[15px] text-ink-500" lang="ko">
              {item.koreanName}
            </span>
          )}
        </span>
        {item.description && <span className="mt-1 block text-[14.5px] leading-relaxed text-ink-700">{item.description}</span>}
        {!item.description && item.notes && <span className="mt-1 block text-[14px] leading-relaxed text-ink-500">{item.notes}</span>}
        {(badges || item.dietaryTags.length > 0) && (
          <span className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {item.featured && <Pill tone="chili" className="bg-chili-500/12 text-chili-600 ring-chili-500/30">Signature</Pill>}
            {availability?.label && <Pill tone={unavailableToday ? "garnet" : "bronze"} className={unavailableToday ? "bg-garnet-700/10 text-garnet-700 ring-garnet-600/30" : "bg-bronze-400/25 text-wood-700 ring-bronze-500/40"}>{availability.label}</Pill>}
            {item.dietaryTags.map((t) => (
              <DietaryBadge key={t} tag={t} size="xs" tone="light" />
            ))}
            {customizable && <span className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-ink-500">Options</span>}
          </span>
        )}
        <span className="mt-3 flex items-center justify-between sm:hidden">
          <PriceTag item={item} size="md" className="text-ink-900" />
        </span>
      </span>

      <span className="hidden items-center gap-3 sm:flex">
        <PriceTag item={item} className="text-ink-900 transition-transform duration-500 ease-out-expo group-hover:-translate-x-1" />
        <svg viewBox="0 0 20 20" className="h-4 w-4 -translate-x-2 text-chili-500 opacity-0 transition-all duration-500 ease-out-expo group-hover:translate-x-0 group-hover:opacity-100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 10h12M11 5l5 5-5 5" />
        </svg>
      </span>
    </button>
  );
}
