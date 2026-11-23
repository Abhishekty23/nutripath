"use client";

import { motion } from "motion/react";

type Props = {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  x?: number;
  className?: string;
  /** Quicker, subtler animation for app screens (dashboards) */
  fast?: boolean;
};

// Fades + slides its children in when they scroll into view (once).
export default function Reveal({ children, delay = 0, y = 30, x = 0, className, fast = false }: Props) {
  if (fast) {
    return (
      <motion.div
        className={className}
        initial={{ opacity: 0, y: Math.min(y, 10), x: 0 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 0.25, delay: Math.min(delay, 0.1) * 0.5, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    );
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
}
