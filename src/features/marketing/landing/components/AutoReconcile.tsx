'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Reveal } from '@/components/motion/Reveal';
import { useMotionSafe, easeOutExpo } from '@/lib/animations';
import type { ReconcileStep } from '../types';
import { landingMedia } from '../media';
import { SpotlightCard } from './SpotlightCard';

interface AutoReconcileProps {
  steps: ReconcileStep[];
}

export function AutoReconcile({ steps }: AutoReconcileProps) {
  const cards = steps.slice(0, 3);
  const { reduced } = useMotionSafe();
  const lineRef = useRef<HTMLDivElement>(null);
  const inView = useInView(lineRef, { once: true, amount: 0.4 });

  return (
    <section id="auto-reconcile" className="relative z-[1] py-32 md:py-48">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal>
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-[#2E8BFF]">Flagship workflow</p>
            <h2 className="font-landing-display mt-3 text-[clamp(2rem,4.2vw,3.5rem)] font-semibold tracking-tight text-white text-balance">
              Every bKash & Nagad payment, matched in under a second
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/60 sm:text-lg">
              When a payment arrives, ISP Pay BD matches the TrxID to the open invoice, closes the
              bill, and reconnects MikroTik. No month-end spreadsheet work.
            </p>
          </div>
        </Reveal>

        <div ref={lineRef} className="relative mt-14">
          {!reduced ? (
            <div className="pointer-events-none absolute top-0 right-[8%] left-[8%] hidden h-px md:block" aria-hidden>
              <motion.div
                className="h-px origin-left bg-linear-to-r from-transparent via-landing-cta/70 to-transparent"
                initial={{ scaleX: 0 }}
                animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 1.1, ease: easeOutExpo, delay: 0.15 }}
              />
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-3 md:gap-5">
            {cards.map((step, index) => (
              <motion.div
                key={step.step}
                initial={reduced ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, delay: index * 0.12, ease: easeOutExpo }}
              >
                <SpotlightCard className="h-full">
                  <div className="relative aspect-4/3 overflow-hidden">
                    <div
                      className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
                      style={{
                        backgroundImage: `url('${landingMedia.reconcile[index] ?? landingMedia.reconcile[0]}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'grayscale(0.8) contrast(1.15) brightness(0.5)',
                        mixBlendMode: 'luminosity',
                      }}
                      aria-hidden
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-landing-panel via-landing-panel/30 to-transparent" />
                    <span className="absolute top-4 left-4 rounded-full border border-white/15 bg-landing-bg/70 px-2.5 py-1 font-mono text-[10px] text-landing-cta backdrop-blur-sm">
                      {String(index + 1).padStart(2, '0')} ·{' '}
                      {(['ingest', 'match', 'reconnect'] as const)[index] ?? 'step'}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-landing-display text-lg font-semibold text-white">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/55">{step.desc}</p>
                    <p className="mt-4 font-mono text-xs text-white/40">
                      {step.metricHighlight ?? step.metric}
                    </p>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="mt-10 font-mono text-xs text-white/40">
          Median match 780ms · False dispute rate &lt; 0.01% · bKash · Nagad · SSLCommerz
        </p>
      </div>
    </section>
  );
}
