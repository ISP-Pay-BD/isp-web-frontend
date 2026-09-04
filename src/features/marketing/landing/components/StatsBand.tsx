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
      setDisplay(value);
      return;
    }
    const start = performance.now();
    const duration = 900;
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
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
    },
    {
      value: <CountUp value={stats.activeUsers / 1000} suffix="k+" decimals={0} />,
      label: 'Subscribers billed',
    },
    {
      value: <CountUp value={99.98} suffix="%" decimals={2} />,
      label: 'Platform uptime',
    },
    {
      value: stats.paymentsReconciled,
      label: 'Payments matched',
    },
  ];

  return (
    <Reveal as="section" id="stats" className="border-y border-white/[0.07] py-10 md:py-12">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <dl className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-6">
          {items.map((item) => (
            <div key={item.label} className="text-center md:text-left group">
              <dt className="sr-only">{item.label}</dt>
              <dd>
                <p className="font-landing-display text-2xl font-semibold tracking-tight text-white transition-transform duration-200 group-hover:-translate-y-0.5 md:text-3xl">
                  {item.value}
                </p>
                <p className="mt-1 text-xs text-white/45 md:text-sm">{item.label}</p>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Reveal>
  );
}
