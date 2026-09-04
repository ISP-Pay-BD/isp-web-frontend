'use client';

import { Reveal, RevealItem } from '@/components/motion/Reveal';
import type { ReconcileStep } from '../types';

interface AutoReconcileProps {
  steps: ReconcileStep[];
}

export function AutoReconcile({ steps }: AutoReconcileProps) {
  return (
    <section id="auto-reconcile" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-landing-cta">Flagship</p>
          <h2 className="font-landing-display mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Every bKash &amp; Nagad payment, matched in under a second.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/60">
            SMS lands → TrxID matched → invoice cleared → MikroTik reconnects. No month-end spreadsheet.
          </p>
        </Reveal>

        <Reveal stagger className="mt-14 grid gap-0 md:grid-cols-3">
          {steps.map((step, index) => (
            <RevealItem
              key={step.step}
              as="div"
              className={`group relative py-6 transition-transform duration-200 hover:-translate-y-1 md:px-6 md:py-0 ${
                index > 0 ? 'border-t border-white/[0.07] md:border-t-0 md:border-l' : ''
              }`}
            >
              <span className="font-mono text-xs text-landing-cta">{step.step}</span>
              <h3 className="font-landing-display mt-3 text-lg font-semibold text-white group-hover:text-landing-cta transition-colors">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{step.desc}</p>
              <p className="mt-4 font-mono text-xs text-emerald-400/90">
                {step.metricHighlight ?? step.metric}
              </p>
            </RevealItem>
          ))}
        </Reveal>

        <Reveal className="mt-10">
          <p className="font-mono text-xs text-white/40">
            Median match latency 780ms · False dispute rate &lt; 0.01% · bKash · Nagad · SSLCommerz
          </p>
        </Reveal>
      </div>
    </section>
  );
}
