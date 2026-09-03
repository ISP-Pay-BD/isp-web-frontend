'use client';

import { type ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';

// Default container variants with stagger
const defaultContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

// Default item variants with spring animation
const defaultItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

// Fade up variant
const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 20,
    },
  },
};

// Scale in variant
const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

// Slide in from left
const slideInLeftVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

// Slide in from right
const slideInRightVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

export type AnimationType = 'default' | 'fadeUp' | 'scaleIn' | 'slideInLeft' | 'slideInRight';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  animation?: AnimationType;
  stagger?: boolean;
  delay?: number;
}

const getVariants = (animation: AnimationType): Variants => {
  switch (animation) {
    case 'fadeUp':
      return fadeUpVariants;
    case 'scaleIn':
      return scaleInVariants;
    case 'slideInLeft':
      return slideInLeftVariants;
    case 'slideInRight':
      return slideInRightVariants;
    default:
      return defaultItemVariants;
  }
};

/**
 * PageTransition - Wraps page content with smooth entrance animations
 * 
 * Usage:
 * ```tsx
 * <PageTransition>
 *   <div>Content 1</div>
 *   <div>Content 2</div>
 * </PageTransition>
 * ```
 * 
 * With custom animation:
 * ```tsx
 * <PageTransition animation="fadeUp">
 *   <div>Content</div>
 * </PageTransition>
 * ```
 */
export function PageTransition({
  children,
  className,
  animation = 'default',
  stagger = true,
  delay = 0,
}: PageTransitionProps) {
  const containerVariants: Variants = stagger
    ? {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.06,
            delayChildren: delay,
          },
        },
      }
    : {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { delay },
        },
      };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
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

/**
 * AnimatedSection - Wraps individual sections with animation
 * Must be used inside a PageTransition container
 * 
 * Usage:
 * ```tsx
 * <PageTransition>
 *   <AnimatedSection>
 *     <Card>...</Card>
 *   </AnimatedSection>
 *   <AnimatedSection>
 *     <Card>...</Card>
 *   </AnimatedSection>
 * </PageTransition>
 * ```
 */
export function AnimatedSection({
  children,
  className,
  animation = 'default',
}: AnimatedSectionProps) {
  const variants = getVariants(animation);

  return (
    <motion.div variants={variants} className={className}>
      {children}
    </motion.div>
  );
}

// Export variants for direct use in custom components
export {
  defaultContainerVariants,
  defaultItemVariants,
  fadeUpVariants,
  scaleInVariants,
  slideInLeftVariants,
  slideInRightVariants,
};
