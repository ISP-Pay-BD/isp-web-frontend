'use client';

import {
  useCallback,
  useRef,
  type CSSProperties,
  type ReactNode,
  type MouseEvent,
} from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useMotionSafe } from '@/lib/animations';

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  /** Disable lift / tap (still allows spotlight wash) */
  static?: boolean;
  onClick?: () => void;
}

/**
 * Featured KPI / triage surfaces only.
 * Pointer position updates CSS vars via DOM — no React re-renders on mousemove.
 */
export function SpotlightCard({
  children,
  className,
  static: isStatic,
  onClick,
}: SpotlightCardProps) {
  const { reduced, hoverLift: lift, tapScale: tap } = useMotionSafe();
  const ref = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  const onMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (reduced) return;
      const el = ref.current;
      const spot = spotRef.current;
      if (!el || !spot) return;
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        spot.style.setProperty('--spot-x', `${x}%`);
        spot.style.setProperty('--spot-y', `${y}%`);
        spot.style.opacity = '1';
      });
    },
    [reduced],
  );

  const onLeave = useCallback(() => {
    cancelAnimationFrame(raf.current);
    if (spotRef.current) spotRef.current.style.opacity = '0';
  }, []);

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
      whileHover={!isStatic && !reduced ? lift : undefined}
      whileTap={!isStatic && !reduced ? tap : undefined}
      className={cn(
        'relative overflow-hidden rounded-xl bg-card transition-shadow duration-200',
        !isStatic && 'hover:shadow-md',
        className,
      )}
    >
      {!reduced && (
        <div
          ref={spotRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-200"
          style={
            {
              opacity: 0,
              '--spot-x': '50%',
              '--spot-y': '50%',
              background:
                'radial-gradient(420px circle at var(--spot-x) var(--spot-y), color-mix(in oklch, var(--primary) 12%, transparent), transparent 55%)',
            } as CSSProperties
          }
        />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
