'use client';

import type { TrustBadgeItem } from '../types';

interface TrustBadgesProps {
  badges: TrustBadgeItem[];
}

export function TrustBadges({ badges }: TrustBadgesProps) {
  const displayBadges =
    badges.length > 0
      ? badges
      : [
          { label: '120+ ISPs', sub: 'Across Bangladesh' },
          { label: '85K+ users', sub: 'Managed daily' },
          { label: '2M+ payments', sub: 'Reconciled' },
          { label: '99.9% uptime', sub: 'Platform SLA' },
        ];

  return (
    <section id="trust" className="relative border-t border-white/10 bg-landing-panel/40 py-12 md:py-14">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <dl className="flex flex-wrap gap-x-8 gap-y-4">
          {displayBadges.map((badge) => (
            <div key={badge.label}>
              <dt className="font-landing-display text-lg font-semibold text-white">{badge.label}</dt>
              <dd className="mt-0.5 text-xs text-white/45">{badge.sub}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
