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

interface GlareSurfaceProps {
  children: ReactNode;
  className?: string;
  /** Max glare opacity (0–1) */
  intensity?: number;
}

/** Marketing surfaces — glare position via DOM, no mousemove React state. */
export function GlareSurface({ children, className, intensity = 0.14 }: GlareSurfaceProps) {
  const { reduced, hoverLift: lift } = useMotionSafe();
  const ref = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  const onMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (reduced) return;
      const el = ref.current;
      const glare = glareRef.current;
      if (!el || !glare) return;
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        glare.style.setProperty('--glare-x', `${x}%`);
        glare.style.setProperty('--glare-y', `${y}%`);
        glare.style.opacity = String(intensity);
      });
    },
    [reduced, intensity],
  );

  const onLeave = useCallback(() => {
    cancelAnimationFrame(raf.current);
    if (glareRef.current) glareRef.current.style.opacity = '0';
  }, []);

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileHover={reduced ? undefined : lift}
      className={cn('relative overflow-hidden', className)}
    >
      {children}
      {!reduced && (
        <div
          ref={glareRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 mix-blend-overlay transition-opacity duration-300"
          style={
            {
              opacity: 0,
              '--glare-x': '50%',
              '--glare-y': '50%',
              background:
                'radial-gradient(500px circle at var(--glare-x) var(--glare-y), rgba(255,255,255,0.55), transparent 40%)',
            } as CSSProperties
          }
        />
      )}
    </motion.div>
  );
}
