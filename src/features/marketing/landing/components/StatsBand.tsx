'use client';

import type { StatsData } from '../types';

interface StatsBandProps {
  stats: StatsData;
}

export function StatsBand({ stats }: StatsBandProps) {
  const items = [
    { value: `${stats.trustedIsps}+`, label: 'ISPs on platform' },
    { value: `${Math.round(stats.activeUsers / 1000)}k+`, label: 'Subscribers billed' },
    { value: '99.98%', label: 'Platform uptime' },
    { value: stats.paymentsReconciled, label: 'Payments matched' },
  ];

  return (
    <section id="stats" className="border-b border-white/10 py-8 md:py-10">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <dl className="grid grid-cols-2 gap-y-6 md:grid-cols-4 md:gap-x-8">
          {items.map((item) => (
            <div key={item.label} className="md:border-l md:border-white/10 md:pl-6 first:md:border-0 first:md:pl-0">
              <dd className="font-landing-display text-xl font-semibold tracking-tight text-white/90 md:text-2xl">
                {item.value}
              </dd>
              <dt className="mt-1 text-[11px] text-white/40">{item.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
