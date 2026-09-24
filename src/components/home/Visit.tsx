import type { Hours, RestaurantInfo } from "@/db/schema";
import { HoursTable } from "@/components/site/HoursTable";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { fullAddress, mapsEmbedUrl, mapsUrl } from "@/lib/site";
import { cn } from "@/lib/cn";

export function Visit({
  restaurant: r,
  hours,
  phoneHref,
  todayDow,
  status,
  compact = false,
  tone = "light",
}: {
  restaurant: RestaurantInfo;
  hours: Hours[];
  phoneHref: string;
  todayDow: number;
  status?: { isOpen: boolean; label: string; detail: string };
  compact?: boolean;
  tone?: "light" | "dark";
}) {
  const light = tone === "light";
  return (
    <section id="visit" aria-labelledby="visit-title" className={cn("relative scroll-mt-20", light ? "bg-ivory-50 text-ink-900" : "bg-ink-950 text-ivory-50", compact ? "py-20 lg:py-28" : "py-24 lg:py-32")}>
      <div className="container-site grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal>
            <p className={cn("eyebrow", light ? "text-chili-600" : "text-chili-300")}>Find us</p>
            <h2 id="visit-title" className="mt-4 font-display text-[clamp(2.6rem,5.5vw,4.6rem)] leading-[0.98]">
              Visit <em className={cn("italic", light ? "text-chili-500" : "text-chili-300")}>tonight</em>.
            </h2>
            {status && (
              <p className={cn("mt-4 flex items-center gap-2 text-[15px]", light ? "text-ink-700" : "text-ivory-100/75")}>
                <span className={cn("inline-block h-2.5 w-2.5 rounded-full", status.isOpen ? "bg-jade-500" : "bg-chili-500")} />
                <span className={cn("font-semibold", light ? "text-ink-900" : "text-ivory-50")}>{status.label}</span>
                {status.detail && <span>· {status.detail}</span>}
              </p>
            )}
          </Reveal>
          <Reveal delay={0.1} className="mt-8 space-y-6">
            <div>
              <p className={cn("eyebrow", light ? "text-ink-500" : "text-ivory-100/70")}>Address</p>
              <a href={mapsUrl(r)} target="_blank" rel="noopener noreferrer" className={cn("mt-1 block font-display text-2xl leading-tight hover:text-chili-500", light ? "text-ink-900" : "text-ivory-50")}>
                {r.addressLine1}
                {r.addressLine2 && (
                  <>
                    <br />
                    {r.addressLine2}
                  </>
                )}
                <br />
                {r.city}, {r.state} {r.zip}
              </a>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className={cn("eyebrow", light ? "text-ink-500" : "text-ivory-100/70")}>Phone</p>
                <a href={phoneHref} className={cn("mt-1 block text-lg font-semibold hover:text-chili-500", light ? "text-ink-900" : "text-ivory-50")}>
                  {r.phone}
                </a>
              </div>
              {r.serviceTypes.length > 0 && (
                <div>
                  <p className={cn("eyebrow", light ? "text-ink-500" : "text-ivory-100/70")}>Service</p>
                  <p className={cn("mt-1 text-lg font-semibold", light ? "text-ink-900" : "text-ivory-50")}>{r.serviceTypes.join(" · ")}</p>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <ButtonLink href={mapsUrl(r)} variant={light ? "dark" : "light"} arrow>
                Get Directions
              </ButtonLink>
              <ButtonLink href={phoneHref} variant="outline" className={light ? "text-ink-900" : "text-ivory-50"}>
                Call
              </ButtonLink>
              <ButtonLink href="/book">Book a Table</ButtonLink>
            </div>
          </Reveal>
          {!compact && (
            <Reveal delay={0.15} className={cn("mt-10 border-t pt-6", light ? "border-ink-900/10" : "border-ivory-50/10")}>
              <p className={cn("eyebrow", light ? "text-ink-500" : "text-ivory-100/70")}>Hours</p>
              <HoursTable hours={hours} todayDow={todayDow} tone={tone} className="mt-2" />
            </Reveal>
          )}
        </div>
        <Reveal delay={0.1} className="lg:col-span-7" amount={0.2}>
          <div className={cn("relative h-[360px] overflow-hidden rounded-[28px] shadow-card sm:h-[460px] lg:h-full lg:min-h-[560px]", light ? "bg-ivory-200" : "bg-ink-800")}>
            <iframe
              title={`Map showing ${r.name} at ${fullAddress(r)}`}
              src={mapsEmbedUrl(r)}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className={cn("absolute inset-0 h-full w-full border-0", light ? "grayscale-[35%] contrast-[1.05]" : "grayscale-[60%] contrast-[1.1] brightness-[0.85]")}
              allowFullScreen
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
