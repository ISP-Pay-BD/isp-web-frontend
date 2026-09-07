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
    <section id="stats" className="border-y border-white/10 py-10 md:py-12">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <dl className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-6">
          {items.map((item) => (
            <div key={item.label}>
              <dt className="text-xs font-medium text-white/45">{item.label}</dt>
              <dd className="font-landing-display mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
