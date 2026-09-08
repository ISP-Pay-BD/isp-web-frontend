'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import NumberFlow from '@number-flow/react';
import { Reveal } from '@/components/motion/Reveal';
import { useMotionSafe } from '@/lib/animations';
import type { StatsData } from '../types';

interface ProofBandProps {
  stats: StatsData;
}

export function ProofBand({ stats }: ProofBandProps) {
  const { reduced } = useMotionSafe();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.45 });

  const items = [
    { value: stats.trustedIsps, suffix: '+', label: 'ISP operators', kind: 'int' as const },
    {
      value: Math.round(stats.activeUsers / 1000),
      suffix: 'k+',
      label: 'Subscribers billed',
      kind: 'int' as const,
    },
    { value: 2, suffix: 'M+', label: 'Payments matched', kind: 'int' as const },
    { value: 99.9, suffix: '%', label: 'Platform uptime SLA', kind: 'float' as const },
  ];

  return (
    <section id="proof" ref={ref} className="relative z-[1] py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal>
          <div className="max-w-2xl">
            <h2 className="font-landing-display text-[clamp(1.5rem,3vw,2.25rem)] font-semibold tracking-tight text-white text-balance">
              From Dhaka to Rangpur, operators run on one reconciled ledger
            </h2>
            <p className="mt-3 text-base leading-relaxed text-white/60">
              {stats.trustedIsps}+ operators run billing, MikroTik provisioning, and bKash/Nagad
              reconciliation on one panel — live since 2020.
            </p>
          </div>
        </Reveal>

        <dl className="mt-10 grid grid-cols-2 gap-6 border-y border-white/10 py-8 md:grid-cols-4 md:gap-8">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={reduced ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
            >
              <dt className="text-xs text-white/45">{item.label}</dt>
              <dd className="font-landing-display mt-1 flex items-baseline text-3xl font-semibold tabular-nums text-white md:text-4xl">
                {reduced || !inView ? (
                  <>
                    {item.kind === 'float' ? item.value.toFixed(1) : item.value}
                    <span className="text-landing-cta">{item.suffix}</span>
                  </>
                ) : (
                  <>
                    <NumberFlow
                      value={item.value}
                      format={
                        item.kind === 'float'
                          ? { minimumFractionDigits: 1, maximumFractionDigits: 1 }
                          : undefined
                      }
                    />
                    <span className="text-landing-cta">{item.suffix}</span>
                  </>
                )}
              </dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  );
}
