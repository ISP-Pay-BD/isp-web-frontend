'use client';

import { Quote, MapPin, Users, TrendingUp } from 'lucide-react';
import { useTranslations } from '@/features/marketing/shared';
import type { CaseStudyData } from '../types';

interface CaseStudyProps {
  data: CaseStudyData;
}

export function CaseStudy({ data }: CaseStudyProps) {
  const t = useTranslations();

  return (
    <section id="case-study" className="py-20 md:py-28 bg-landing-panel/50 border-t border-white/10 relative">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-landing-accent">
            {t('marketing.sections.caseStudy.badge')}
          </span>
          <h2 className="font-landing-display mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            How {data.company} runs billing on autopilot
          </h2>
        </div>

        <div className="mt-14 rounded-2xl border border-white/15 bg-white/[0.02] p-8 md:p-12 backdrop-blur-xl">
          <div className="grid gap-8 lg:grid-cols-12 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-landing-cta/20 border border-landing-cta/40 flex items-center justify-center font-bold text-landing-cta">
                  FN
                </div>
                <div>
                  <h3 className="font-landing-display text-xl font-bold text-white">
                    {data.company}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-white/60">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-landing-cta" />
                      {data.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-landing-accent" />
                      {data.customers.toLocaleString()} active subscribers
                    </span>
                  </div>
                </div>
              </div>

              <blockquote className="text-lg md:text-xl italic text-white/90 leading-relaxed">
                <Quote className="h-8 w-8 text-landing-cta/40 mb-2" />
                &ldquo;{data.quote}&rdquo;
              </blockquote>

              <p className="text-sm text-white/65 leading-relaxed">
                Before switching to ISP Pay BD, four office staff spent the first week of every month manually reading bKash transaction SMS and cross-referencing ledger notebooks. Today, lines reconnect automatically in 800ms.
              </p>
            </div>

            {/* Right Metrics Box */}
            <div className="lg:col-span-5 grid grid-cols-1 gap-4">
              {data.results.map((res, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/10 bg-landing-panel/90 p-5 shadow-lg flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs text-white/50 uppercase tracking-wider">{res.label}</div>
                    <div className="font-landing-display text-2xl font-black text-white mt-1">
                      {res.metric}
                    </div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
