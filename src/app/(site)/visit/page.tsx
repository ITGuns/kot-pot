import type { Metadata } from "next";
import { Visit } from "@/components/home/Visit";
import { CtaBand } from "@/components/restaurant/CtaBand";
import { getRestaurant } from "@/lib/data/restaurant";
import { fullAddress, getSiteChrome } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const r = await getRestaurant();
  return { title: "Visit Us", description: `${r.name} is at ${fullAddress(r)}. Call ${r.phone}. ${r.serviceTypes.join(", ")}.`, alternates: { canonical: "/visit" } };
}

export default async function VisitPage() {
  const { restaurant, hours, phoneHref, clock, status } = await getSiteChrome();
  return (
    <>
      <section className="grain relative overflow-hidden bg-ink-950 pb-4 pt-32 text-ivory-50 md:pt-40">
        <div aria-hidden className="pointer-events-none absolute -left-20 top-0 h-[420px] w-[420px] rounded-full bg-chili-500/15 blur-3xl" />
        <div className="container-site relative z-[2]">
          <p className="eyebrow text-chili-300">Visit us</p>
          <h1 className="mt-4 font-display text-[clamp(3rem,8vw,7rem)] leading-[0.92] tracking-[-0.01em]">
            Find us <em className="italic text-chili-300">—</em> visit tonight.
          </h1>
        </div>
      </section>
      <Visit restaurant={restaurant} hours={hours} phoneHref={phoneHref} todayDow={clock.dayOfWeek} status={status} tone="dark" compact={false} />
      <CtaBand phone={restaurant.phone} phoneHref={phoneHref} />
    </>
  );
}
