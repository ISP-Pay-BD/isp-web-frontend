'use client';

import { type ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  fadeUp,
  scaleIn,
  slideInLeft,
  slideInRight,
  heroStagger,
  pageContent,
  pageHero,
  useMotionSafe,
} from '@/lib/animations';

export type AnimationType = 'default' | 'fadeUp' | 'scaleIn' | 'slideInLeft' | 'slideInRight';

const getVariants = (animation: AnimationType): Variants => {
  switch (animation) {
    case 'fadeUp':
      return fadeUp;
    case 'scaleIn':
      return scaleIn;
    case 'slideInLeft':
      return slideInLeft;
    case 'slideInRight':
      return slideInRight;
    default:
      return fadeUp;
  }
};

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  animation?: AnimationType;
  stagger?: boolean;
  delay?: number;
}

/**
 * Light page enter for sections that opt in.
 * AppShell owns route opacity; this owns hero → content stagger (short).
 */
export function PageTransition({
  children,
  className,
  stagger = true,
  delay = 0,
}: PageTransitionProps) {
  const { reduced } = useMotionSafe();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={
        stagger
          ? {
              ...heroStagger,
              show: {
                transition: { staggerChildren: 0.05, delayChildren: delay },
              },
            }
          : pageHero
      }
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  animation?: AnimationType;
}

export function AnimatedSection({
  children,
  className,
  animation = 'default',
}: AnimatedSectionProps) {
  const { reduced } = useMotionSafe();
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      variants={animation === 'default' ? pageContent : getVariants(animation)}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export {
  heroStagger as defaultContainerVariants,
  pageHero as defaultItemVariants,
  pageHero as fadeUpVariants,
  scaleIn as scaleInVariants,
  slideInLeft as slideInLeftVariants,
  slideInRight as slideInRightVariants,
};
