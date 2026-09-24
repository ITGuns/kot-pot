"use client";

import { motion, useReducedMotion } from "motion/react";

/** Re-mounts on every route change → soft page transition. */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  );
}
