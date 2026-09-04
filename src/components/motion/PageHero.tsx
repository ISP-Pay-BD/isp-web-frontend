'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  duration,
  easeOutExpo,
  heroStagger,
  pageContent,
  pageHero,
  useMotionSafe,
} from '@/lib/animations';

interface PageHeroProps {
  children: ReactNode;
  className?: string;
}

/** Page title / breadcrumb / actions — short enter on every route. */
export function PageHero({ children, className }: PageHeroProps) {
  const { reduced } = useMotionSafe();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      variants={heroStagger}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={pageHero}>{children}</motion.div>
    </motion.div>
  );
}

interface PageContentProps {
  children: ReactNode;
  className?: string;
}

/** Body below the hero — slight delayed fade so the header leads. */
export function PageContent({ children, className }: PageContentProps) {
  const { reduced } = useMotionSafe();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      variants={pageContent}
      initial="hidden"
      animate="show"
      transition={{ duration: duration.base, ease: easeOutExpo, delay: 0.04 }}
    >
      {children}
    </motion.div>
  );
}
