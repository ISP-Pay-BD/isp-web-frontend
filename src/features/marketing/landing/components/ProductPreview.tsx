'use client';

import { useState } from 'react';
import { Reveal } from '@/components/motion/Reveal';
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
        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-landing-cta">Product</p>
          <h2 className="font-landing-display mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            The operator console, not a pitch deck.
          </h2>
          <p className="mt-4 text-base text-white/60">
            Live collections, PPPoE sessions, and ticket queues — the screens your team opens every morning.
          </p>
        </Reveal>

        <div className="mt-10 flex flex-wrap gap-2 border-b border-white/10 pb-px">
          {tabs.map((t) => {
            const active = t.id === activeTab;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`-mb-px border-b-2 px-3 pb-3 text-sm transition-colors ${
                  active
                    ? 'border-landing-cta font-semibold text-white'
                    : 'border-transparent text-white/50 hover:text-white/80'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {currentTab && (
          <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <h3 className="font-landing-display text-xl font-semibold text-white">
                {currentTab.label}
              </h3>
              <ul className="mt-5 space-y-3">
                {currentTab.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2 text-sm leading-relaxed text-white/55">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-landing-cta" />
                    {bullet}
                  </li>
                ))}
              </ul>
              <dl className="mt-8 grid grid-cols-2 gap-4">
                {currentTab.metrics.map((m) => (
                  <div key={m.label}>
                    <dd className="font-mono text-lg font-semibold tabular-nums text-white">{m.val}</dd>
                    <dt className="mt-0.5 text-xs text-white/40">{m.label}</dt>
                  </div>
                ))}
              </dl>
            </div>

            <div className="lg:col-span-8">
              <div className="overflow-hidden rounded-xl border border-white/10 bg-[#12061f]">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <span className="font-mono text-[11px] text-white/40">
                    operator-console / {currentTab.id}
                  </span>
                  <span className="font-mono text-[10px] text-white/45">Online</span>
                </div>
                <div className="space-y-2 p-4 font-mono text-xs text-white/65">
                  <div className="rounded-lg bg-white/[0.04] px-3 py-2.5">
                    PPPoE sync · 4 MikroTik gateways · 0.04s latency
                  </div>
                  <div className="rounded-lg bg-white/[0.04] px-3 py-2.5">
                    bKash TrxID matched · CUST-4091 · ৳800
                  </div>
                  <div className="rounded-lg bg-white/[0.04] px-3 py-2.5">
                    Ticket #8821 assigned · Area: Mirpur · SLA 2h
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
