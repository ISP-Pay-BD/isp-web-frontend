'use client';

import { Building2, Store, Users2, ShieldCheck, ChevronDown } from 'lucide-react';
import { useTranslations } from '@/features/marketing/shared';
import type { ResellerHierarchyData } from '../types';

interface ResellerHierarchyProps {
  data: ResellerHierarchyData;
}

export function ResellerHierarchy({ data }: ResellerHierarchyProps) {
  const t = useTranslations();

  return (
    <section id="reseller" className="py-20 md:py-28 bg-[#0c0118] border-t border-white/10 relative">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-landing-cta">
            {t('marketing.sections.reseller.badge')}
          </span>
          <h2 className="font-landing-display mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {t('marketing.sections.reseller.title')}
          </h2>
          <p className="mt-4 text-base text-white/70">{data.description}</p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {data.levels.map((level, index) => (
            <span key={level} className="flex items-center gap-2 text-xs text-white/60">
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono">{level}</span>
              {index < data.levels.length - 1 && <span className="text-white/30">→</span>}
            </span>
          ))}
        </div>

        <div className="mt-14 mx-auto max-w-3xl flex flex-col items-center space-y-4">
          <div className="w-full rounded-2xl border border-landing-cta/40 bg-landing-panel/90 p-6 shadow-xl text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-landing-cta/20 text-landing-cta border border-landing-cta/30 mb-3">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className="font-landing-display text-xl font-bold text-white">
              {t('marketing.sections.reseller.operatorTitle')}
            </h3>
            <p className="mt-2 text-sm text-white/70 max-w-lg mx-auto">
              {t('marketing.sections.reseller.operatorDesc')}
            </p>
          </div>

          <div className="flex flex-col items-center text-white/40">
            <div className="h-6 w-0.5 bg-white/20" />
            <ChevronDown className="h-4 w-4 -mt-1" />
          </div>

          <div className="grid w-full gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-landing-panel text-landing-accent border border-white/10 mb-3">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="font-landing-display text-lg font-bold text-white">
                {t('marketing.sections.reseller.staffTitle')}
              </h4>
              <p className="mt-2 text-xs text-white/65 leading-relaxed">
                {t('marketing.sections.reseller.staffDesc')}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-landing-panel text-emerald-400 border border-white/10 mb-3">
                <Store className="h-5 w-5" />
              </div>
              <h4 className="font-landing-display text-lg font-bold text-white">
                {t('marketing.sections.reseller.popTitle')}
              </h4>
              <p className="mt-2 text-xs text-white/65 leading-relaxed">
                {t('marketing.sections.reseller.popDesc')}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center text-white/40">
            <div className="h-6 w-0.5 bg-white/20" />
            <ChevronDown className="h-4 w-4 -mt-1" />
          </div>

          <div className="w-full rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center backdrop-blur-sm">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-landing-panel text-blue-400 border border-white/10 mb-2">
              <Users2 className="h-5 w-5" />
            </div>
            <h4 className="font-landing-display text-lg font-bold text-white">
              {t('marketing.sections.reseller.customerTitle')}
            </h4>
            <p className="mt-1 text-xs text-white/65 max-w-md mx-auto">
              {t('marketing.sections.reseller.customerDesc')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
