"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Magnetic } from "@/components/motion/Magnetic";
import { SplitText } from "@/components/motion/SplitText";
import { StatusDot } from "@/components/site/Header";
import { SteamBackdrop } from "@/components/site/SteamBackdrop";
import { Wordmark } from "@/components/site/Wordmark";
import { ButtonLink } from "@/components/ui/Button";
import type { MediaLite } from "@/lib/menu-types";

const ease = [0.16, 1, 0.3, 1] as const;

/** Rising ember particles. Generated after mount so server and client markup match. */
function Embers({ count = 16 }: { count?: number }) {
  const reduce = useReducedMotion();
  const [embers, setEmbers] = useState<{ x: number; size: number; delay: number; duration: number; drift: number }[]>([]);
  useEffect(() => {
    setEmbers(
      Array.from({ length: count }, () => ({
        x: 6 + Math.random() * 88,
        size: 2 + Math.random() * 4,
        delay: Math.random() * 8,
        duration: 8 + Math.random() * 8,
        drift: (Math.random() - 0.5) * 90,
      })),
    );
  }, [count]);
  if (reduce) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[3] overflow-hidden">
      {embers.map((e, i) => (
        <motion.span
          key={i}
          className="absolute bottom-[-12px] rounded-full bg-chili-300"
          style={{ left: `${e.x}%`, width: e.size, height: e.size, boxShadow: "0 0 14px 3px rgb(244 160 132 / 0.55)" }}
          initial={{ y: "0vh", x: 0, opacity: 0 }}
          animate={{ y: ["0vh", "-95vh"], x: [0, e.drift], opacity: [0, 0.9, 0.7, 0] }}
          transition={{ duration: e.duration, delay: e.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}

export function Hero({
  name,
  tagline,
  headline,
  subheadline,
  image,
  status,
  addressShort,
}: {
  name: string;
  tagline: string;
  headline: string;
  subheadline: string | null;
  image: MediaLite | null;
  status: { isOpen: boolean; label: string; detail: string };
  addressShort: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "18%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.14]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "-16%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const sentences = headline.split(/(?<=[.!?])\s+/).filter(Boolean);
  const lines = sentences.map((text, i) => ({ text, className: i === sentences.length - 1 && sentences.length > 1 ? "italic text-chili-300" : undefined }));
  const taglineParts = tagline.split(/\s*[·•|]\s*/).filter(Boolean);

  return (
    <section ref={ref} className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-ink-950 text-ivory-50">
      <motion.div style={{ y: imgY, scale: imgScale }} className="absolute inset-0 -z-10 will-change-transform">
        {image && (
          <motion.div initial={reduce ? false : { opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.8, ease }} className="absolute inset-0">
            <Image src={image.file} alt={image.alt} fill priority fetchPriority="high" sizes="100vw" className="object-cover" style={{ objectPosition: `${image.focalX}% ${image.focalY}%` }} />
          </motion.div>
        )}
        <motion.div aria-hidden initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.6, delay: 0.2 }} className="absolute inset-0 bg-[radial-gradient(120%_80%_at_70%_20%,transparent_25%,rgb(10_9_8/0.6)_70%)]" />
        <motion.div aria-hidden initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.6, delay: 0.3 }} className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/55 to-ink-950/15" />
        <div aria-hidden className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-ink-950/75 to-transparent" />
      </motion.div>
      <SteamBackdrop intensity={0.85} />
      <Embers />
      <div aria-hidden className="grain absolute inset-0 -z-[4]" />

      <motion.div style={{ y: textY, opacity: textOpacity }} className="container-site relative z-10 pb-32 pt-40 lg:pb-28">
        <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } } }} className="max-w-4xl">
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 1, ease } } }}>
            <Wordmark name={name} size="xl" />
          </motion.div>

          <motion.p
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease, delay: 0.25 } } }}
            className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 font-label text-[15px] tracking-[0.26em] text-ivory-100/85 sm:text-[17px]"
          >
            {taglineParts.map((part, i) => (
              <span key={part} className="inline-flex items-center gap-3">
                {i > 0 && <span className="h-1.5 w-1.5 rounded-full bg-chili-400" aria-hidden />}
                {part}
              </span>
            ))}
          </motion.p>

          <SplitText as="h1" delay={0.5} lines={lines} className="mt-7 font-display text-[clamp(3.1rem,9.5vw,8rem)] leading-[0.92] tracking-[-0.015em] text-shadow-hero" />

          {subheadline && (
            <motion.p
              variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 1, ease, delay: 0.85 } } }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-ivory-100/85 md:text-xl"
            >
              {subheadline}
            </motion.p>
          )}

          <motion.div
            variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 1, ease, delay: 1 } } }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Magnetic>
              <ButtonLink href="/book" size="lg" arrow>
                Book a Table
              </ButtonLink>
            </Magnetic>
            <Magnetic strength={0.2}>
              <ButtonLink href="/menu" size="lg" variant="glass">
                Explore Menu
              </ButtonLink>
            </Magnetic>
          </motion.div>

          <motion.div
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 1.2, ease, delay: 1.15 } } }}
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-ivory-100/70"
          >
            <span className="inline-flex items-center gap-2">
              <StatusDot isOpen={status.isOpen} />
              <span className="font-semibold text-ivory-50">{status.label}</span>
              {status.detail && <span>· {status.detail}</span>}
            </span>
            <Link href="/visit" className="inline-flex items-center gap-2 hover:text-ivory-50">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-chili-300" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {addressShort}
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 right-8 hidden flex-col items-center gap-2 text-ivory-100/70 lg:flex"
      >
        <span className="eyebrow [writing-mode:vertical-rl]">Scroll</span>
        <span className="h-10 w-px overflow-hidden bg-ivory-100/20">
          <motion.span className="block h-full w-full bg-chili-400" animate={{ y: ["-100%", "100%"] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} />
        </span>
      </motion.div>
    </section>
  );
}
