import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { SplitText } from "@/components/motion/SplitText";
import type { MediaLite } from "@/lib/menu-types";

/** Full-bleed hero used on the Korean BBQ, Hot Pot and Gallery pages. */
export function PageHero({ eyebrow, title, accent, body, image, children }: { eyebrow: string; title: string; accent?: string; body?: string; image: MediaLite | null; children?: React.ReactNode }) {
  const lines = [{ text: title }, ...(accent ? [{ text: accent, className: "italic text-chili-300" }] : [])];
  return (
    <section className="relative isolate overflow-hidden bg-ink-950 text-ivory-50">
      {image ? (
        <ParallaxImage src={image.file} alt={image.alt} sizes="100vw" priority className="h-[72svh] min-h-[520px] w-full rounded-none" speed={0.3} reveal="none" style={{ objectPosition: `${image.focalX}% ${image.focalY}%` }}>
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/45 to-ink-950/35" />
          <div className="container-site absolute inset-x-0 bottom-0 z-[2] pb-14 lg:pb-20">
            <p className="eyebrow text-chili-300">{eyebrow}</p>
            <SplitText as="h1" delay={0.2} lines={lines} className="mt-3 font-display text-[clamp(3rem,8.5vw,7.5rem)] leading-[0.92] tracking-[-0.01em] text-shadow-hero" />
            {body && <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-ivory-100/85">{body}</p>}
            {children}
          </div>
        </ParallaxImage>
      ) : (
        <div className="container-site pb-14 pt-36 lg:pb-20 lg:pt-44">
          <p className="eyebrow text-chili-300">{eyebrow}</p>
          <SplitText as="h1" delay={0.2} lines={lines} className="mt-3 font-display text-[clamp(3rem,8.5vw,7.5rem)] leading-[0.92] tracking-[-0.01em]" />
          {body && <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-ivory-100/85">{body}</p>}
          {children}
        </div>
      )}
    </section>
  );
}
