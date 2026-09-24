import { Magnetic } from "@/components/motion/Magnetic";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";

export function CtaBand({ title = "Grab a table tonight.", body, phone, phoneHref }: { title?: string; body?: string; phone: string; phoneHref: string }) {
  return (
    <section className="relative overflow-hidden bg-chili-600 py-20 text-ivory-50 lg:py-24">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_80%_at_20%_50%,rgb(250_245_234/0.18),transparent_60%)]" />
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-garnet-800/40 blur-3xl" />
      <div className="container-site relative z-[2] flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
        <Reveal>
          <h2 className="font-display text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.98]">{title}</h2>
          {body && <p className="mt-3 max-w-lg text-[16px] text-ivory-50">{body}</p>}
        </Reveal>
        <Reveal delay={0.1} className="flex flex-wrap gap-3">
          <Magnetic>
            <ButtonLink href="/book" variant="light" size="lg" arrow>
              Book a Table
            </ButtonLink>
          </Magnetic>
          <ButtonLink href={phoneHref} variant="outline" size="lg" className="text-ivory-50">
            Call {phone}
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
