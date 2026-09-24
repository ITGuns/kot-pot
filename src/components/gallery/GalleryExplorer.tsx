"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MEDIA_TAG_LABELS } from "@/lib/constants";
import type { MediaLite } from "@/lib/menu-types";
import { cn } from "@/lib/cn";

export function GalleryExplorer({ images, initialPhoto }: { images: MediaLite[]; initialPhoto?: number }) {
  const [tag, setTag] = useState("all");
  const [open, setOpen] = useState<number | null>(initialPhoto ?? null);
  const reduce = useReducedMotion();
  const list = useMemo(() => (tag === "all" ? images : images.filter((i) => i.tag === tag)), [images, tag]);
  const openIndex = open == null ? -1 : list.findIndex((i) => i.id === open);
  const current = openIndex >= 0 ? list[openIndex] : (images.find((i) => i.id === open) ?? null);
  const tags = [{ key: "all", label: "Everything" }, ...Object.entries(MEDIA_TAG_LABELS).filter(([k]) => images.some((i) => i.tag === k)).map(([key, label]) => ({ key, label }))];

  const step = useCallback(
    (d: number) => {
      if (!list.length) return;
      const base = openIndex >= 0 ? openIndex : 0;
      setOpen(list[(base + d + list.length) % list.length].id);
    },
    [list, openIndex],
  );

  useEffect(() => {
    if (open == null) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, step]);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (open == null) url.searchParams.delete("photo");
    else url.searchParams.set("photo", String(open));
    window.history.replaceState(null, "", url.toString());
  }, [open]);

  const strip = images.slice(0, 8);

  return (
    <>
      {/* Horizontal scroll strip */}
      <section className="overflow-hidden bg-ink-950 py-14 text-ivory-50">
        <div className="container-site flex items-end justify-between">
          <div>
            <p className="eyebrow text-chili-300">From the table</p>
            <h2 className="mt-2 font-display text-3xl">Swipe through the steam.</h2>
          </div>
          <span className="hidden text-[12px] uppercase tracking-[0.16em] text-ivory-100/70 sm:block">Scroll →</span>
        </div>
        <ul tabIndex={0} className="scrollbar-none mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 focus-visible:outline-2 focus-visible:outline-chili-400 sm:px-8 lg:px-12" aria-label="Featured photos">
          {strip.map((img, i) => (
            <li key={img.id} className="shrink-0 snap-start">
              <button type="button" onClick={() => setOpen(img.id)} className="group relative block h-[300px] overflow-hidden rounded-[22px] bg-ink-800 sm:h-[380px] lg:h-[440px]" style={{ aspectRatio: `${img.width}/${img.height}` }}>
                <Image src={img.file} alt={img.alt} fill sizes="(min-width:1024px) 520px, 360px" loading={i < 2 ? "eager" : "lazy"} className="object-cover transition-transform duration-[1.4s] ease-out-expo group-hover:scale-[1.05]" style={{ objectPosition: `${img.focalX}% ${img.focalY}%` }} />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="absolute inset-x-4 bottom-4 translate-y-2 text-left text-[13px] font-medium text-ivory-50 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">{img.caption ?? img.alt}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Filter + masonry */}
      <section className="bg-ivory-50 py-16 text-ink-900 lg:py-24">
        <div className="container-site">
          <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Filter photos">
            {tags.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tag === t.key}
                onClick={() => setTag(t.key)}
                className={cn("relative h-10 rounded-full px-4 text-[14px] font-semibold transition-colors", tag === t.key ? "text-ivory-50" : "text-ink-700 hover:bg-ink-900/5")}
              >
                {tag === t.key && <motion.span layoutId="gal-pill" className="absolute inset-0 rounded-full bg-ink-900" transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 34 }} />}
                <span className="relative">{t.label}</span>
              </button>
            ))}
          </div>
          <motion.ul layout className="mt-10 columns-2 gap-4 md:columns-3 xl:columns-4 [&>li]:mb-4 [&>li]:break-inside-avoid" aria-live="polite">
            <AnimatePresence initial={false}>
              {list.map((img) => (
                <motion.li key={img.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.35 }}>
                  <button type="button" onClick={() => setOpen(img.id)} className="group relative block w-full overflow-hidden rounded-[20px] bg-ink-800 shadow-card" style={{ aspectRatio: `${img.width}/${img.height}` }}>
                    <Image src={img.file} alt={img.alt} fill sizes="(min-width:1280px) 22vw, (min-width:768px) 30vw, 48vw" className="object-cover transition-transform duration-[1.4s] ease-out-expo group-hover:scale-[1.06]" style={{ objectPosition: `${img.focalX}% ${img.focalY}%` }} />
                    <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <span className="absolute inset-x-4 bottom-4 translate-y-2 text-left text-[13px] font-medium leading-snug text-ivory-50 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">{img.caption ?? img.alt}</span>
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
          {list.length === 0 && <p className="mt-10 text-ink-500">No photos in this set yet.</p>}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {current && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-ink-950/95 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setOpen(null)}
            role="dialog"
            aria-modal="true"
            aria-label={current.alt}
          >
            <button type="button" onClick={() => setOpen(null)} aria-label="Close" className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-ivory-50/10 text-ivory-50 backdrop-blur transition hover:bg-ivory-50/20">
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 5l10 10M15 5L5 15" /></svg>
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label="Previous photo" className="absolute left-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-ivory-50/10 text-ivory-50 backdrop-blur transition hover:bg-ivory-50/20 sm:flex">
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4l-6 6 6 6" /></svg>
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); step(1); }} aria-label="Next photo" className="absolute right-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-ivory-50/10 text-ivory-50 backdrop-blur transition hover:bg-ivory-50/20 sm:flex">
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 4l6 6-6 6" /></svg>
            </button>
            <AnimatePresence mode="wait">
              <motion.figure
                key={current.id}
                className="relative flex max-h-[92svh] w-full max-w-5xl flex-col items-center px-4"
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                drag={reduce ? false : "x"}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -80 || info.velocity.x < -400) step(1);
                  else if (info.offset.x > 80 || info.velocity.x > 400) step(-1);
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative w-full overflow-hidden rounded-[20px]" style={{ aspectRatio: `${current.width}/${current.height}`, maxHeight: "78svh" }}>
                  <Image src={current.file} alt={current.alt} fill sizes="(min-width:1024px) 1024px, 100vw" className="object-contain" priority draggable={false} />
                </div>
                <figcaption className="mt-4 flex w-full items-center justify-between gap-4 text-[13px] text-ivory-100/75">
                  <span className="max-w-[80%]">{current.caption ?? current.alt}</span>
                  <span className="font-label tracking-[0.14em]">{(openIndex >= 0 ? openIndex : 0) + 1} / {list.length}</span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
