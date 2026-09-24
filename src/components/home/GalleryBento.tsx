import Image from "next/image";
import Link from "next/link";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import type { MediaLite } from "@/lib/menu-types";
import { cn } from "@/lib/cn";

const SPANS = ["md:col-span-2 md:row-span-2", "md:col-span-1", "md:col-span-1", "md:col-span-2", "md:col-span-1", "md:col-span-1", "md:col-span-2"];

/** 4 tiles fill two rows of the 4-column grid and 7 fill three, so never leave a half-empty row. */
const tileCount = (n: number) => (n >= 7 ? 7 : Math.min(n, 4));

export function GalleryBento({ images }: { images: MediaLite[] }) {
  if (!images.length) return null;
  return (
    <section aria-labelledby="gallery-title" className="relative overflow-hidden bg-ink-950 py-24 text-ivory-50 lg:py-32">
      <div className="container-site">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <p className="eyebrow text-chili-300">Gallery</p>
            <h2 id="gallery-title" className="mt-4 font-display text-[clamp(2.6rem,5.5vw,4.8rem)] leading-[0.98]">
              Smoke, steam <em className="italic text-chili-300">&amp;</em> sizzle.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Link href="/gallery" className="group/btn inline-flex items-center gap-2 font-label text-[16px] tracking-[0.18em] text-ivory-100/85 hover:text-ivory-50">
              See all photos
              <span className="transition-transform group-hover/btn:translate-x-1">→</span>
            </Link>
          </Reveal>
        </div>
        <RevealGroup as="ul" className="mt-10 grid auto-rows-[220px] grid-cols-2 gap-3 md:auto-rows-[260px] md:grid-cols-4 md:gap-4" stagger={0.08}>
          {images.slice(0, tileCount(images.length)).map((img, i) => (
            <RevealItem as="li" key={img.id} className={cn("col-span-2 md:col-span-1", i === 0 && "row-span-2", i >= 4 && "hidden md:block", SPANS[i])}>
              <Link href={`/gallery?photo=${img.id}`} className="group relative block h-full w-full overflow-hidden rounded-[22px] bg-ink-800">
                <Image
                  src={img.file}
                  alt={img.alt}
                  fill
                  sizes={i === 0 ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"}
                  className="object-cover transition-transform duration-[1.4s] ease-out-expo group-hover:scale-[1.06]"
                  style={{ objectPosition: `${img.focalX}% ${img.focalY}%` }}
                />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-950/75 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="absolute inset-x-4 bottom-4 translate-y-2 text-[13px] font-medium leading-snug text-ivory-50 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">{img.caption ?? img.alt}</span>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
