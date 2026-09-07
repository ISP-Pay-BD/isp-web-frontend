'use client';

import {
  CreditCard,
  Server,
  Building,
  Smartphone,
  MessageSquare,
  Wallet,
  Radio,
  Users,
  Layers,
} from 'lucide-react';
import type { FeatureItem } from '../types';

interface FeaturesGridProps {
  features: FeatureItem[];
}

const iconMap: Record<string, React.ElementType> = {
  CreditCard,
  Server,
  Building,
  Smartphone,
  MessageSquare,
  Wallet,
  Network: Radio,
  Users,
};

export function FeaturesGrid({ features }: FeaturesGridProps) {
  const lead = features[0];
  const rest = features.slice(1);

  return (
    <section id="features" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-landing-cta">
            Platform
          </p>
          <h2 className="font-landing-display mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            From the ONU port to the ৳ in your account.
          </h2>
          <p className="mt-4 text-base text-white/60">
            OLT and MikroTik on one side; billing, resellers, and BTRC-ready reports on the other.
          </p>
        </div>

        {lead ? (
          <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 lg:col-span-5 lg:p-8">
              {(() => {
                const Icon = iconMap[lead.icon] ?? Layers;
                return (
                  <>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-landing-panel text-landing-cta">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <h3 className="font-landing-display mt-5 text-xl font-semibold text-white">
                      {lead.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/60">{lead.desc}</p>
                    {lead.bullets && lead.bullets.length > 0 ? (
                      <ul className="mt-5 space-y-2 border-t border-white/10 pt-5 text-sm text-white/55">
                        {lead.bullets.map((b) => (
                          <li key={b} className="flex gap-2">
                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-landing-cta" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </>
                );
              })()}
            </div>

            <ul className="divide-y divide-white/10 border-y border-white/10 lg:col-span-7">
              {rest.map((feat) => {
                const Icon = iconMap[feat.icon] ?? Layers;
                return (
                  <li key={feat.id} className="flex gap-4 py-5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-landing-cta">
                      <Icon className="h-4 w-4" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-landing-display text-base font-semibold text-white">
                          {feat.title}
                        </h3>
                        {feat.badge ? (
                          <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/50">
                            {feat.badge}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-white/55">{feat.desc}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
