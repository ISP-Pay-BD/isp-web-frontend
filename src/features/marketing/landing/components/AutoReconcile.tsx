import { CheckCircle2 } from 'lucide-react';
import type { ReconcileStep } from '../types';

interface AutoReconcileProps {
  steps: ReconcileStep[];
}

export function AutoReconcile({ steps }: AutoReconcileProps) {
  return (
    <section id="auto-reconcile" className="border-t border-white/10 bg-landing-panel/50 py-20 md:py-28 relative">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-landing-cta/30 bg-landing-cta/10 px-3.5 py-1 text-xs font-semibold text-landing-cta">
            <span className="h-2 w-2 rounded-full bg-landing-cta animate-ping" />
            Flagship Capability
          </span>
          <h2 className="font-landing-display mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Every bKash &amp; Nagad payment, matched in under a second.
          </h2>
          <p className="mt-4 text-base text-white/70 leading-relaxed">
            The payment SMS lands — we read the TrxID and mobile number, find the subscriber, clear the invoice, and tell MikroTik to reconnect. No month-end spreadsheet, no manual matching, no angry call about a payment that already arrived.
          </p>
        </div>

        {/* 3 Step Flow */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-7 backdrop-blur-sm transition-all hover:border-landing-cta/40 hover:bg-white/[0.04]"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-landing-cta">
                  <span>{step.step}</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                </div>

                <h3 className="font-landing-display mt-4 text-xl font-bold text-white">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-white/65">
                  {step.desc}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs font-mono">
                <span className="text-white/50">Benchmark:</span>
                <span className="rounded bg-white/10 px-2 py-0.5 font-semibold text-emerald-400">
                  {step.metricHighlight ?? step.metric}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Live Reconcile Indicator Strip */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs text-white/75">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Active Webhook Listeners: bKash (v1.2.0-beta), Nagad, SSLCommerz
          </span>
          <span className="hidden sm:inline text-white/30">•</span>
          <span className="font-mono text-landing-accent">Median Match Latency: 780ms</span>
          <span className="hidden sm:inline text-white/30">•</span>
          <span className="text-white/60">False Dispute Rate: &lt; 0.01%</span>
        </div>
      </div>
    </section>
  );
}
