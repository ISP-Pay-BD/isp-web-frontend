'use client';

import { useState } from 'react';
import type { ProductPreviewTab } from '../types';

interface ProductPreviewProps {
  tabs: ProductPreviewTab[];
}

export function ProductPreview({ tabs }: ProductPreviewProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? 'billing');
  const currentTab = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  return (
    <section id="product-preview" className="border-t border-white/[0.07] bg-[#0a0114] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-landing-cta">
            Product
          </p>
          <h2 className="font-landing-display mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            The operator console, not a pitch deck.
          </h2>
          <p className="mt-4 text-base text-white/60">
            Live collections, PPPoE sessions, and ticket queues — the screens your team opens every morning.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-[#0a0114]'
                  : 'text-white/55 hover:bg-white/5 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {currentTab && (
          <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <h3 className="font-landing-display text-xl font-semibold text-white">
                {currentTab.label}
              </h3>
              <ul className="mt-5 space-y-3">
                {currentTab.bullets.map((bullet) => (
                  <li key={bullet} className="text-sm leading-relaxed text-white/55">
                    {bullet}
                  </li>
                ))}
              </ul>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {currentTab.metrics.map((m) => (
                  <div key={m.label}>
                    <p className="font-mono text-lg font-semibold text-white">{m.val}</p>
                    <p className="mt-0.5 text-xs text-white/40">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="overflow-hidden rounded-xl border border-white/10 bg-[#12061f]">
                <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
                  <span className="font-mono text-[11px] text-white/40">
                    operator-console / {currentTab.id}
                  </span>
                  <span className="font-mono text-[10px] text-emerald-400/90">ONLINE</span>
                </div>
                <div className="space-y-2 p-4 font-mono text-xs">
                  <div className="rounded-lg bg-white/[0.04] px-3 py-2.5 text-white/70">
                    PPPoE sync · 4 MikroTik gateways · 0.04s latency
                  </div>
                  <div className="rounded-lg bg-white/[0.04] px-3 py-2.5 text-emerald-300/90">
                    bKash TrxID matched · CUST-4091 · ৳800
                  </div>
                  <div className="rounded-lg bg-white/[0.04] px-3 py-2.5 text-sky-300/85">
                    RouterOS API · profile active · line unblocked
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="rounded-lg bg-white/[0.03] px-3 py-3">
                      <p className="text-[10px] text-white/35">Reconciled today</p>
                      <p className="mt-1 text-base font-semibold text-white">৳184,500</p>
                    </div>
                    <div className="rounded-lg bg-white/[0.03] px-3 py-3">
                      <p className="text-[10px] text-white/35">Reconnect success</p>
                      <p className="mt-1 text-base font-semibold text-emerald-400">214 / 214</p>
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
