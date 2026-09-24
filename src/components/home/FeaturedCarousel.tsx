"use client";

import Image from "next/image";
import Link from "next/link";
import { DragCarousel } from "@/components/motion/DragCarousel";
import { Reveal } from "@/components/ui/Reveal";
import { Pill } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import type { MenuItemLite } from "@/lib/menu-types";
import { money } from "@/lib/format";
import { cn } from "@/lib/cn";

function FeaturedCard({ item, index }: { item: MenuItemLite; index: number }) {
  const photo = item.image ?? null;
  const texture = !photo && item.categoryImage ? item.categoryImage : null;
  return (
    <Link
      href={`/menu?item=${item.slug}`}
      draggable={false}
      className={cn(
        "group relative flex h-[420px] w-[78vw] max-w-[400px] shrink-0 snap-start flex-col justify-end overflow-hidden rounded-[28px] border border-ivory-50/10 bg-ink-800 p-6 text-ivory-50 shadow-card transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:border-chili-400/50 hover:shadow-lift sm:w-[400px] sm:p-7",
      )}
    >
      {photo && (
        <>
          <Image src={photo} alt={item.imageAlt ?? item.name} fill sizes="400px" draggable={false} className="object-cover transition-transform duration-[1.4s] ease-out-expo group-hover:scale-[1.06]" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/45 to-ink-950/10" />
        </>
      )}
      {texture && (
        <>
          <Image src={texture} alt="" fill sizes="400px" draggable={false} aria-hidden className="object-cover opacity-[0.16] saturate-[0.7] transition-all duration-[1.4s] ease-out-expo group-hover:scale-[1.06] group-hover:opacity-25" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-900/70 to-ink-900/30" />
        </>
      )}
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-chili-500/0 blur-3xl transition-colors duration-700 group-hover:bg-chili-500/25" />
      <span className="absolute left-6 top-6 font-label text-[14px] tracking-[0.24em] text-ivory-100/70 sm:left-7 sm:top-7">{String(index + 1).padStart(2, "0")}</span>
      {!photo && item.koreanName && (
        <span className="korean absolute right-6 top-6 text-[3.2rem] font-medium leading-none text-chili-300/90 sm:right-7 sm:top-7" lang="ko" aria-hidden>
          {item.koreanName}
        </span>
      )}
      <div className="relative">
        <div className="flex flex-wrap gap-1.5">
          <Pill tone="chili">{item.categoryName}</Pill>
          {item.availabilityLabel && <Pill tone="light">{item.availabilityLabel}</Pill>}
        </div>
        {photo && item.koreanName && (
          <span className="korean mt-4 block text-[1.6rem] font-medium leading-none text-chili-300" lang="ko">
            {item.koreanName}
          </span>
        )}
        <div className="mt-3 flex items-end justify-between gap-4">
          <h3 className="font-display text-[1.9rem] leading-[1.02]">{item.name}</h3>
          {item.price != null && <span className="shrink-0 font-label text-2xl tracking-wide transition-transform duration-500 group-hover:-translate-x-1">{money(item.price)}</span>}
        </div>
        {item.description && <p className="mt-2 max-w-sm text-[14.5px] leading-relaxed text-ivory-100/75">{item.description}</p>}
      </div>
    </Link>
  );
}

export function FeaturedCarousel({ items }: { items: MenuItemLite[] }) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="featured-title" className="relative overflow-hidden bg-ink-950 py-24 text-ivory-50 lg:py-32">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-px w-[80%] -translate-x-1/2 bg-gradient-to-r from-transparent via-chili-400/40 to-transparent" />
      <div className="container-site flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <Reveal>
          <p className="eyebrow text-chili-300">Featured dishes</p>
          <h2 id="featured-title" className="mt-4 font-display text-[clamp(2.6rem,5.5vw,4.8rem)] leading-[0.98]">
            The table <em className="italic text-chili-300">is</em> the kitchen.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <ButtonLink href="/menu" variant="glass" arrow>
            View full menu
          </ButtonLink>
        </Reveal>
      </div>
      <Reveal className="mt-10" amount={0.1}>
        <DragCarousel ariaLabel="Featured dishes" trackClassName="px-5 scroll-px-5 sm:px-8 sm:scroll-px-8 lg:px-12 lg:scroll-px-12">
          {items.map((item, i) => (
            <li key={item.id} className="shrink-0 snap-start" aria-roledescription="slide" aria-label={`${i + 1} of ${items.length}`}>
              <FeaturedCard item={item} index={i} />
            </li>
          ))}
        </DragCarousel>
      </Reveal>
    </section>
  );
}
