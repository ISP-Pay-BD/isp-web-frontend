'use client';

import { motion, useScroll, useSpring } from 'framer-motion';
import { useMotionSafe } from '@/lib/animations';

/** Thin brand scroll progress — unique page-level motion cue. */
export function ScrollProgress() {
  const { reduced } = useMotionSafe();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });

  if (reduced) return null;

  return (
    <motion.div
      className="pointer-events-none fixed top-0 right-0 left-0 z-[60] h-[2px] origin-left bg-landing-cta"
      style={{ scaleX }}
      aria-hidden
    />
  );
}
