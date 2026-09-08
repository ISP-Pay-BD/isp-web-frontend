'use client';

import type { FeatureItem } from '../types';

interface FeaturesGridProps {
  features: FeatureItem[];
}

/** Gapless 12-col bento: 7+5 / 7+5 / 4+8 — zero empty cells with grid-flow-dense. */
const SPANS = [
  'md:col-span-7 md:row-span-2',
  'md:col-span-5',
  'md:col-span-5',
  'md:col-span-4',
  'md:col-span-8',
] as const;

const IMAGE_SEEDS = [
  'fiber-splice',
  'router-rack',
  'city-network',
  'mobile-pay',
  'ops-desk',
] as const;

export function FeaturesGrid({ features }: FeaturesGridProps) {
  const cards = features.slice(0, 5);

  return (
    <section id="features" className="py-32 md:py-48">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="max-w-3xl">
          <h2 className="font-landing-display text-[clamp(2rem,4vw,3.25rem)] font-semibold tracking-tight text-white text-balance">
            From the ONU port to the taka in your ledger
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
            OLT and MikroTik on one side. Billing, resellers, and BTRC-ready reports on the other.
          </p>
        </div>

        <div className="mt-16 grid auto-rows-[minmax(11rem,auto)] grid-flow-dense gap-3 md:grid-cols-12 md:gap-4">
          {cards.map((feat, i) => {
            const isLead = i === 0;
            return (
              <article
                key={feat.id}
                className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-landing-panel ${SPANS[i]}`}
              >
                <div
                  className="absolute inset-0 opacity-40 transition-transform duration-700 ease-out group-hover:scale-105"
                  style={{
                    backgroundImage: `url('https://picsum.photos/seed/${IMAGE_SEEDS[i]}/1200/800')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'grayscale(1) contrast(1.2) brightness(0.45)',
                    mixBlendMode: 'luminosity',
                  }}
                  aria-hidden
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-landing-bg via-landing-bg/70 to-transparent"
                  aria-hidden
                />
                <div className={`relative flex h-full flex-col justify-end p-6 ${isLead ? 'md:p-8' : ''}`}>
                  <h3
                    className={`font-landing-display font-semibold text-white ${
                      isLead ? 'text-2xl md:text-3xl' : 'text-lg'
                    }`}
                  >
                    {feat.title}
                  </h3>
                  <p
                    className={`mt-2 leading-relaxed text-white/60 ${
                      isLead ? 'max-w-md text-sm md:text-base' : 'text-sm'
                    }`}
                  >
                    {feat.desc}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
