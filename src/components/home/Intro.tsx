import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { SplitText } from "@/components/motion/SplitText";
import { Reveal } from "@/components/ui/Reveal";
import { Pill } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import type { MediaLite } from "@/lib/menu-types";

export function Intro({
  tagline,
  description,
  rating,
  reviewCount,
  priceRange,
  serviceTypes,
  images,
}: {
  tagline: string;
  description: string;
  rating: string | null;
  reviewCount: number | null;
  priceRange: string | null;
  serviceTypes: string[];
  images: { main: MediaLite | null; left: MediaLite | null; right: MediaLite | null };
}) {
  const parts = tagline.split(/\s*[·•|]\s*/).filter(Boolean);
  const lines = parts.map((text, i) => ({ text, className: i === parts.length - 1 ? "text-chili-300" : undefined }));
  return (
    <section id="story" className="relative scroll-mt-20 overflow-hidden bg-ink-950 py-24 text-ivory-50 lg:py-36">
      <div aria-hidden className="pointer-events-none absolute -right-40 top-10 h-[520px] w-[520px] rounded-full bg-chili-500/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-px w-[80%] -translate-x-1/2 bg-gradient-to-r from-transparent via-bronze-400/40 to-transparent" />
      <div className="container-site grid items-center gap-16 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <Reveal>
            <p className="eyebrow text-chili-300">The experience</p>
          </Reveal>
          <SplitText as="h2" animate={false} stagger={0.06} delay={0.1} lines={lines} className="mt-4 font-display text-[clamp(2.6rem,5vw,4.6rem)] leading-[0.98] tracking-[-0.01em]" />
          <Reveal delay={0.1}>
            <p className="mt-7 max-w-md text-[17px] leading-relaxed text-ivory-100/75">{description}</p>
          </Reveal>
          <Reveal delay={0.15}>
            <dl className="mt-8 grid grid-cols-2 gap-5 border-t border-ivory-50/10 pt-7 sm:grid-cols-3">
              {rating && (
                <div>
                  <dt className="font-label text-[13px] tracking-[0.2em] text-ivory-100/70">Rating</dt>
                  <dd className="mt-1.5 flex items-baseline gap-2">
                    <span className="font-display text-4xl leading-none">{rating}</span>
                    <svg viewBox="0 0 20 20" className="h-4 w-4 text-bronze-400" fill="currentColor" aria-hidden>
                      <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L10 14.9l-5.3 2.8 1.1-5.9L1.5 7.7l5.9-.8L10 1.5z" />
                    </svg>
                  </dd>
                  {reviewCount != null && <dd className="mt-1 text-[13px] text-ivory-100/70">{reviewCount.toLocaleString("en-US")} reviews</dd>}
                </div>
              )}
              {priceRange && (
                <div>
                  <dt className="font-label text-[13px] tracking-[0.2em] text-ivory-100/70">Price</dt>
                  <dd className="mt-1.5 font-display text-2xl leading-tight">{priceRange}</dd>
                </div>
              )}
              <div className="col-span-2 sm:col-span-1">
                <dt className="font-label text-[13px] tracking-[0.2em] text-ivory-100/70">Service</dt>
                <dd className="mt-2 flex flex-wrap gap-1.5">
                  {serviceTypes.map((s) => (
                    <Pill key={s} tone="neutral" className="h-7 px-3 normal-case tracking-normal text-[13px] font-medium">
                      {s}
                    </Pill>
                  ))}
                </dd>
              </div>
            </dl>
          </Reveal>
          <Reveal delay={0.2} className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/korean-bbq" variant="light" arrow>
              See Korean BBQ
            </ButtonLink>
            <ButtonLink href="/hot-pot" variant="glass">
              Explore Hot Pot
            </ButtonLink>
          </Reveal>
        </div>

        {/* Photo collage */}
        <div className="relative mx-auto w-full max-w-[560px] py-10 lg:col-span-7 lg:max-w-none lg:pl-8">
          {images.main && (
            <ParallaxImage
              src={images.main.file}
              alt={images.main.alt}
              sizes="(min-width: 1024px) 520px, 90vw"
              className="ml-auto aspect-[4/5] w-[86%] max-w-[520px] rounded-[28px] shadow-lift"
              speed={0.16}
              style={{ objectPosition: `${images.main.focalX}% ${images.main.focalY}%` }}
            >
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
              <span className="absolute inset-x-6 bottom-6 font-label text-[14px] tracking-[0.2em] text-ivory-50">{images.main.caption ?? images.main.alt}</span>
            </ParallaxImage>
          )}
          {images.left && (
            <ParallaxImage
              src={images.left.file}
              alt={images.left.alt}
              sizes="(min-width: 1024px) 260px, 40vw"
              className="absolute bottom-0 left-0 aspect-square w-[44%] max-w-[260px] rounded-[22px] shadow-lift ring-[10px] ring-ink-950"
              speed={0.3}
              reveal="left"
              style={{ objectPosition: `${images.left.focalX}% ${images.left.focalY}%` }}
            />
          )}
          {images.right && (
            <ParallaxImage
              src={images.right.file}
              alt={images.right.alt}
              sizes="(min-width: 1024px) 190px, 30vw"
              className="absolute right-0 top-0 aspect-[3/4] w-[30%] max-w-[190px] rounded-[20px] shadow-lift ring-[10px] ring-ink-950 lg:-right-4"
              speed={0.36}
              style={{ objectPosition: `${images.right.focalX}% ${images.right.focalY}%` }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
