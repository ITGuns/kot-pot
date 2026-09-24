"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

const variants: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] },
  }),
};

export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
  amount = 0.25,
  id,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span" | "p" | "h2" | "h3" | "figure";
  amount?: number;
  id?: string;
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as] as typeof motion.div;
  if (reduce) {
    const Plain = as as keyof React.JSX.IntrinsicElements;
    return (
      <Plain className={className} id={id}>
        {children}
      </Plain>
    );
  }
  return (
    <Tag id={id} className={className} variants={variants} initial="hidden" whileInView="show" viewport={{ once: true, amount }} custom={delay}>
      {children}
    </Tag>
  );
}

/** Staggers direct children */
export function RevealGroup({ children, className, stagger = 0.08, as = "div" }: { children: ReactNode; className?: string; stagger?: number; as?: "div" | "ul" | "ol" }) {
  const reduce = useReducedMotion();
  const Tag = motion[as] as typeof motion.div;
  const Plain = as as keyof React.JSX.IntrinsicElements;
  if (reduce) return <Plain className={className}>{children}</Plain>;
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </Tag>
  );
}

export function RevealItem({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: "div" | "li" }) {
  const Tag = motion[as] as typeof motion.div;
  return (
    <Tag className={className} variants={variants}>
      {children}
    </Tag>
  );
}
