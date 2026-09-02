'use client';

import { ShieldCheck, Server, Lock, Award } from 'lucide-react';
import type { TrustBadgeItem } from '../types';

interface TrustBadgesProps {
  badges: TrustBadgeItem[];
}

const trustIcons = [ShieldCheck, Server, Lock, Award];

export function TrustBadges({ badges }: TrustBadgesProps) {
  const displayBadges = badges.length > 0 ? badges : [
    { label: '120+ ISPs', sub: 'Across Bangladesh' },
    { label: '85K+ users', sub: 'Managed daily' },
    { label: '2M+ payments', sub: 'Reconciled' },
    { label: '99.9% uptime', sub: 'Platform SLA' },
  ];

  return (
    <section id="trust" className="py-16 bg-landing-panel/40 border-t border-white/10 relative">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {displayBadges.map((badge, idx) => {
            const Icon = trustIcons[idx % trustIcons.length] ?? ShieldCheck;
            return (
              <div
                key={idx}
                className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-sm"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-landing-panel border border-white/10 text-landing-cta">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-landing-display text-lg font-bold text-white">
                    {badge.label}
                  </div>
                  <div className="text-xs text-white/50">
                    {badge.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
