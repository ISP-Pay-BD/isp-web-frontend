'use client';

import { Building2, Store, Users2, ShieldCheck } from 'lucide-react';
import { useTranslations } from '@/features/marketing/shared';
import type { ResellerHierarchyData } from '../types';

interface ResellerHierarchyProps {
  data: ResellerHierarchyData;
}

export function ResellerHierarchy({ data }: ResellerHierarchyProps) {
  const t = useTranslations();

  const tiers = [
    {
      icon: Building2,
      title: t('marketing.sections.reseller.operatorTitle'),
      desc: t('marketing.sections.reseller.operatorDesc'),
    },
    {
      icon: ShieldCheck,
      title: t('marketing.sections.reseller.staffTitle'),
      desc: t('marketing.sections.reseller.staffDesc'),
    },
    {
      icon: Store,
      title: t('marketing.sections.reseller.popTitle'),
      desc: t('marketing.sections.reseller.popDesc'),
    },
    {
      icon: Users2,
      title: t('marketing.sections.reseller.customerTitle'),
      desc: t('marketing.sections.reseller.customerDesc'),
    },
  ];

  return (
    <section id="reseller" className="relative border-t border-white/10 bg-landing-bg py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-[0.08em] text-landing-cta">
            {t('marketing.sections.reseller.badge')}
          </p>
          <h2 className="font-landing-display mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {t('marketing.sections.reseller.title')}
          </h2>
          <p className="mt-4 text-base text-white/60">{data.description}</p>
          <p className="mt-4 font-mono text-xs text-white/40">{data.levels.join(' → ')}</p>
        </div>

        <ol className="mt-12 divide-y divide-white/10 border-y border-white/10">
          {tiers.map((tier, index) => {
            const Icon = tier.icon;
            return (
              <li key={tier.title} className="flex gap-4 py-5">
                <span className="font-mono text-xs text-white/35 w-6 shrink-0 pt-0.5">
                  0{index + 1}
                </span>
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-landing-cta" aria-hidden />
                <div>
                  <h3 className="font-landing-display text-base font-semibold text-white">
                    {tier.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/55">{tier.desc}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
