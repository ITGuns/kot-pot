import Link from "next/link";
import type { Hours, RestaurantInfo } from "@/db/schema";
import { Wordmark } from "./Wordmark";
import { HoursTable } from "./HoursTable";
import { mapsUrl } from "@/lib/site";

const LINKS = [
  { href: "/menu", label: "Menu" },
  { href: "/korean-bbq", label: "Korean BBQ" },
  { href: "/hot-pot", label: "Hot Pot" },
  { href: "/gallery", label: "Gallery" },
  { href: "/visit", label: "Visit Us" },
  { href: "/book", label: "Book a Table" },
];

export function Footer({ restaurant: r, hours, phoneHref, todayDow }: { restaurant: RestaurantInfo; hours: Hours[]; phoneHref: string; todayDow: number }) {
  const year = new Date().getFullYear();
  const socials = [
    { href: r.instagramUrl, label: "Instagram" },
    { href: r.facebookUrl, label: "Facebook" },
    { href: r.tiktokUrl, label: "TikTok" },
    { href: r.yelpUrl, label: "Yelp" },
  ].filter((s) => s.href);
  return (
    <footer className="grain relative overflow-hidden border-t border-ivory-50/10 bg-ink-950 pb-28 pt-16 text-ivory-100 lg:pb-12 lg:pt-20">
      <div aria-hidden className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-chili-500/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-garnet-700/30 blur-3xl" />
      <div className="container-site relative z-[2] grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <Wordmark name={r.name} size="lg" />
          <p className="mt-4 max-w-sm font-label text-[14px] tracking-[0.2em] text-chili-300">{r.tagline}</p>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ivory-100/70">{r.description}</p>
          <address className="mt-6 not-italic text-[15px] leading-relaxed text-ivory-100/85">
            <a href={mapsUrl(r)} target="_blank" rel="noopener noreferrer" className="hover:text-ivory-50">
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
            <br />
            <a href={phoneHref} className="mt-2 inline-block hover:text-ivory-50">
              {r.phone}
            </a>
            {r.email && (
              <>
                <br />
                <a href={`mailto:${r.email}`} className="hover:text-ivory-50">
                  {r.email}
                </a>
              </>
            )}
          </address>
          {r.serviceTypes.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Service options">
              {r.serviceTypes.map((s) => (
                <li key={s} className="rounded-full border border-ivory-50/15 px-3 py-1 font-label text-[13px] tracking-[0.16em] text-ivory-100/80">
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-3">
          <h2 className="eyebrow text-chili-300">Explore</h2>
          <ul className="mt-5 space-y-3">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-[15px] text-ivory-100/85 transition hover:text-ivory-50">
                  {l.label}
                </Link>
              </li>
            ))}
            {socials.map((s) => (
              <li key={s.label}>
                <a href={s.href!} target="_blank" rel="noopener noreferrer" className="text-[15px] text-ivory-100/85 transition hover:text-ivory-50">
                  {s.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-4">
          <h2 className="eyebrow text-chili-300">Hours</h2>
          <HoursTable hours={hours} tone="dark" className="mt-4" todayDow={todayDow} />
          <Link href="/book" className="mt-5 inline-flex items-center gap-2 font-label text-[15px] tracking-[0.18em] text-ivory-50 hover:text-chili-300">
            Book a table <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
      <div className="container-site relative z-[2] mt-14 flex flex-col gap-3 border-t border-ivory-50/10 pt-6 text-[13px] text-ivory-100/70 sm:flex-row sm:items-center sm:justify-between">
        <span>
          © {year} {r.name}. {r.city}, {r.state}.
        </span>
        <Link href="/admin" className="hover:text-ivory-100/80">
          Staff login
        </Link>
      </div>
    </footer>
  );
}
