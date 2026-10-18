'use client';

import { useScroll } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { FiberSceneEngine, FiberSceneVariant } from './fiber-scene-engine';
import { canRender3d } from './webgl-support';

/**
 * The 3D layer (coins, glass, fiber pulses) behind the hero or the closing CTA. Capable desktops only;
 * three.js is fetched when the block nears the viewport, and the loop pauses whenever it is off
 * screen. Everyone else sees the CSS atmosphere underneath, so nothing depends on it.
 */
export function FiberScene({
  variant,
  className,
}: {
  variant: FiberSceneVariant;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { scrollYProgress } = useScroll({ target: canvasRef, offset: ['start end', 'end start'] });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canRender3d()) return;

    let engine: FiberSceneEngine | null = null;
    let loading = false;
    let visible = false;
    let cancelled = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !engine && !loading) {
          loading = true;
          Promise.all([import('./fiber-scene-engine'), document.fonts.ready])
            .then(([{ createFiberSceneEngine }]) => {
              if (cancelled) return;
              // Progress runs 0 → 1 across the whole pass; the scene only reacts to the second half.
              engine = createFiberSceneEngine({
                canvas,
                variant,
                getScroll: () => Math.max(0, scrollYProgress.get() - 0.5) * 2,
              });
              setReady(true);
              if (visible) engine.start();
            })
            .catch((error: unknown) => console.error('Landing 3D scene could not start.', error));
        } else if (visible) {
          engine?.start();
        } else {
          engine?.stop();
        }
      },
      { rootMargin: '25% 0px' },
    );
    observer.observe(canvas);

    return () => {
      cancelled = true;
      observer.disconnect();
      engine?.dispose();
    };
  }, [scrollYProgress, variant]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn(
        'pointer-events-none transition-opacity duration-1000',
        ready ? 'opacity-100' : 'opacity-0',
        className,
      )}
    />
  );
}
