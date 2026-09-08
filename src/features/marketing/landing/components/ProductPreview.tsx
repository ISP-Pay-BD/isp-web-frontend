'use client';

import { useState } from 'react';
import type { ProductPreviewTab } from '../types';

interface ProductPreviewProps {
  tabs: ProductPreviewTab[];
}

const CONSOLE_BY_TAB: Record<
  string,
  { rows: { col1: string; col2: string; col3: string; hot?: boolean }[]; kpi: { label: string; value: string }[] }
> = {
  billing: {
    kpi: [
      { label: 'Matched today', value: '142' },
      { label: 'Manual queue', value: '3' },
    ],
    rows: [
      { col1: 'bKash', col2: 'CUST-4091', col3: '৳800', hot: true },
      { col1: 'Nagad', col2: 'CUST-2104', col3: '৳1,200' },
      { col1: 'Cash', col2: 'CUST-1188', col3: '৳500' },
      { col1: 'bKash', col2: 'CUST-3301', col3: '৳800' },
    ],
  },
  mikrotik: {
    kpi: [
      { label: 'Gateways', value: '8' },
      { label: 'PPPoE live', value: '1,420' },
    ],
    rows: [
      { col1: 'Mirpur-GW-02', col2: 'PPPoE sync', col3: '0.04s', hot: true },
      { col1: 'Uttara-GW-01', col2: 'Hotspot', col3: 'OK' },
      { col1: 'Banani-GW-03', col2: 'Secret push', col3: 'OK' },
      { col1: 'RADIUS', col2: 'CoA clear', col3: '37' },
    ],
  },
  olt: {
    kpi: [
      { label: 'ONUs online', value: '942' },
      { label: 'Low signal', value: '14' },
    ],
    rows: [
      { col1: 'Huawei-OLT-3', col2: 'Port 0/1/4', col3: '-22.1 dBm', hot: true },
      { col1: 'ZTE-OLT-1', col2: 'Port 0/2/1', col3: '-24.8 dBm' },
      { col1: 'Huawei-OLT-3', col2: 'ONU reboot', col3: 'Queued' },
      { col1: 'Fiber cut', col2: 'Area Mirpur-10', col3: 'Alert' },
    ],
  },
  reports: {
    kpi: [
      { label: 'MTD revenue', value: '৳48L' },
      { label: 'Collection', value: '98.4%' },
    ],
    rows: [
      { col1: 'BTRC export', col2: 'Aug 2026', col3: 'Ready', hot: true },
      { col1: 'Daily bill', col2: 'Today', col3: 'Synced' },
      { col1: 'COA journal', col2: '14 entries', col3: 'Posted' },
      { col1: 'Reseller ledger', col2: '12 POPs', col3: 'Balanced' },
    ],
  },
};

export function ProductPreview({ tabs }: ProductPreviewProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? 'billing');
  const currentTab = tabs.find((t) => t.id === activeTab) ?? tabs[0];
  const consoleData = CONSOLE_BY_TAB[activeTab] ?? CONSOLE_BY_TAB.billing;

  return (
    <section id="product-preview" className="border-t border-white/10 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="max-w-2xl">
          <h2 className="font-landing-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            The operator console, not a pitch deck.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/60">
            Live collections, PPPoE sessions, and ticket queues — the screens your team opens every
            morning.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-1 border-b border-white/10">
          {tabs.map((t) => {
            const active = t.id === activeTab;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`-mb-px border-b-2 px-4 py-3 text-sm transition-colors ${
                  active
                    ? 'border-landing-cta font-semibold text-white'
                    : 'border-transparent text-white/45 hover:text-white/80'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {currentTab && consoleData ? (
          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <h3 className="font-landing-display text-xl font-semibold text-white">
                {currentTab.label}
              </h3>
              <ul className="mt-5 space-y-3">
                {currentTab.bullets.map((bullet) => (
                  <li key={bullet} className="border-l border-white/15 pl-3 text-sm leading-relaxed text-white/55">
                    {bullet}
                  </li>
                ))}
              </ul>
              <dl className="mt-8 flex gap-8">
                {consoleData.kpi.map((m) => (
                  <div key={m.label}>
                    <dd className="font-landing-display text-2xl font-semibold tabular-nums text-white">
                      {m.value}
                    </dd>
                    <dt className="mt-1 text-xs text-white/40">{m.label}</dt>
                  </div>
                ))}
              </dl>
            </div>

            <div className="overflow-hidden border border-white/10 bg-landing-panel lg:col-span-8">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <span className="font-mono text-[11px] text-white/40">
                  operator-console / {currentTab.id}
                </span>
                <span className="font-mono text-[11px] text-emerald-400">Online</span>
              </div>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] tracking-wide text-white/35">
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-4 py-3 font-medium">Ref</th>
                    <th className="px-4 py-3 text-right font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-xs sm:text-[13px]">
                  {consoleData.rows.map((row) => (
                    <tr key={`${row.col1}-${row.col2}`} className="border-b border-white/[0.06] last:border-0">
                      <td
                        className={`px-4 py-3.5 ${row.hot ? 'text-landing-cta' : 'text-white/80'}`}
                      >
                        {row.col1}
                      </td>
                      <td className="px-4 py-3.5 text-white/55">{row.col2}</td>
                      <td className="px-4 py-3.5 text-right tabular-nums text-white/70">{row.col3}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
