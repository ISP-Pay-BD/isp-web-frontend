'use client';

import { Check, Lock } from 'lucide-react';
import { useTranslations } from '@/features/marketing/shared';
import type { PermissionMatrixRow } from '../types';

interface PermissionsMatrixProps {
  matrix: PermissionMatrixRow[];
}

export function PermissionsMatrix({ matrix }: PermissionsMatrixProps) {
  const t = useTranslations();

  const Cell = ({ on }: { on: boolean }) =>
    on ? (
      <Check className="mx-auto h-4 w-4 text-landing-cta" aria-label="Allowed" />
    ) : (
      <Lock className="mx-auto h-3.5 w-3.5 text-white/25" aria-label="Denied" />
    );

  return (
    <section id="permissions" className="relative border-t border-white/10 bg-[#0c0118] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-landing-cta">
            {t('marketing.sections.permissions.badge')}
          </p>
          <h2 className="font-landing-display mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {t('marketing.sections.permissions.title')}
          </h2>
          <p className="mt-4 text-base text-white/60">{t('marketing.sections.permissions.desc')}</p>
        </div>

        <div className="mt-12 overflow-x-auto border-y border-white/10">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs text-white/45">
                <th scope="col" className="py-4 pr-4 font-medium">
                  {t('marketing.sections.permissions.moduleCol')}
                </th>
                <th scope="col" className="px-3 py-4 text-center font-medium">
                  {t('marketing.sections.permissions.readCol')}
                </th>
                <th scope="col" className="px-3 py-4 text-center font-medium">
                  {t('marketing.sections.permissions.createCol')}
                </th>
                <th scope="col" className="px-3 py-4 text-center font-medium">
                  {t('marketing.sections.permissions.updateCol')}
                </th>
                <th scope="col" className="py-4 pl-3 text-center font-medium">
                  {t('marketing.sections.permissions.deleteCol')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.07]">
              {matrix.map((item) => (
                <tr key={item.module}>
                  <td className="py-4 pr-4 font-medium text-white/90">{item.module}</td>
                  <td className="px-3 py-4 text-center">
                    <Cell on={item.read} />
                  </td>
                  <td className="px-3 py-4 text-center">
                    <Cell on={item.create} />
                  </td>
                  <td className="px-3 py-4 text-center">
                    <Cell on={item.update} />
                  </td>
                  <td className="py-4 pl-3 text-center">
                    <Cell on={item.delete} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-xs text-white/45">{t('marketing.sections.permissions.footnote')}</p>
      </div>
    </section>
  );
}
