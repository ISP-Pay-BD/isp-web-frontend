'use client';

import { motion } from 'framer-motion';
import { Reveal, RevealItem } from '@/components/motion/Reveal';
import { useMotionSafe } from '@/lib/animations';
import type { FeatureItem } from '../types';
import { landingMedia } from '../media';
import { SpotlightCard } from './SpotlightCard';

interface FeaturesGridProps {
  features: FeatureItem[];
  title: string;
  subtitle: string;
}

const SPANS = [
  'md:col-span-7 md:row-span-2',
  'md:col-span-5',
  'md:col-span-5',
  'md:col-span-4',
  'md:col-span-8',
] as const;

export function FeaturesGrid({ features, title, subtitle }: FeaturesGridProps) {
  const { reduced } = useMotionSafe();
  const cards = features.slice(0, 5);

  return (
    <section id="features" className="relative z-[1] py-32 md:py-48">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal>
          <div className="max-w-3xl">
            <h2 className="font-landing-display text-[clamp(2rem,4vw,3.5rem)] font-semibold tracking-tight text-white text-balance">
              {title}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
              {subtitle}
            </p>
          </div>
        </Reveal>

        <Reveal stagger className="mt-16 grid auto-rows-[minmax(12rem,auto)] grid-flow-dense gap-3 md:grid-cols-12 md:gap-4">
          {cards.map((feat, i) => {
            const isLead = i === 0;
            const image = landingMedia.features[i] ?? landingMedia.features[0];
            return (
              <RevealItem key={feat.id} className={SPANS[i]}>
                <SpotlightCard className="h-full min-h-[12rem]">
                  <div
                    className="absolute inset-0 opacity-35 transition-transform duration-700 ease-out group-hover:scale-105"
                    style={{
                      backgroundImage: `url('${image}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      filter: 'grayscale(1) contrast(1.2) brightness(0.45)',
                      mixBlendMode: 'luminosity',
                    }}
                    aria-hidden
                  />
                  <div
                    className="absolute inset-0 bg-linear-to-t from-landing-bg via-landing-bg/80 to-transparent"
                    aria-hidden
                  />
                  <div
                    className={`relative flex h-full flex-col justify-end p-6 ${isLead ? 'md:p-8' : ''}`}
                  >
                    {feat.badge ? (
                      <span className="mb-3 w-fit rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium tracking-wide text-white/55">
                        {feat.badge}
                      </span>
                    ) : null}
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
                    {feat.bullets && feat.bullets.length > 0 ? (
                      <ul className="mt-4 space-y-1.5">
                        {feat.bullets.slice(0, isLead ? 3 : 2).map((b) => (
                          <li key={b} className="flex items-center gap-2 text-xs text-white/50">
                            <span className="h-1 w-1 rounded-full bg-landing-cta" aria-hidden />
                            {b}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {!reduced ? (
                      <motion.div
                        className="pointer-events-none absolute top-4 right-4 h-8 w-8 rounded-full border border-white/10"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                        aria-hidden
                      />
                    ) : null}
                  </div>
                </SpotlightCard>
              </RevealItem>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
