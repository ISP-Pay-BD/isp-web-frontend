'use client';

import type { BenefitItem } from '../types';

interface BenefitsSectionProps {
  benefits: BenefitItem[];
}

export function BenefitsSection({ benefits }: BenefitsSectionProps) {
  const lead = benefits[0];
  const rest = benefits.slice(1);

  return (
    <section id="benefits" className="border-t border-white/10 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="max-w-2xl">
          <h2 className="font-landing-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Built by people who&apos;ve run a MikroTik at 2am.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/60">
            Since 2020, Bangladeshi ISPs — from 300-line neighbourhood networks to multi-branch
            operators — run billing, MikroTik, resellers, and bKash collection from one place.
          </p>
        </div>

        {lead ? (
          <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <h3 className="font-landing-display text-xl font-semibold text-white">{lead.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/60">{lead.desc}</p>
              {lead.stats && lead.stats.length > 0 ? (
                <dl className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm">
                  {lead.stats.map((s) => (
                    <div key={s.label} className="flex justify-between gap-4">
                      <dt className="text-white/45">{s.label}</dt>
                      <dd className="font-medium tabular-nums text-white">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>

            <ul className="divide-y divide-white/10 border-y border-white/10 lg:col-span-7">
              {rest.map((item) => (
                <li key={item.title} className="py-5">
                  <h3 className="font-landing-display text-base font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/55">{item.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
