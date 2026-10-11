'use client';

import { Reveal } from '@/components/motion/Reveal';
import { useTranslations } from '@/features/marketing/shared';
import type { StatsData } from '../types';

/**
 * The page's only numbers block. Every figure comes from `stats`, so the page never shows two
 * different values for the same claim; a figure that is missing or too small is left out.
 */
export function ProofStrip({ stats }: { stats: StatsData }) {
  const t = useTranslations();
  const k = (key: string) => t(`marketing.landing.proof.${key}`);

  const facts = [
    stats.trustedIsps > 0 ? { value: `${stats.trustedIsps}+`, label: k('isps') } : null,
    stats.activeUsers >= 1000
      ? { value: `${Math.round(stats.activeUsers / 1000)}k+`, label: k('subscribers') }
      : null,
    stats.paymentsReconciled ? { value: stats.paymentsReconciled, label: k('payments') } : null,
    stats.uptimeSla ? { value: stats.uptimeSla, label: k('uptime') } : null,
  ].filter((fact) => fact !== null);

  if (facts.length === 0) return null;

  return (
    <section id="proof" className="relative z-[1] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="font-landing-display max-w-xl text-[clamp(1.75rem,1.2rem+2.2vw,2.75rem)] leading-[1.08] font-semibold tracking-[-0.03em] text-white">
            {k('title')}
          </h2>
          <p className="max-w-sm text-base leading-relaxed text-white/55">{k('desc')}</p>
        </Reveal>

        {/* Hairline grid: one surface split by 1px gaps instead of a box per number. */}
        <Reveal delay={0.08}>
          <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 lg:grid-cols-4">
            {facts.map((fact) => (
              <div
                key={fact.label}
                className="bg-landing-bg flex min-h-36 flex-col-reverse justify-between p-6 sm:min-h-44 sm:p-8"
              >
                <dt className="mt-6 text-sm text-white/55">{fact.label}</dt>
                <dd className="font-landing-display text-[clamp(2rem,1.4rem+2.4vw,3.25rem)] leading-none font-semibold tracking-[-0.04em] text-white tabular-nums">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
