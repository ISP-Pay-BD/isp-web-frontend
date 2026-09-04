'use client';

import type { ReconcileStep } from '../types';

interface AutoReconcileProps {
  steps: ReconcileStep[];
}

export function AutoReconcile({ steps }: AutoReconcileProps) {
  return (
    <section id="auto-reconcile" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-landing-cta">
            Flagship
          </p>
          <h2 className="font-landing-display mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Every bKash &amp; Nagad payment, matched in under a second.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/60">
            SMS lands → TrxID matched → invoice cleared → MikroTik reconnects. No month-end spreadsheet.
          </p>
        </div>

        <ol className="mt-14 grid gap-0 md:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step.step}
              className={`relative py-6 md:px-6 md:py-0 ${
                index > 0 ? 'border-t border-white/[0.07] md:border-t-0 md:border-l' : ''
              }`}
            >
              <span className="font-mono text-xs text-landing-cta">{step.step}</span>
              <h3 className="font-landing-display mt-3 text-lg font-semibold text-white">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{step.desc}</p>
              <p className="mt-4 font-mono text-xs text-emerald-400/90">
                {step.metricHighlight ?? step.metric}
              </p>
            </li>
          ))}
        </ol>

        <p className="mt-10 font-mono text-xs text-white/40">
          Median match latency 780ms · False dispute rate &lt; 0.01% · bKash · Nagad · SSLCommerz
        </p>
      </div>
    </section>
  );
}
