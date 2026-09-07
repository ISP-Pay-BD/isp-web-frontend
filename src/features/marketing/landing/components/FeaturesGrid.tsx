'use client';

import type { FeatureItem } from '../types';

interface FeaturesGridProps {
  features: FeatureItem[];
}

export function FeaturesGrid({ features }: FeaturesGridProps) {
  const lead = features[0];
  const rest = features.slice(1);

  return (
    <section id="features" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="max-w-2xl">
          <h2 className="font-landing-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            From the ONU port to the ৳ in your account.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/60">
            OLT and MikroTik on one side; billing, resellers, and BTRC-ready reports on the other.
          </p>
        </div>

        {lead ? (
          <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <p className="font-mono text-xs text-landing-cta">01</p>
              <h3 className="font-landing-display mt-3 text-2xl font-semibold text-white">
                {lead.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/60">{lead.desc}</p>
              {lead.bullets && lead.bullets.length > 0 ? (
                <ul className="mt-6 space-y-2 text-sm text-white/55">
                  {lead.bullets.map((b) => (
                    <li key={b} className="border-l border-white/15 pl-3">
                      {b}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <ol className="divide-y divide-white/10 border-y border-white/10 lg:col-span-7">
              {rest.map((feat, i) => (
                <li key={feat.id} className="grid gap-2 py-5 sm:grid-cols-[3rem_1fr] sm:gap-4">
                  <span className="font-mono text-xs text-white/30">
                    {String(i + 2).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-landing-display text-base font-semibold text-white">
                      {feat.title}
                      {feat.badge ? (
                        <span className="ml-2 text-xs font-normal text-white/40">{feat.badge}</span>
                      ) : null}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-white/55">{feat.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </div>
    </section>
  );
}
