'use client';

import { useRef, type PointerEvent, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

const MAX_TILT_DEG = 6;

/**
 * The payment card leans toward the mouse and a soft sheen follows it. Mouse only (touch scrolls
 * normally), transform only, and skipped under reduced motion.
 */
export function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const node = ref.current;
    if (!node || event.pointerType !== 'mouse') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = node.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    node.style.setProperty('--rx', `${(0.5 - y) * MAX_TILT_DEG}deg`);
    node.style.setProperty('--ry', `${(x - 0.5) * MAX_TILT_DEG}deg`);
    node.style.setProperty('--sx', `${x * 100}%`);
    node.style.setProperty('--sy', `${y * 100}%`);
    node.dataset.tilting = 'true';
  }

  function onPointerLeave() {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty('--rx', '0deg');
    node.style.setProperty('--ry', '0deg');
    delete node.dataset.tilting;
  }

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={cn('lp-tilt', className)}
    >
      {children}
    </div>
  );
}
