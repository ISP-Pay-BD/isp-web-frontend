'use client';

import { useState } from 'react';
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
  ChevronDown,
  CheckCircle,
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
  const [showAll, setShowAll] = useState(false);

  // Split into 6 initial features + 6 extra features
  const initialFeatures = features.slice(0, 6);
  const extraFeatures = features.slice(6);

  return (
    <section id="features" className="py-20 md:py-28 relative">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-landing-accent">
            Core Features
          </span>
          <h2 className="font-landing-display mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            One platform, from the ONU port to the ৳ in your account.
          </h2>
          <p className="mt-4 text-base text-white/70">
            OLT and MikroTik on one side; billing, resellers, and BTRC-ready reports on the other. Everything an operator touches, nothing they don&apos;t.
          </p>
        </div>

        {/* Primary Features Grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {initialFeatures.map((feat) => {
            const Icon = iconMap[feat.icon] ?? Layers;
            return (
              <div
                key={feat.id}
                className="glass-panel-luxury group relative flex flex-col rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-landing-cta/50 hover:shadow-[0_20px_40px_rgba(247,88,3,0.1)]"
              >
                {feat.badge && (
                  <span
                    className={`absolute top-6 right-6 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      feat.badge === 'Advanced'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {feat.badge}
                  </span>
                )}

                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-landing-panel border border-white/10 text-landing-cta shadow-inner transition-transform group-hover:scale-110">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="font-landing-display text-xl font-bold text-white group-hover:text-landing-cta transition-colors">
                  {feat.title}
                </h3>

                <p className="mt-2.5 text-sm leading-relaxed text-white/65 flex-1">
                  {feat.desc}
                </p>

                {feat.bullets && feat.bullets.length > 0 && (
                  <ul className="mt-4 space-y-2 border-t border-white/10 pt-4 text-xs text-white/60">
                    {feat.bullets.map((b, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-landing-accent shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {/* Extra Features (Expanded) */}
        {showAll && extraFeatures.length > 0 && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in-50 duration-500">
            {extraFeatures.map((feat) => {
              const Icon = iconMap[feat.icon] ?? Layers;
              return (
                <div
                  key={feat.id}
                  className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-landing-cta/40 hover:bg-white/[0.06]"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-landing-panel border border-white/10 text-landing-cta shadow-inner">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-landing-display text-xl font-bold text-white">
                    {feat.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-white/65">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Show more toggle */}
        {extraFeatures.length > 0 && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:border-white/30 hover:bg-white/10"
            >
              <span>{showAll ? 'Show less' : 'See the full toolset — more modules'}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
