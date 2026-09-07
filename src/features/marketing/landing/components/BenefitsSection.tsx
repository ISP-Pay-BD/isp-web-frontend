'use client';

import { Network, GitFork, Wallet } from 'lucide-react';
import type { BenefitItem } from '../types';

interface BenefitsSectionProps {
  benefits: BenefitItem[];
}

export function BenefitsSection({ benefits }: BenefitsSectionProps) {
  const icons = [Network, GitFork, Wallet];
  const lead = benefits[0];
  const rest = benefits.slice(1);

  return (
    <section id="benefits" className="border-t border-white/10 bg-landing-panel/40 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-landing-cta">
            Built for ISPs
          </p>
          <h2 className="font-landing-display mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Built by people who&apos;ve run a MikroTik at 2am.
          </h2>
          <p className="mt-4 text-base text-white/60">
            Since 2020, Bangladeshi ISPs — from 300-line neighbourhood networks to multi-branch
            operators — run billing, MikroTik, resellers, and bKash collection from one place.
          </p>
        </div>

        {lead ? (
          <div className="mt-12 grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              {(() => {
                const Icon = icons[0] ?? Network;
                return (
                  <>
                    <Icon className="h-6 w-6 text-landing-cta" aria-hidden />
                    <h3 className="font-landing-display mt-4 text-xl font-semibold text-white">
                      {lead.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/60">{lead.desc}</p>
                    {lead.stats && lead.stats.length > 0 ? (
                      <dl className="mt-6 space-y-2 border-t border-white/10 pt-5 text-sm">
                        {lead.stats.map((s) => (
                          <div key={s.label} className="flex justify-between gap-4">
                            <dt className="text-white/45">{s.label}</dt>
                            <dd className="font-medium tabular-nums text-white">{s.value}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : null}
                  </>
                );
              })()}
            </div>

            <ul className="divide-y divide-white/10 border-y border-white/10 lg:col-span-7">
              {rest.map((item, index) => {
                const Icon = icons[index + 1] ?? Network;
                return (
                  <li key={item.title} className="flex gap-4 py-5">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-landing-cta" aria-hidden />
                    <div>
                      <h3 className="font-landing-display text-base font-semibold text-white">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-white/55">{item.desc}</p>
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
