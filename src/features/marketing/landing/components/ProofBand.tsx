'use client';

import { Building, Users, Network, CalendarCheck } from 'lucide-react';
import type { StatsData } from '../types';

interface ProofBandProps {
  stats: StatsData;
}

export function ProofBand({ stats }: ProofBandProps) {
  return (
    <section id="proof" className="py-20 md:py-24 bg-[#0c0118] border-t border-white/10 relative">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-landing-accent">
            Proven at Scale
          </span>
          <h2 className="font-landing-display mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            From Dhaka to Rangpur, operators run on one reconciled ledger
          </h2>
          <p className="mt-4 text-base text-white/70">
            {stats.trustedIsps}+ operators run billing, MikroTik provisioning, and bKash/Nagad reconciliation on one panel — live since 2020.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-6 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center backdrop-blur-sm">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-landing-panel text-landing-cta border border-white/10 mb-3">
              <Building className="h-5 w-5" />
            </div>
            <div className="font-landing-display text-3xl font-extrabold text-white">
              {stats.trustedIsps}+
            </div>
            <div className="mt-1 text-xs text-white/60">Operators Live</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center backdrop-blur-sm">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-landing-panel text-landing-accent border border-white/10 mb-3">
              <Users className="h-5 w-5" />
            </div>
            <div className="font-landing-display text-3xl font-extrabold text-white">
              {(stats.activeUsers / 1000).toFixed(0)}k+
            </div>
            <div className="mt-1 text-xs text-white/60">Subscribers Billed</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center backdrop-blur-sm">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-landing-panel text-emerald-400 border border-white/10 mb-3">
              <Network className="h-5 w-5" />
            </div>
            <div className="font-landing-display text-3xl font-extrabold text-white">
              Unlimited
            </div>
            <div className="mt-1 text-xs text-white/60">MikroTik Routers</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center backdrop-blur-sm">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-landing-panel text-purple-400 border border-white/10 mb-3">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <div className="font-landing-display text-3xl font-extrabold text-white">
              5+
            </div>
            <div className="mt-1 text-xs text-white/60">Years Running</div>
          </div>
        </div>
      </div>
    </section>
  );
}
