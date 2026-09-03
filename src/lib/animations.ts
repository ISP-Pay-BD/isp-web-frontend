import type { Variants } from 'framer-motion';

/** Standard easing for smooth portal animations */
export const easeOutExpo = [0.25, 0.46, 0.45, 0.94] as const;

/** Stagger container — wrap parent with these variants */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

/** Fade up — use on child elements inside staggerContainer */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

/** Scale in — for cards and panels */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

/** Slide in from left */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

/** Slide in from right */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

/** Hover lift — apply via whileHover */
export const hoverLift = {
  y: -3,
  transition: { duration: 0.2 },
};

/** Tap feedback */
export const tapScale = {
  scale: 0.98,
  transition: { duration: 0.1 },
};
