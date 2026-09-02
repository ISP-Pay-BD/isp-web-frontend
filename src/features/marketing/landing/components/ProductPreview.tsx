'use client';

import { useState } from 'react';
import { CheckCircle, Layers, Activity } from 'lucide-react';
import type { ProductPreviewTab } from '../types';

interface ProductPreviewProps {
  tabs: ProductPreviewTab[];
}

export function ProductPreview({ tabs }: ProductPreviewProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? 'billing');
  const currentTab = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  return (
    <section id="product-preview" className="py-20 md:py-28 relative overflow-hidden bg-[#0c0118]">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-landing-accent">
            Interactive Product Tour
          </span>
          <h2 className="font-landing-display mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            See the operator console in action
          </h2>
          <p className="mt-4 text-base text-white/70">
            Real dashboards, real ISP metrics. From live PPPoE connections to automated invoice clearing.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-landing-cta text-white shadow-lg shadow-orange-500/20'
                  : 'border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Preview Frame */}
        {currentTab && (
          <div className="mt-10 rounded-2xl border border-white/15 bg-landing-panel/90 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
            <div className="grid gap-8 lg:grid-cols-12 items-center">
              {/* Left Info */}
              <div className="lg:col-span-5">
                <div className="inline-flex items-center gap-2 rounded-md bg-white/5 px-3 py-1 text-xs font-medium text-landing-accent border border-white/10">
                  <Activity className="h-3.5 w-3.5" />
                  Live Operational Module
                </div>
                <h3 className="font-landing-display mt-4 text-2xl font-bold text-white">
                  {currentTab.label}
                </h3>

                <ul className="mt-6 space-y-3">
                  {currentTab.bullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-white/80">
                      <CheckCircle className="h-4 w-4 text-landing-cta shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                {/* Metrics Badges */}
                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {currentTab.metrics.map((m, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center"
                    >
                      <div className="font-mono text-base font-bold text-white">
                        {m.val}
                      </div>
                      <div className="mt-1 text-[11px] text-white/50">
                        {m.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Mock UI Screen */}
              <div className="lg:col-span-7">
                <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0c0118] p-4 shadow-inner">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-red-500/80" />
                      <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                      <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                      <span className="ml-2 font-mono text-xs text-white/40">
                        operator-console.isppaybd.com/{currentTab.id}
                      </span>
                    </div>
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                      ONLINE
                    </span>
                  </div>

                  <div className="mt-4 space-y-3 font-mono text-xs">
                    <div className="rounded-lg bg-white/5 p-3 flex justify-between items-center text-white/80">
                      <span className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-landing-cta" />
                        [PPPoE Sync Worker] Connected to 4 MikroTik RouterOS gateways
                      </span>
                      <span className="text-emerald-400">0.04s latency</span>
                    </div>

                    <div className="rounded-lg bg-white/5 p-3 text-white/70 space-y-1">
                      <div className="text-white/40"># Real-time event log:</div>
                      <div className="text-emerald-300">
                        [14:02:18] bKash TrxID #9K42X1 matched with Cust ID #CUST-4091 (৳800)
                      </div>
                      <div className="text-blue-300">
                        [14:02:19] RouterOS API: PPPoE profile active, unblocked line instantly
                      </div>
                      <div className="text-white/60">
                        [14:02:20] SMS Delivery: Notification sent to +880 1711-XXXXXX
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-center">
                        <span className="text-white/50 text-[10px]">TOTAL TODAY RECONCILED</span>
                        <div className="text-lg font-bold text-white mt-1">৳184,500</div>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-center">
                        <span className="text-white/50 text-[10px]">AUTO RECONNECT SUCCESS</span>
                        <div className="text-lg font-bold text-emerald-400 mt-1">100% (214/214)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
