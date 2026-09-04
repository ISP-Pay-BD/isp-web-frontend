import type { Variants } from 'framer-motion';

/** Critically-damped ease — accelerate in, settle out */
export const easeOutExpo = [0.22, 1, 0.36, 1] as const;

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
    transition: { duration: 0.38, ease: easeOutExpo },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.32, ease: easeOutExpo },
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

export const hoverLift = {
  y: -2,
  transition: { duration: 0.18, ease: easeOutExpo },
};

export const tapScale = {
  scale: 0.985,
  transition: { duration: 0.1 },
};
