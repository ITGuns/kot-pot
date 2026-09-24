"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { useFinePointer } from "./useFinePointer";
import { cn } from "@/lib/cn";

/** Subtle 3D tilt + moving highlight on hover. Falls back to a plain div on touch. */
export function TiltCard({ children, className, max = 6, glare = true }: { children: React.ReactNode; className?: string; max?: number; glare?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 260, damping: 22 });
  const ry = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 260, damping: 22 });
  const glareX = useTransform(px, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(py, [0, 1], ["0%", "100%"]);
  const glareBg = useTransform([glareX, glareY], ([gx, gy]) => `radial-gradient(400px circle at ${gx} ${gy}, rgb(255 255 255 / 0.16), transparent 45%)`);

  const onMove = (e: React.MouseEvent) => {
    if (!fine || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const reset = () => {
    px.set(0.5);
    py.set(0.5);
  };

  if (!fine) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d", transformPerspective: 1100 }}
      className={cn("relative", className)}
    >
      {children}
      {glare && <motion.div aria-hidden className="pointer-events-none absolute inset-0 z-[5] rounded-[inherit] opacity-0 transition-opacity duration-500 [.group:hover_&]:opacity-100" style={{ background: glareBg }} />}
    </motion.div>
  );
}
