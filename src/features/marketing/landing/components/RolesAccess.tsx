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
    <section id="roles" className="relative border-t border-white/10 bg-landing-panel/50 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-[0.08em] text-landing-cta">
            {t('marketing.sections.roles.badge')}
          </p>
          <h2 className="font-landing-display mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {t('marketing.sections.roles.title')}
          </h2>
          <p className="mt-4 text-base text-white/60">{t('marketing.sections.roles.desc')}</p>
        </div>

        <ul className="mt-12 divide-y divide-white/10 border-y border-white/10">
          {roles.map((r) => {
            const Icon = roleIconMap[r.role] ?? Building2;
            return (
              <li key={r.role} className="flex gap-4 py-5">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-landing-cta" aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-landing-display text-base font-semibold text-white">
                      {r.role}
                    </h3>
                    <span className="text-[11px] text-white/40">
                      {t('marketing.sections.roles.strictRbac')}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/55">{r.access}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
