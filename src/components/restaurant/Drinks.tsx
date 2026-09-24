import Link from "next/link";
import type { MenuItemLite } from "@/lib/menu-types";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { money } from "@/lib/format";

export function Drinks({ cocktails, beerSake, cocktailsTagline, beerTagline }: { cocktails: MenuItemLite[]; beerSake: MenuItemLite[]; cocktailsTagline: string | null; beerTagline: string | null }) {
  if (!cocktails.length && !beerSake.length) return null;
  return (
    <section id="drinks" aria-labelledby="drinks-title" className="grain relative scroll-mt-24 overflow-hidden bg-garnet-800 py-24 text-ivory-50 lg:py-32">
      <div aria-hidden className="liquid-blob left-[-10%] top-[-10%] h-[520px] w-[520px] bg-chili-500/30" />
      <div aria-hidden className="liquid-blob bottom-[-20%] right-[-5%] h-[460px] w-[460px] bg-bronze-400/20 [animation-delay:-8s]" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-bronze-300/40 to-transparent" />
      <div className="container-site relative z-[2] grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="eyebrow text-bronze-300">Cocktails</p>
            <h2 id="drinks-title" className="mt-4 font-display text-[clamp(2.6rem,5.5vw,4.8rem)] leading-[0.98]">
              {cocktailsTagline ?? "Signature pours"}
              <span className="text-bronze-300">.</span>
            </h2>
          </Reveal>
          <RevealGroup as="ol" className="mt-10 divide-y divide-ivory-50/10 border-y border-ivory-50/10" stagger={0.06}>
            {cocktails.map((c, i) => (
              <RevealItem as="li" key={c.id}>
                <Link href={`/menu?item=${c.slug}`} className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 py-5 transition-colors hover:bg-ivory-50/5 sm:gap-6 sm:px-3">
                  <span className="font-label text-[15px] tracking-[0.2em] text-bronze-300/80">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="block font-display text-[1.75rem] leading-[1.05] text-ivory-50 transition-transform duration-500 group-hover:translate-x-1">{c.name}</span>
                    {c.description && <span className="mt-1 block text-[14.5px] text-ivory-100/65">{c.description}</span>}
                  </span>
                  {c.price != null && <span className="font-label text-2xl tracking-wide text-ivory-50 transition-transform duration-500 group-hover:-translate-x-1">{money(c.price)}</span>}
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
        <div className="lg:col-span-5 lg:pl-6">
          <Reveal delay={0.1}>
            <p className="eyebrow text-bronze-300">Beer &amp; sake</p>
            <p className="mt-3 font-display text-2xl italic text-ivory-100/80">{beerTagline ?? "Cold pours, warm bowls"}</p>
          </Reveal>
          <RevealGroup as="ul" className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-1" stagger={0.05}>
            {beerSake.map((b) => (
              <RevealItem as="li" key={b.id}>
                <Link href={`/menu?item=${b.slug}`} className="group flex items-center justify-between gap-4 rounded-2xl border border-ivory-50/10 bg-ivory-50/5 px-4 py-3 transition-colors hover:border-bronze-300/50 hover:bg-ivory-50/10">
                  <span className="text-[15px] font-semibold text-ivory-50">{b.name}</span>
                  {b.price != null && <span className="font-label text-xl tracking-wide text-bronze-300">{money(b.price)}</span>}
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
          <Reveal delay={0.15} className="mt-8">
            <ButtonLink href="/menu?category=cocktails" variant="light" arrow>
              Full drinks list
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
