'use client';

import { Shield, Check, Lock } from 'lucide-react';
import { useTranslations } from '@/features/marketing/shared';
import type { PermissionMatrixRow } from '../types';

interface PermissionsMatrixProps {
  matrix: PermissionMatrixRow[];
}

export function PermissionsMatrix({ matrix }: PermissionsMatrixProps) {
  const t = useTranslations();

  return (
    <section id="permissions" className="py-20 md:py-28 bg-[#0c0118] border-t border-white/10 relative">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-landing-cta">
            {t('marketing.sections.permissions.badge')}
          </span>
          <h2 className="font-landing-display mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {t('marketing.sections.permissions.title')}
          </h2>
          <p className="mt-4 text-base text-white/70">{t('marketing.sections.permissions.desc')}</p>
        </div>

        <div className="mt-14 overflow-x-auto rounded-2xl border border-white/15 bg-landing-panel/60 backdrop-blur-xl">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-white/60">
                <th scope="col" className="p-4 font-semibold">
                  {t('marketing.sections.permissions.moduleCol')}
                </th>
                <th scope="col" className="p-4 text-center font-semibold">
                  {t('marketing.sections.permissions.readCol')}
                </th>
                <th scope="col" className="p-4 text-center font-semibold">
                  {t('marketing.sections.permissions.createCol')}
                </th>
                <th scope="col" className="p-4 text-center font-semibold">
                  {t('marketing.sections.permissions.updateCol')}
                </th>
                <th scope="col" className="p-4 text-center font-semibold">
                  {t('marketing.sections.permissions.deleteCol')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {matrix.map((item) => (
                <tr key={item.module} className="transition-colors hover:bg-white/[0.02]">
                  <td className="p-4 font-medium text-white/90 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-landing-cta" />
                    {item.module}
                  </td>
                  <td className="p-4 text-center">
                    {item.read ? (
                      <Check className="h-4 w-4 text-emerald-400 mx-auto" />
                    ) : (
                      <Lock className="h-3.5 w-3.5 text-white/20 mx-auto" />
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {item.create ? (
                      <Check className="h-4 w-4 text-emerald-400 mx-auto" />
                    ) : (
                      <Lock className="h-3.5 w-3.5 text-white/20 mx-auto" />
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {item.update ? (
                      <Check className="h-4 w-4 text-emerald-400 mx-auto" />
                    ) : (
                      <Lock className="h-3.5 w-3.5 text-white/20 mx-auto" />
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {item.delete ? (
                      <Check className="h-4 w-4 text-emerald-400 mx-auto" />
                    ) : (
                      <Lock className="h-3.5 w-3.5 text-white/20 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-center text-xs text-white/50">
          {t('marketing.sections.permissions.footnote')}
        </p>
      </div>
    </section>
  );
}
