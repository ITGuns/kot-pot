"use client";

import Image, { type ImageProps } from "next/image";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * Scroll-linked parallax with a clip-path wipe reveal on first view.
 * The observed wrapper is never clipped (a clipped element reports zero
 * intersection), so the reveal is animated on an inner layer.
 * `speed` is the total vertical travel as a fraction of the image height.
 */
export function ParallaxImage({
  className,
  imgClassName,
  speed = 0.14,
  reveal = "up",
  children,
  style,
  ...img
}: ImageProps & { className?: string; imgClassName?: string; speed?: number; reveal?: "up" | "left" | "none"; children?: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`${-speed * 50}%`, `${speed * 50}%`]);

  const animated = !reduce && reveal !== "none";
  const hidden = reveal === "left" ? "inset(0% 100% 0% 0%)" : "inset(100% 0% 0% 0%)";
  const shown = "inset(0% 0% 0% 0%)";
  const positioned = /\b(absolute|fixed)\b/.test(className ?? "");

  return (
    <div ref={ref} className={cn("overflow-hidden", !positioned && "relative", className)}>
      <motion.div
        className="absolute inset-0"
        initial={animated ? { clipPath: hidden } : false}
        animate={{ clipPath: animated && !inView ? hidden : shown }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div style={reduce ? undefined : { y }} className="absolute -inset-y-[10%] inset-x-0 will-change-transform">
          <Image {...img} fill className={cn("object-cover", imgClassName)} alt={img.alt} style={style} />
        </motion.div>
      </motion.div>
      {children}
    </div>
  );
}
