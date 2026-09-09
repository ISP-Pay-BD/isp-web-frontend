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
        'group relative overflow-hidden rounded-[2rem] bg-white/[0.03] p-1.5 ring-1 ring-white/10 backdrop-blur-xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform hover:-translate-y-1 hover:ring-white/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]',
        className,
      )}
      style={
        reduced
          ? undefined
          : {
              backgroundImage: spot.visible
                ? `radial-gradient(520px circle at ${spot.x}% ${spot.y}%, color-mix(in srgb, var(--landing-cta) 18%, transparent), transparent 45%)`
                : undefined,
            }
      }
    >
      <div className="relative z-[1] h-full w-full overflow-hidden rounded-[calc(2rem-0.375rem)] bg-landing-panel shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">
        {children}
      </div>
    </Comp>
  );
}
