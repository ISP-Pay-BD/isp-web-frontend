'use client';

import { Crown, Building2, UserCheck, Store, User } from 'lucide-react';
import { useTranslations } from '@/features/marketing/shared';
import type { RoleAccessItem } from '../types';

interface RolesAccessProps {
  roles: RoleAccessItem[];
}

const roleIconMap: Record<string, React.ElementType> = {
  'Super Admin': Crown,
  'Tenant Admin': Building2,
  'Operator (Admin)': Building2,
  'POP Reseller': Store,
  Employee: UserCheck,
  Customer: User,
};

export function RolesAccess({ roles }: RolesAccessProps) {
  const t = useTranslations();

  return (
    <section id="roles" className="py-20 md:py-28 bg-landing-panel/50 border-t border-white/10 relative">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-landing-accent">
            {t('marketing.sections.roles.badge')}
          </span>
          <h2 className="font-landing-display mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {t('marketing.sections.roles.title')}
          </h2>
          <p className="mt-4 text-base text-white/70">{t('marketing.sections.roles.desc')}</p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((r, index) => {
            const Icon = roleIconMap[r.role] ?? Building2;
            const isHighlight = r.role.includes('Admin');

            return (
              <div
                key={r.role}
                className={`flex flex-col justify-between rounded-2xl border p-7 backdrop-blur-sm transition-all hover:border-landing-cta/40 hover:bg-white/[0.04] ${
                  isHighlight
                    ? 'border-landing-cta/30 bg-landing-panel/90 shadow-lg shadow-orange-500/5'
                    : 'border-white/10 bg-white/[0.02]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-landing-panel border border-white/10 text-landing-cta">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10px] font-mono text-white/60">
                      Tier 0{index + 1}
                    </span>
                  </div>

                  <h3 className="font-landing-display mt-5 text-xl font-bold text-white">{r.role}</h3>

                  <p className="mt-2.5 text-sm text-white/70 leading-relaxed">{r.access}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/40 font-mono">
                  <span>{t('marketing.sections.roles.isolatedScope')}</span>
                  <span className="text-emerald-400">{t('marketing.sections.roles.strictRbac')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
