'use client';

import {
  useCallback,
  useRef,
  useState,
  type ReactNode,
  type MouseEvent,
} from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useMotionSafe } from '@/lib/animations';

interface MagneticProps {
  children: ReactNode;
  /** Max pull in px (default 6) */
  strength?: number;
  className?: string;
}

export function Magnetic({ children, strength = 6, className }: MagneticProps) {
  const { reduced, springSoft: spring } = useMotionSafe();
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const onMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (reduced) return;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const x = ((e.clientX - cx) / (rect.width / 2)) * strength;
      const y = ((e.clientY - cy) / (rect.height / 2)) * strength;
      setOffset({ x, y });
    },
    [reduced, strength],
  );

  const onLeave = useCallback(() => setOffset({ x: 0, y: 0 }), []);

  if (reduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={cn('inline-flex will-change-transform', className)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      animate={{ x: offset.x, y: offset.y }}
      transition={spring}
    >
      {children}
    </motion.div>
  );
}
