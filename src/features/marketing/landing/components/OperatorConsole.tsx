'use client';

import { useTranslations } from '@/features/marketing/shared';
import { formatBdtWithSymbol } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { HeroStageData, StagePaymentStatus } from '../types';

const NAV_KEYS = [
  'navDashboard',
  'navCustomers',
  'navPayments',
  'navMikrotik',
  'navOlt',
  'navReports',
] as const;

const STATUS: Record<StagePaymentStatus, { key: string; tone: string }> = {
  reconnected: { key: 'statusReconnected', tone: 'bg-emerald-400/10 text-emerald-400' },
  matched: { key: 'statusMatched', tone: 'bg-white/[0.06] text-white/70' },
  review: { key: 'statusReview', tone: 'bg-amber-400/10 text-amber-300' },
};

/** The operator's payments screen in a browser frame: today's totals and the auto-matched ledger. */
export function OperatorConsole({
  stage,
  className,
}: {
  stage: HeroStageData;
  className?: string;
}) {
  const t = useTranslations();
  const k = (key: string) => t(`marketing.landing.console.${key}`);
  const totals = [
    { label: k('collected'), value: formatBdtWithSymbol(stage.totals.collectedBdt) },
    { label: k('matched'), value: stage.totals.matched.toLocaleString('en-US') },
    { label: k('review'), value: stage.totals.review.toLocaleString('en-US') },
  ];

  return (
    <div
      className={cn(
        'bg-landing-bg overflow-hidden rounded-2xl border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.55)]',
        className,
      )}
    >
      <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="ml-3 truncate rounded-md bg-white/[0.05] px-3 py-1 font-mono text-[11px] text-white/60">
          isppaybd.com/admin/payments
        </span>
      </div>

      <div className="flex">
        <ul className="hidden w-40 shrink-0 flex-col gap-1 border-r border-white/10 p-3 text-xs text-white/50 xl:flex">
          {NAV_KEYS.map((key) => (
            <li
              key={key}
              className={cn(
                'rounded-lg px-3 py-2',
                key === 'navPayments' && 'bg-landing-cta/10 text-landing-accent font-medium',
              )}
            >
              {k(key)}
            </li>
          ))}
        </ul>

        <div className="min-w-0 flex-1 p-5">
          <div className="flex items-baseline justify-between">
            <p className="font-landing-display text-base font-semibold text-white">{k('title')}</p>
            <span className="text-xs text-white/60">{k('today')}</span>
          </div>

          <dl className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10">
            {totals.map((item) => (
              <div key={item.label} className="bg-landing-bg flex flex-col-reverse px-4 py-3">
                <dd className="font-landing-display mt-1 text-lg font-semibold text-white tabular-nums">
                  {item.value}
                </dd>
                <dt className="text-[11px] text-white/60">{item.label}</dt>
              </div>
            ))}
          </dl>

          <table className="mt-4 w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[11px] text-white/60">
                <th className="py-2 pr-3 font-medium">{k('colTime')}</th>
                <th className="py-2 pr-3 font-medium">{k('colGateway')}</th>
                <th className="hidden py-2 pr-3 font-medium xl:table-cell">TrxID</th>
                <th className="py-2 pr-3 font-medium">{k('colCustomer')}</th>
                <th className="py-2 pr-3 text-right font-medium">{k('colAmount')}</th>
                <th className="py-2 text-right font-medium">{k('colStatus')}</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {stage.payments.map((payment) => {
                const status = STATUS[payment.status];
                return (
                  <tr key={payment.trxId} className="border-b border-white/[0.06] last:border-0">
                    <td className="py-2.5 pr-3 text-white/60">{payment.time}</td>
                    <td className="py-2.5 pr-3 font-sans text-white/80">{payment.gateway}</td>
                    <td className="hidden py-2.5 pr-3 text-white/55 xl:table-cell">
                      {payment.trxId}
                    </td>
                    <td className="py-2.5 pr-3 text-white/70">{payment.customer ?? '—'}</td>
                    <td className="py-2.5 pr-3 text-right text-white tabular-nums">
                      {formatBdtWithSymbol(payment.amountBdt)}
                    </td>
                    <td className="py-2.5 text-right">
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 font-sans text-[11px]',
                          status.tone,
                        )}
                      >
                        {k(status.key)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
