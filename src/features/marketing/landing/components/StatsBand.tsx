'use client';

import { Building, Users, Server, CalendarCheck } from 'lucide-react';
import type { StatsData } from '../types';

interface StatsBandProps {
  stats: StatsData;
}

export function StatsBand({ stats }: StatsBandProps) {
  const items = [
    {
      icon: Building,
      value: `${stats.trustedIsps}+`,
      label: 'Active ISPs across BD',
      subtext: 'Nationwide coverage',
    },
    {
      icon: Users,
      value: `${(stats.activeUsers / 1000).toFixed(0)}k+`,
      label: 'Subscribers Managed',
      subtext: 'Real-time billing & queue',
    },
    {
      icon: Server,
      value: '99.98%',
      label: 'Platform Uptime SLA',
      subtext: 'High-availability cluster',
    },
    {
      icon: CalendarCheck,
      value: `${stats.paymentsReconciled}`,
      label: 'Payments Reconciled',
      subtext: 'Zero ledger mismatch',
    },
  ];

  return (
    <section id="stats" className="border-y border-white/10 bg-landing-panel/50 backdrop-blur-md py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-6">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center group"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-landing-cta shadow-inner transition-colors group-hover:border-landing-cta/40 group-hover:bg-landing-cta/10">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="font-landing-display text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                  {item.value}
                </span>
                <span className="mt-1 text-sm font-semibold text-white/90">
                  {item.label}
                </span>
                <span className="text-xs text-white/50">
                  {item.subtext}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
