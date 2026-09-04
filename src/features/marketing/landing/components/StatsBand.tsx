'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { Reveal } from '@/components/motion/Reveal';
import { useMotionSafe } from '@/lib/animations';
import type { StatsData } from '../types';

interface StatsBandProps {
  stats: StatsData;
}

function CountUp({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}) {
  const { reduced } = useMotionSafe();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [display, setDisplay] = useState(reduced ? value : 0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      const id = requestAnimationFrame(() => setDisplay(value));
      return () => cancelAnimationFrame(id);
    }
    const start = performance.now();
    const duration = 900;
    let cancelled = false;
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      if (!cancelled) setDisplay(value * eased);
      if (t < 1 && !cancelled) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [inView, value, reduced]);

  const formatted =
    decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString();

  return (
    <span ref={ref}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

export function StatsBand({ stats }: StatsBandProps) {
  const items = [
    {
      value: <CountUp value={stats.trustedIsps} suffix="+" />,
      label: 'ISPs on platform',
      sub: 'Nationwide coverage',
    },
    {
      value: <CountUp value={stats.activeUsers / 1000} suffix="k+" decimals={0} />,
      label: 'Subscribers billed',
      sub: 'Monthly active accounts',
    },
    {
      value: <CountUp value={99.98} suffix="%" decimals={2} />,
      label: 'Platform uptime',
      sub: 'Carrier-grade SLA',
    },
    {
      value: stats.paymentsReconciled,
      label: 'Payments matched',
      sub: 'Automated reconciliation',
    },
  ];

  return (
    <Reveal as="section" id="stats" className="relative py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="glass-panel-luxury relative overflow-hidden rounded-3xl p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* Subtle inner top glow */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-36 w-3/4 rounded-full bg-landing-cta/[0.08] blur-3xl" />
          
          <dl className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-6 relative z-10">
            {items.map((item, idx) => (
              <div 
                key={item.label} 
                className={`group ${idx < 3 ? 'md:border-r md:border-white/[0.08] md:pr-6' : ''}`}
              >
                <dt className="sr-only">{item.label}</dt>
                <dd>
                  <p className="font-landing-display text-2xl font-bold tracking-tight text-white transition-transform duration-200 group-hover:-translate-y-0.5 md:text-3xl lg:text-4xl text-gradient-silver">
                    {item.value}
                  </p>
                  <p className="mt-1.5 text-xs font-semibold text-white/80 md:text-sm">{item.label}</p>
                  <p className="text-[11px] text-white/40 hidden sm:block mt-0.5">{item.sub}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Reveal>
  );
}
