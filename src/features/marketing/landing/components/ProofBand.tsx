'use client';

import type { StatsData } from '../types';

interface ProofBandProps {
  stats: StatsData;
}

export function ProofBand({ stats }: ProofBandProps) {
  const items = [
    { value: `${stats.trustedIsps}+`, label: 'Operators live' },
    { value: `${(stats.activeUsers / 1000).toFixed(0)}k+`, label: 'Subscribers billed' },
    { value: 'Unlimited', label: 'MikroTik routers' },
    { value: '5+', label: 'Years running' },
  ];

  return (
    <section id="proof" className="relative border-t border-white/10 bg-landing-bg py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="max-w-2xl">
          <h2 className="font-landing-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            From Dhaka to Rangpur, operators run on one reconciled ledger
          </h2>
          <p className="mt-4 text-base text-white/60">
            {stats.trustedIsps}+ operators run billing, MikroTik provisioning, and bKash/Nagad
            reconciliation on one panel — live since 2020.
          </p>
        </div>

        <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-y border-white/10 py-6">
          {items.map((item) => (
            <div key={item.label}>
              <dt className="text-xs text-white/45">{item.label}</dt>
              <dd className="font-landing-display mt-1 text-2xl font-semibold tabular-nums text-white">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
