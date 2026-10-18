'use client';

import { Fragment } from 'react';
import { useTranslations } from '@/i18n/locale-context';

interface EntriesSummaryProps {
  from: number;
  to: number;
  total: number;
}

/** "Showing 1 to 10 of 42 entries" with the three numbers emphasised, in the active language. */
export function EntriesSummary({ from, to, total }: EntriesSummaryProps) {
  const t = useTranslations();
  const values: Record<string, number> = { from, to, total };
  const template = t('common.table.showing', 'Showing {from} to {to} of {total} entries');
  return (
    <>
      {template.split(/(\{\w+\})/).map((part, i) => {
        const name = /^\{(\w+)\}$/.exec(part)?.[1];
        return name && name in values ? (
          <span key={i} className="font-bold text-foreground">
            {values[name]}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        );
      })}
    </>
  );
}
