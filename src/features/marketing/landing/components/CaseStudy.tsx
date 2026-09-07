'use client';

import { MapPin, Users } from 'lucide-react';
import { useTranslations } from '@/features/marketing/shared';
import type { CaseStudyData } from '../types';

interface CaseStudyProps {
  data: CaseStudyData;
}

export function CaseStudy({ data }: CaseStudyProps) {
  const t = useTranslations();

  return (
    <section id="case-study" className="relative border-t border-white/10 bg-landing-panel/50 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-landing-cta">
            {t('marketing.sections.caseStudy.badge')}
          </p>
          <h2 className="font-landing-display mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            How {data.company} runs billing on autopilot
          </h2>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-7">
            <div>
              <h3 className="font-landing-display text-xl font-semibold text-white">{data.company}</h3>
              <div className="mt-2 flex flex-wrap gap-4 text-xs text-white/50">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-landing-cta" aria-hidden />
                  {data.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-landing-cta" aria-hidden />
                  {data.customers.toLocaleString()} active subscribers
                </span>
              </div>
            </div>

            <blockquote className="border-l-2 border-landing-cta/50 pl-4 text-lg leading-relaxed text-white/85">
              &ldquo;{data.quote}&rdquo;
            </blockquote>

            <p className="text-sm leading-relaxed text-white/55">
              Before switching, four office staff spent the first week of every month reading bKash
              SMS against ledger notebooks. Today, lines reconnect automatically in ~800ms.
            </p>
          </div>

          <dl className="divide-y divide-white/10 border-y border-white/10 lg:col-span-5">
            {data.results.map((res) => (
              <div key={res.label} className="flex items-baseline justify-between gap-4 py-4">
                <dt className="text-xs text-white/45">{res.label}</dt>
                <dd className="font-landing-display text-lg font-semibold tabular-nums text-white">
                  {res.metric}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
