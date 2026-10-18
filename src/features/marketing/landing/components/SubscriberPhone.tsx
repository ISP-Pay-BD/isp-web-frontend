'use client';

import { useTranslations } from '@/features/marketing/shared';
import { formatBdtWithSymbol } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { HeroStageData } from '../types';

/** The branded subscriber app in a phone frame: the due, one pay button, and paid invoices. */
export function SubscriberPhone({
  subscriber,
  className,
}: {
  subscriber: HeroStageData['subscriber'];
  className?: string;
}) {
  const t = useTranslations();
  const k = (key: string) => t(`marketing.landing.phone.${key}`);

  return (
    <div
      className={cn(
        'w-[250px] rounded-[2.5rem] bg-white/[0.06] p-2 shadow-[0_30px_80px_rgba(0,0,0,0.6)] ring-1 ring-white/15',
        className,
      )}
    >
      <div className="bg-landing-bg overflow-hidden rounded-[2rem]">
        <div className="flex items-center justify-between px-5 pt-3 text-[10px] text-white/50">
          <span>9:41</span>
          <span className="h-4 w-16 rounded-full bg-black/60" />
          <span>4G</span>
        </div>

        <div className="px-5 pt-4 pb-6">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="font-landing-display truncate text-sm font-semibold text-white">
                {k('isp')}
              </p>
              <p className="text-[11px] text-white/60">
                {k('greeting').replace('{name}', subscriber.name)}
              </p>
            </div>
            <span className="flex shrink-0 items-center gap-1 text-[10px] text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              {k('connected')}
            </span>
          </div>

          <div className="mt-5 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
            <p className="text-[11px] text-white/60">{k('due')}</p>
            <p className="font-landing-display mt-1 text-3xl font-semibold text-white tabular-nums">
              {formatBdtWithSymbol(subscriber.dueBdt)}
            </p>
            <p className="mt-1 text-[11px] text-white/60">
              {k('dueOn')} · {subscriber.packageName}
            </p>
            <div className="bg-landing-cta mt-4 flex h-10 items-center justify-center rounded-full text-xs font-semibold text-white">
              {k('pay')}
            </div>
          </div>

          <p className="mt-5 text-[11px] font-medium text-white/60">{k('invoices')}</p>
          <ul className="mt-2 divide-y divide-white/10 text-xs">
            {subscriber.invoices.map((invoice) => (
              <li key={invoice.month} className="flex justify-between py-2.5 text-white/70">
                <span>{invoice.month}</span>
                <span className="tabular-nums">
                  {formatBdtWithSymbol(invoice.amountBdt)} ·{' '}
                  <span className="text-emerald-400">{k('paid')}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
