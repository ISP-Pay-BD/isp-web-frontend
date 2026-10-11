'use client';

import { Check, Lock } from 'lucide-react';
import { useTranslations } from '@/features/marketing/shared';
import type { PermissionMatrixRow } from '../types';

function Cell({ on }: { on: boolean }) {
  return on ? (
    <Check className="text-landing-cta mx-auto h-4 w-4" aria-label="Allowed" />
  ) : (
    <Lock className="mx-auto h-3.5 w-3.5 text-white/25" aria-label="Denied" />
  );
}

/** The per-module CRUD matrix, shown inside the hierarchy section beside the role tiers. */
export function PermissionsTable({ matrix }: { matrix: PermissionMatrixRow[] }) {
  const t = useTranslations();
  const k = (key: string) => t(`marketing.sections.permissions.${key}`);

  return (
    <div>
      <h3 className="font-landing-display text-lg font-semibold text-white">{k('title')}</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/55">{k('desc')}</p>

      <div className="mt-6 overflow-x-auto border-y border-white/10">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs text-white/45">
              <th scope="col" className="py-3 pr-4 font-medium">
                {k('moduleCol')}
              </th>
              <th scope="col" className="px-2 py-3 text-center font-medium">
                {k('readCol')}
              </th>
              <th scope="col" className="px-2 py-3 text-center font-medium">
                {k('createCol')}
              </th>
              <th scope="col" className="px-2 py-3 text-center font-medium">
                {k('updateCol')}
              </th>
              <th scope="col" className="py-3 pl-2 text-center font-medium">
                {k('deleteCol')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.07]">
            {matrix.map((item) => (
              <tr key={item.module}>
                <td className="py-3 pr-4 text-white/85">{item.module}</td>
                <td className="px-2 py-3 text-center">
                  <Cell on={item.read} />
                </td>
                <td className="px-2 py-3 text-center">
                  <Cell on={item.create} />
                </td>
                <td className="px-2 py-3 text-center">
                  <Cell on={item.update} />
                </td>
                <td className="py-3 pl-2 text-center">
                  <Cell on={item.delete} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-white/45">{k('footnote')}</p>
    </div>
  );
}
