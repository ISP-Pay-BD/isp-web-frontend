'use client';

import { useReducedMotion, type Transition, type Variants } from 'framer-motion';

/** Critically-damped ease — accelerate in, settle out */
export const easeOutExpo = [0.22, 1, 0.36, 1] as const;

export const duration = {
  fast: 0.15,
  base: 0.32,
  slow: 0.45,
} as const;

export const springSoft = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 28,
};

/** Page-level stagger — one orchestrated entrance */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.04 },
  },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.slow, ease: easeOutExpo },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: duration.base, ease: easeOutExpo },
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -12 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.36, ease: easeOutExpo },
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 12 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.36, ease: easeOutExpo },
  },
};

/** Fast soft route enter — tiny Y + opacity, never block on exit */
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: easeOutExpo },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.08, ease: easeOutExpo },
  },
};

/** Page title / breadcrumb / CTA cluster */
export const pageHero: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: easeOutExpo },
  },
};

/** Content below hero — one soft follow-up, not a long stagger chain */
export const pageContent: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.24, ease: easeOutExpo },
  },
};

export const heroStagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05, delayChildren: 0.02 },
  },
};

export const reveal: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.slow, ease: easeOutExpo },
  },
};

export const listItem: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.fast, ease: easeOutExpo },
  },
};

export const modal: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 8 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: duration.base, ease: easeOutExpo },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 6,
    transition: { duration: duration.fast, ease: easeOutExpo },
  },
};

export const overlay: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: duration.fast } },
  exit: { opacity: 0, transition: { duration: duration.fast } },
};

export const hoverLift = {
  y: -3,
  transition: { duration: 0.18, ease: easeOutExpo } as Transition,
};

export const hoverScale = {
  scale: 1.02,
  transition: { duration: 0.18, ease: easeOutExpo } as Transition,
};

export const tapScale = {
  scale: 0.98,
  transition: { duration: 0.1 } as Transition,
};

const reducedVariants: Variants = {
  hidden: {},
  show: {},
  exit: {},
};

/** Gate Framer transforms when OS prefers reduced motion */
export function useMotionSafe() {
  const reduced = useReducedMotion();
  return {
    reduced: !!reduced,
    fadeUp: reduced ? reducedVariants : fadeUp,
    reveal: reduced ? reducedVariants : reveal,
    pageTransition: reduced ? reducedVariants : pageTransition,
    pageHero: reduced ? reducedVariants : pageHero,
    pageContent: reduced ? reducedVariants : pageContent,
    heroStagger: reduced ? reducedVariants : heroStagger,
    staggerContainer: reduced ? reducedVariants : staggerContainer,
    listItem: reduced ? reducedVariants : listItem,
    modal: reduced ? reducedVariants : modal,
    overlay: reduced ? reducedVariants : overlay,
    hoverLift: reduced ? undefined : hoverLift,
    hoverScale: reduced ? undefined : hoverScale,
    tapScale: reduced ? undefined : tapScale,
    springSoft: reduced ? { duration: 0 } : springSoft,
  };
}
