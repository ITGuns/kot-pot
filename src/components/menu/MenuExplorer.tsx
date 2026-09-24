"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import type { AvailabilityInfo } from "@/lib/availability";
import type { CategoryNode, ItemNode } from "@/lib/data/menu";
import { DIETARY_FILTERS, type DietaryFilterKey } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { AddonsList } from "./AddonsList";
import { MenuItemModal } from "./MenuItemModal";
import { MenuItemRow } from "./MenuItemRow";
import { applyFilters, EMPTY_FILTERS, hasActiveFilters, type FilteredCategory, type MenuFilters } from "./menu-filter";

const ALL = "all";

export function MenuExplorer({
  categories,
  availability,
  initialCategory,
  initialItem,
  initialQuery,
}: {
  categories: CategoryNode[];
  availability: Record<number, AvailabilityInfo>;
  initialCategory?: string;
  initialItem?: string;
  initialQuery?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reduce = useReducedMotion();

  const allItems = useMemo(() => categories.flatMap((c) => c.sections.flatMap((s) => s.items)), [categories]);
  const itemBySlug = useMemo(() => new Map(allItems.map((i) => [i.slug, i])), [allItems]);

  const [active, setActive] = useState<string>(() => {
    const fromItem = initialItem ? itemBySlug.get(initialItem)?.categorySlug : undefined;
    return fromItem ?? (categories.find((c) => c.slug === initialCategory)?.slug || ALL);
  });
  const [filters, setFilters] = useState<MenuFilters>({ ...EMPTY_FILTERS, query: initialQuery ?? "" });
  const deferredQuery = useDeferredValue(filters.query);
  const [openSlug, setOpenSlug] = useState<string | null>(initialItem ?? null);
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const effectiveFilters = useMemo(() => ({ ...filters, query: deferredQuery }), [filters, deferredQuery]);
  const searching = Boolean(deferredQuery.trim());
  const filtered = useMemo(() => applyFilters(categories, effectiveFilters, availability), [categories, effectiveFilters, availability]);
  const visibleCategories: FilteredCategory[] = searching ? filtered.filter((c) => c.itemCount > 0) : active === ALL ? filtered : filtered.filter((c) => c.slug === active);
  const totalMatches = filtered.reduce((n, c) => n + c.itemCount, 0);
  const openItem: ItemNode | null = openSlug ? (itemBySlug.get(openSlug) ?? null) : null;

  const syncUrl = useCallback(
    (next: { category?: string; item?: string | null }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.category !== undefined) {
        if (next.category === ALL) params.delete("category");
        else params.set("category", next.category);
      }
      if (next.item === null) params.delete("item");
      else if (next.item) params.set("item", next.item);
      params.delete("q");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const selectCategory = (slug: string) => {
    setActive(slug);
    setFilters((f) => ({ ...f, query: "" }));
    syncUrl({ category: slug, item: null });
    requestAnimationFrame(() => {
      const top = (contentRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY - 150;
      if (window.scrollY > top) window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    });
  };
  const openModal = (slug: string) => {
    setOpenSlug(slug);
    syncUrl({ item: slug });
  };
  const closeModal = useCallback(() => {
    setOpenSlug(null);
    syncUrl({ item: null });
  }, [syncUrl]);

  useEffect(() => {
    if (initialItem && itemBySlug.has(initialItem)) setOpenSlug(initialItem);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleDietary = (key: DietaryFilterKey) =>
    setFilters((f) => ({ ...f, dietary: f.dietary.includes(key) ? f.dietary.filter((k) => k !== key) : [...f.dietary, key] }));
  const activeFilterCount = filters.dietary.length + (filters.availableNow ? 1 : 0) + (filters.featured ? 1 : 0);
  const toggleSection = (id: number) =>
    setCollapsed((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const tabs = [{ slug: ALL, name: "All" }, ...categories.map((c) => ({ slug: c.slug, name: c.name }))];

  return (
    <div className="bg-ivory-50 text-ink-900">
      {/* Sticky category + search bar */}
      <div className="sticky top-[62px] z-30 border-b border-ink-900/10 bg-ivory-50/92 backdrop-blur-xl md:top-[68px]">
        <div className="container-site flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between">
          <nav aria-label="Menu categories" className="-mx-5 overflow-x-auto px-5 scrollbar-none sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0">
            <ul className="flex w-max gap-1.5">
              {tabs.map((c) => {
                const isActive = !searching && c.slug === active;
                return (
                  <li key={c.slug}>
                    <button
                      type="button"
                      onClick={() => selectCategory(c.slug)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "relative h-10 whitespace-nowrap rounded-full px-4 text-[14px] font-semibold tracking-tight transition-colors",
                        isActive ? "text-ivory-50" : "text-ink-700 hover:bg-ink-900/5 hover:text-ink-900",
                      )}
                    >
                      {isActive && <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full bg-ink-900" transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 34 }} />}
                      <span className="relative">{c.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <label className="relative flex-1 lg:w-72">
              <span className="sr-only">Search the menu</span>
              <svg aria-hidden viewBox="0 0 20 20" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="9" cy="9" r="6" />
                <path d="M14 14l4 4" />
              </svg>
              <input
                type="search"
                value={filters.query}
                onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
                placeholder="Search brisket, 삼겹살, kimchi, soju…"
                className="h-10 w-full rounded-full border border-ink-900/12 bg-white pl-10 pr-4 text-[14px] text-ink-900 placeholder:text-ink-500/70 focus:border-chili-400 focus:outline-none"
              />
            </label>
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
              aria-controls="menu-filters"
              className={cn(
                "flex h-10 items-center gap-2 rounded-full border px-4 text-[14px] font-semibold transition-colors",
                activeFilterCount ? "border-chili-600 bg-chili-600 text-ivory-50" : "border-ink-900/12 bg-white text-ink-800 hover:border-ink-900/30",
              )}
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 5h14M6 10h8M8 15h4" />
              </svg>
              Filters{activeFilterCount ? ` · ${activeFilterCount}` : ""}
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {filtersOpen && (
            <motion.div
              id="menu-filters"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden border-t border-ink-900/8"
            >
              <div className="container-site flex flex-wrap items-center gap-2 py-3">
                <span className="mr-1 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-500">Dietary</span>
                {DIETARY_FILTERS.map((d) => (
                  <FilterChip key={d.key} active={filters.dietary.includes(d.key)} onClick={() => toggleDietary(d.key)}>
                    {d.label}
                  </FilterChip>
                ))}
                <span className="mx-2 hidden h-5 w-px bg-ink-900/15 sm:block" />
                <FilterChip active={filters.availableNow} onClick={() => setFilters((f) => ({ ...f, availableNow: !f.availableNow }))}>
                  Available now
                </FilterChip>
                <FilterChip active={filters.featured} onClick={() => setFilters((f) => ({ ...f, featured: !f.featured }))}>
                  Signature
                </FilterChip>
                {hasActiveFilters(filters) && (
                  <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className="ml-auto text-[13px] font-semibold text-chili-600 hover:underline">
                    Clear all
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div ref={contentRef} className="container-site py-10 lg:py-14">
        {searching && (
          <p className="mb-8 text-[15px] text-ink-700" role="status" aria-live="polite">
            {totalMatches === 0 ? (
              <>
                No items match <span className="font-semibold text-ink-900">“{deferredQuery}”</span>.
              </>
            ) : (
              <>
                {totalMatches} {totalMatches === 1 ? "item" : "items"} for <span className="font-semibold text-ink-900">“{deferredQuery}”</span> across the menu.
              </>
            )}
          </p>
        )}

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={searching ? "search" : active}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-20"
          >
            {visibleCategories.map((cat) => (
              <section key={cat.id} aria-labelledby={`cat-${cat.id}`} className="scroll-mt-40">
                <header className="mb-8 flex flex-col gap-4 border-b border-ink-900/10 pb-6 md:flex-row md:items-end md:justify-between">
                  <div className="max-w-3xl">
                    <h2 id={`cat-${cat.id}`} className="font-display text-[clamp(2.2rem,4.5vw,3.6rem)] leading-[1.02] tracking-[-0.01em] text-ink-900">
                      {cat.name}
                      {cat.tagline && <span className="text-chili-500">.</span>}
                    </h2>
                    {cat.tagline && <p className="mt-2 font-display text-xl italic text-ink-500">{cat.tagline}</p>}
                    {cat.hoursNote && <p className="mt-2 font-label text-[15px] tracking-[0.16em] text-chili-600">{cat.hoursNote}</p>}
                    {cat.description && <p className="mt-2 text-[16px] leading-relaxed text-ink-700">{cat.description}</p>}
                  </div>
                  <span className="text-[13px] text-ink-500">
                    {cat.itemCount} {cat.itemCount === 1 ? "item" : "items"}
                  </span>
                </header>

                {cat.itemCount === 0 && !searching && (
                  <div className="rounded-[22px] border border-dashed border-ink-900/15 p-10 text-center text-ink-500">
                    Nothing here matches your filters.{" "}
                    <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className="font-semibold text-chili-600 hover:underline">
                      Clear filters
                    </button>
                  </div>
                )}

                <div className="space-y-12">
                  {cat.sections.map((sec) => {
                    const isCollapsed = collapsed.has(sec.id);
                    const soloSection = cat.sections.length === 1 && (sec.name === cat.name || sec.description === cat.tagline);
                    return (
                      <section key={sec.id} aria-labelledby={soloSection ? `cat-${cat.id}` : `sec-${sec.id}`}>
                        {!soloSection && (
                          <div className="mb-5 flex items-end justify-between gap-4 border-b border-ink-900/10 pb-3">
                            <div>
                              <h3 id={`sec-${sec.id}`} className="font-display text-2xl text-ink-900">
                                {sec.name}
                              </h3>
                              {sec.description && sec.sectionType === "items" && <p className="mt-1 text-[14px] text-ink-500">{sec.description}</p>}
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleSection(sec.id)}
                              aria-expanded={!isCollapsed}
                              className="flex h-9 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-500 hover:bg-ink-900/5 lg:hidden"
                            >
                              {isCollapsed ? "Show" : "Hide"}
                              <svg viewBox="0 0 20 20" className={cn("h-4 w-4 transition-transform", !isCollapsed && "rotate-180")} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <path d="M5 8l5 5 5-5" />
                              </svg>
                            </button>
                          </div>
                        )}
                        {!isCollapsed &&
                          (sec.sectionType === "addons" && sec.linkedGroup ? (
                            <AddonsList group={sec.linkedGroup} description={sec.description} />
                          ) : (
                            <ul className="grid gap-3 xl:grid-cols-2">
                              {sec.items.map((item) => (
                                <li key={item.id}>
                                  <MenuItemRow item={item} availability={availability[item.id]} onOpen={openModal} />
                                </li>
                              ))}
                            </ul>
                          ))}
                      </section>
                    );
                  })}
                </div>
              </section>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <MenuItemModal item={openItem} availability={openItem ? availability[openItem.id] : undefined} onClose={closeModal} />
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-9 rounded-full border px-3.5 text-[13px] font-semibold transition-colors",
        active ? "border-ink-900 bg-ink-900 text-ivory-50" : "border-ink-900/12 bg-white text-ink-800 hover:border-ink-900/40",
      )}
    >
      {children}
    </button>
  );
}
