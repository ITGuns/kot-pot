import type { Metadata } from "next";
import { Suspense } from "react";
import { MenuExplorer } from "@/components/menu/MenuExplorer";
import { Pill } from "@/components/ui/Badge";
import { itemAvailability, type AvailabilityInfo } from "@/lib/availability";
import { DAY_NAMES } from "@/lib/constants";
import { getMenuTree } from "@/lib/data/menu";
import { getRestaurant } from "@/lib/data/restaurant";
import { pageMeta } from "@/lib/seo";
import { getSiteChrome } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const [r, tree] = await Promise.all([getRestaurant(), getMenuTree()]);
  const cats = tree.categories.map((c) => c.name).join(", ");
  return pageMeta(r, { title: "Menu", description: `The ${r.name} menu: ${cats}. ${r.tagline} in ${r.city}, ${r.state}.`, path: "/menu" });
}

export default async function MenuPage({ searchParams }: { searchParams: Promise<{ category?: string; item?: string; q?: string }> }) {
  const [{ restaurant, hours, clock, status }, tree, params] = await Promise.all([getSiteChrome(), getMenuTree(), searchParams]);
  const availability: Record<number, AvailabilityInfo> = {};
  for (const cat of tree.categories) {
    for (const sec of cat.sections) {
      for (const item of sec.items) availability[item.id] = itemAvailability(item, cat, hours, clock);
    }
  }
  const itemCount = tree.categories.reduce((n, c) => n + c.sections.reduce((m, s) => m + s.items.length, 0), 0);

  return (
    <>
      <section className="grain relative overflow-hidden bg-ink-950 pb-12 pt-32 text-ivory-50 md:pt-40">
        <div aria-hidden className="pointer-events-none absolute -right-20 top-0 h-[420px] w-[420px] rounded-full bg-chili-500/15 blur-3xl" />
        <div className="container-site relative z-[2]">
          <p className="eyebrow text-chili-300">The menu</p>
          <h1 className="mt-4 font-display text-[clamp(2.8rem,7vw,6rem)] leading-[0.95] tracking-[-0.01em]">
            {tree.categories.map((c, i) => (
              <span key={c.id}>
                {i > 0 && " "}
                <span className={i === tree.categories.length - 1 ? "italic text-chili-300" : undefined}>{c.name}.</span>
              </span>
            ))}
          </h1>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Pill tone="light">
              <span className={`h-1.5 w-1.5 rounded-full ${status.isOpen ? "bg-jade-500" : "bg-chili-500"}`} />
              {status.label} · {status.detail}
            </Pill>
            <span className="text-[13px] text-ivory-100/60">
              {itemCount} items · {DAY_NAMES[clock.dayOfWeek]}
            </span>
          </div>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ivory-100/70">{restaurant.description}</p>
        </div>
      </section>
      <Suspense fallback={<div className="container-site py-20 text-ink-500">Loading menu…</div>}>
        <MenuExplorer categories={tree.categories} availability={availability} initialCategory={params.category} initialItem={params.item} initialQuery={params.q} />
      </Suspense>
    </>
  );
}
