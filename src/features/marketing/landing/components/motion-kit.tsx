'use client';

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef, type PointerEvent, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Small motion pieces for the landing. Each is transform-only, mouse-only where it reacts to the
 * pointer, and falls back to a plain element under reduced motion.
 */

/** Moves its content against the scroll by up to `offset` px, so layers at different offsets read as depth. */
export function Parallax({
  children,
  offset = 60,
  className,
}: {
  children: ReactNode;
  offset?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  return (
    <motion.div ref={ref} style={reduce ? undefined : { y }} className={className}>
      {children}
    </motion.div>
  );
}

/** Pulls its child a few pixels toward the mouse, springing back when it leaves. */
export function Magnetic({
  children,
  strength = 0.22,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const spring = { stiffness: 260, damping: 18, mass: 0.4 };
  const x = useSpring(0, spring);
  const y = useSpring(0, spring);
  const reduce = useReducedMotion();

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduce || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  }

  return (
    <motion.div
      style={{ x, y }}
      onPointerMove={onPointerMove}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      className={cn('inline-flex', className)}
    >
      {children}
    </motion.div>
  );
}

/** A block whose soft brand light drifts on its own and follows the mouse while it is over it. */
export function PointerGlow({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const node = ref.current;
    if (!node || event.pointerType !== 'mouse') return;
    const rect = node.getBoundingClientRect();
    // offsets from the glow's resting spot (50% / 70% of the block), applied with `translate`, not left/top
    node.style.setProperty('--dx', `${event.clientX - rect.left - rect.width * 0.5}px`);
    node.style.setProperty('--dy', `${event.clientY - rect.top - rect.height * 0.7}px`);
  }

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={() => {
        ref.current?.style.removeProperty('--dx');
        ref.current?.style.removeProperty('--dy');
      }}
      className={cn('relative isolate overflow-hidden', className)}
    >
      <span className="lp-glow -z-10" aria-hidden />
      {children}
    </div>
  );
}

/**
 * A heading's words slide up out of their line, one after another, as it scrolls into view. Pure CSS
 * (`.lp-word`, scroll-driven, no hydration wait); shown as plain text where unsupported.
 */
export function RevealWords({ text, className }: { text: string; className?: string }) {
  const words = text.split(' ');
  return (
    <span className={className}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`}>
          <span className="lp-word-mask -mb-[0.24em] inline-block overflow-hidden pb-[0.24em] align-bottom">
            <span className="lp-word inline-block" style={{ ['--i' as string]: index }}>
              {word}
            </span>
          </span>
          {index < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </span>
  );
}
