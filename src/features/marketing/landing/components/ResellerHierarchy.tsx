'use client';

import { Building2, Store, Users2, ShieldCheck } from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';
import { useTranslations } from '@/features/marketing/shared';
import { PermissionsTable } from './PermissionsMatrix';
import { SectionTitle } from './SectionTitle';
import type { PermissionMatrixRow, ResellerHierarchyData } from '../types';

interface ResellerHierarchyProps {
  data: ResellerHierarchyData;
  matrix: PermissionMatrixRow[];
}

/** Who sees what: the operator → staff → POP → subscriber tiers beside the permission matrix. */
export function ResellerHierarchy({ data, matrix }: ResellerHierarchyProps) {
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
    <section id="reseller" className="relative z-[1] border-t border-white/10 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal>
          <SectionTitle
            title={t('marketing.sections.reseller.title')}
            description={t('marketing.sections.roles.desc')}
          />
          <p className="mt-4 font-mono text-xs text-white/60">{data.levels.join(' → ')}</p>
        </Reveal>

        <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal as="ol" className="divide-y divide-white/10 self-start border-y border-white/10">
            {tiers.map((tier, index) => {
              const Icon = tier.icon;
              return (
                <li key={tier.title} className="flex gap-4 py-5">
                  <span className="w-6 shrink-0 pt-0.5 font-mono text-xs text-white/60">
                    0{index + 1}
                  </span>
                  <Icon className="text-landing-accent mt-0.5 h-5 w-5 shrink-0" aria-hidden />
                  <div>
                    <h3 className="font-landing-display text-base font-semibold text-white">
                      {tier.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-white/55">{tier.desc}</p>
                  </div>
                </li>
              );
            })}
          </Reveal>

          <Reveal delay={0.08}>
            <PermissionsTable matrix={matrix} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
