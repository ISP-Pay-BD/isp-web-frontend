'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Layers, CheckCircle2 } from 'lucide-react';
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

export function FeaturesGrid({ features, title, subtitle }: FeaturesGridProps) {
  const { reduced } = useMotionSafe();
  const [showAll, setShowAll] = useState(false);

  const primaryCards = features.slice(0, 6);
  const extraCards = features.slice(6);

  return (
    <section id="features" className="relative z-[1] py-24 md:py-36">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal>
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-landing-cta/20 bg-landing-cta/10 px-3 py-1 text-xs font-medium text-landing-cta">
              <Layers className="h-3.5 w-3.5" />
              Complete ISP Feature Suite
            </span>
            <h2 className="font-landing-display mt-4 text-[clamp(2rem,4vw,3.5rem)] font-semibold tracking-tight text-white text-balance">
              {title}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
              {subtitle}
            </p>
          </div>
        </Reveal>

        {/* Primary 6 Features Grid */}
        <Reveal stagger className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
          {primaryCards.map((feat, i) => {
            const image = landingMedia.features[i] ?? landingMedia.features[0];
            return (
              <RevealItem key={feat.id}>
                <SpotlightCard className="h-full min-h-[16rem]">
                  <div
                    className="absolute inset-0 opacity-20 transition-transform duration-700 ease-out group-hover:scale-105"
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
                    className="absolute inset-0 bg-linear-to-t from-landing-bg via-landing-bg/85 to-transparent"
                    aria-hidden
                  />
                  <div className="relative flex h-full flex-col justify-between p-6">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="font-mono text-xs text-white/30">0{i + 1}</span>
                        {feat.badge ? (
                          <span className="rounded-md border border-landing-cta/30 bg-landing-cta/10 px-2 py-0.5 text-[10px] font-medium tracking-wide text-landing-cta">
                            {feat.badge}
                          </span>
                        ) : null}
                      </div>
                      <h3 className="font-landing-display text-lg font-semibold text-white">
                        {feat.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-white/60">
                        {feat.desc}
                      </p>
                    </div>
                    {feat.bullets && feat.bullets.length > 0 ? (
                      <ul className="mt-4 space-y-1.5 border-t border-white/10 pt-3">
                        {feat.bullets.map((b) => (
                          <li key={b} className="flex items-center gap-2 text-xs text-white/50">
                            <CheckCircle2 className="h-3 w-3 text-landing-cta shrink-0" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </SpotlightCard>
              </RevealItem>
            );
          })}
        </Reveal>

        {/* Extra 6 Modules (Expandable) */}
        <AnimatePresence>
          {showAll && (
            <motion.div
              initial={reduced ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={reduced ? undefined : { opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden mt-4"
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5 pt-1">
                {extraCards.map((feat, i) => {
                  const image = landingMedia.features[(i + 6) % landingMedia.features.length] ?? landingMedia.features[0];
                  return (
                    <SpotlightCard key={feat.id} className="h-full min-h-[16rem]">
                      <div
                        className="absolute inset-0 opacity-20 transition-transform duration-700 ease-out group-hover:scale-105"
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
                        className="absolute inset-0 bg-linear-to-t from-landing-bg via-landing-bg/85 to-transparent"
                        aria-hidden
                      />
                      <div className="relative flex h-full flex-col justify-between p-6">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="font-mono text-xs text-white/30">0{i + 7}</span>
                            {feat.badge ? (
                              <span className="rounded-md border border-landing-accent/30 bg-landing-accent/10 px-2 py-0.5 text-[10px] font-medium tracking-wide text-landing-accent">
                                {feat.badge}
                              </span>
                            ) : null}
                          </div>
                          <h3 className="font-landing-display text-lg font-semibold text-white">
                            {feat.title}
                          </h3>
                          <p className="mt-2 text-xs leading-relaxed text-white/60">
                            {feat.desc}
                          </p>
                        </div>
                        {feat.bullets && feat.bullets.length > 0 ? (
                          <ul className="mt-4 space-y-1.5 border-t border-white/10 pt-3">
                            {feat.bullets.map((b) => (
                              <li key={b} className="flex items-center gap-2 text-xs text-white/50">
                                <CheckCircle2 className="h-3 w-3 text-landing-cta shrink-0" />
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </SpotlightCard>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-landing-cta/50"
          >
            <span>{showAll ? 'Show less modules' : 'See the full toolset — 6 more modules'}</span>
            {showAll ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </section>
  );
}
