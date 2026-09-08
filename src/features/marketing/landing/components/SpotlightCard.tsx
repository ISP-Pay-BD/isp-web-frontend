'use client';

import { useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useMotionSafe } from '@/lib/animations';

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  as?: 'article' | 'div' | 'li';
}

/** Cursor spotlight border — modern interactive surface without heavy shaders. */
export function SpotlightCard({ children, className, as = 'article' }: SpotlightCardProps) {
  const { reduced } = useMotionSafe();
  const ref = useRef<HTMLElement>(null);
  const [spot, setSpot] = useState({ x: 50, y: 50, visible: false });

  const onMove = (e: MouseEvent) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setSpot({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      visible: true,
    });
  };

  const Comp = as;

  return (
    <Comp
      ref={ref as never}
      onMouseMove={onMove}
      onMouseLeave={() => setSpot((s) => ({ ...s, visible: false }))}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-white/10 bg-landing-panel transition-transform duration-500 ease-out will-change-transform hover:-translate-y-1',
        className,
      )}
      style={
        reduced
          ? undefined
          : {
              backgroundImage: spot.visible
                ? `radial-gradient(520px circle at ${spot.x}% ${spot.y}%, color-mix(in srgb, var(--landing-cta) 16%, transparent), transparent 42%)`
                : undefined,
            }
      }
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), inset 0 0 0 1px rgba(247,88,3,0.12)',
        }}
        aria-hidden
      />
      <div className="relative z-[1]">{children}</div>
    </Comp>
  );
}
