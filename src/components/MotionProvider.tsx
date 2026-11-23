"use client";

import { MotionConfig } from "motion/react";

// Turns animations off for visitors who chose "reduce motion" in their OS settings.
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
