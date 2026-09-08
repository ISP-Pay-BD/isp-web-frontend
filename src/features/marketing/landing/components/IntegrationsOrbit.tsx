'use client';

import { motion } from 'framer-motion';
import { Reveal } from '@/components/motion/Reveal';
import { useMotionSafe } from '@/lib/animations';
import type { IntegrationItem } from '../types';

interface IntegrationsOrbitProps {
  integrations: IntegrationItem[];
}

const CORE_RAILS = [
  { name: 'MikroTik', detail: 'Real-time PPPoE + hotspot sync' },
  { name: 'bKash', detail: 'Send Money matched in under a second' },
  { name: 'Nagad', detail: 'Same auto-reconciliation, same speed' },
] as const;

export function IntegrationsOrbit({ integrations }: IntegrationsOrbitProps) {
  const { reduced } = useMotionSafe();
  const loop = [...integrations, ...integrations];

  return (
    <section id="integrations" className="relative z-[1] overflow-hidden border-t border-white/10 py-32 md:py-48">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal>
          <div className="max-w-2xl">
            <h2 className="font-landing-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Wired into the rails your business already runs on
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/60">
              Native MikroTik control, bKash and Nagad send-money auto-reconciliation, SMS and OLT —
              the Bangladesh stack, not bolted-on plugins.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {CORE_RAILS.map((rail, i) => (
            <motion.article
              key={rail.name}
              initial={reduced ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="rounded-2xl border border-white/10 bg-landing-panel/80 p-5 backdrop-blur-sm transition-colors hover:border-landing-cta/30"
            >
              <p className="text-[11px] font-medium tracking-wide text-[#2E8BFF]">Core rail</p>
              <h3 className="font-landing-display mt-2 text-xl font-semibold text-white">{rail.name}</h3>
              <p className="mt-2 text-sm text-white/55">{rail.detail}</p>
            </motion.article>
          ))}
        </div>
      </div>

      <div className="relative mt-16">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-landing-bg to-transparent md:w-28"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-landing-bg to-transparent md:w-28"
          aria-hidden
        />
        <div
          className={`flex w-max gap-8 pr-8 ${
            reduced ? '' : 'animate-[lp-marquee_48s_linear_infinite]'
          }`}
        >
          {loop.map((item, i) => (
            <span
              key={`${item.name}-${i}`}
              className="shrink-0 rounded-full border border-white/10 bg-white/4 px-4 py-2 text-sm text-white/55"
            >
              {item.name}
              <span className="ml-2 text-white/30">{item.category}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
