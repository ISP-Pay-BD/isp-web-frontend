'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useMotionSafe } from '@/lib/animations';

interface RevealProps {
  children: ReactNode;
  className?: string;
  stagger?: boolean;
  delay?: number;
  as?: 'div' | 'section' | 'ul' | 'ol' | 'li';
  id?: string;
}

export function Reveal({
  children,
  className,
  stagger = false,
  delay = 0,
  as = 'div',
  id,
}: RevealProps) {
  const { reduced, reveal: revealV, staggerContainer: staggerV } = useMotionSafe();
  const Comp = motion[as];

  return (
    <Comp
      id={id}
      className={cn(className)}
      variants={stagger ? staggerV : revealV}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.05, margin: '0px 0px -40px 0px' }}
      transition={reduced ? { duration: 0 } : { delay }}
    >
      {children}
    </Comp>
  );
}

export function RevealItem({
  children,
  className,
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'li' | 'span';
}) {
  const { reveal: revealV } = useMotionSafe();
  const Comp = motion[as];
  return (
    <Comp className={className} variants={revealV}>
      {children}
    </Comp>
  );
}
