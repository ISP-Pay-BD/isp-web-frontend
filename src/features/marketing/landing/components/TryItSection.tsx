'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, UserCheck, User, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/features/marketing/shared';

const demoCards = [
  {
    role: 'Admin Panel',
    icon: Shield,
    sub: 'Full ISP management dashboard',
    user: 'demo@isppaybd.com',
    pass: '12345678',
    chips: ['Subscribers', 'Billing', 'MikroTik Sync', 'BTRC Reports'],
  },
  {
    role: 'Reseller Panel',
    icon: UserCheck,
    sub: 'POP reseller management portal',
    user: 'reseller@isppaybd.com',
    pass: '12345678',
    chips: ['Subscribers', 'Instant Recharge', 'Commissions', 'Ledger'],
  },
  {
    role: 'Customer Portal',
    icon: User,
    sub: 'Self-service client dashboard',
    user: '34003395',
    pass: '9591',
    chips: ['Dashboard', 'Invoices', 'bKash / Nagad', 'Tickets'],
  },
] as const;

export function TryItSection() {
  const t = useTranslations();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <section id="try-it" className="relative border-t border-white/10 bg-landing-bg py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-[0.08em] text-landing-cta">
            {t('marketing.sections.tryIt.badge')}
          </p>
          <h2 className="font-landing-display mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {t('marketing.sections.tryIt.title')}
          </h2>
          <p className="mt-4 text-base text-white/60">{t('marketing.sections.tryIt.desc')}</p>
        </div>

        <ul className="mt-12 divide-y divide-white/10 border-y border-white/10">
          {demoCards.map((card, idx) => {
            const Icon = card.icon;
            const userCopyId = `u-${idx}`;
            const passCopyId = `p-${idx}`;

            return (
              <li key={card.role} className="grid gap-4 py-6 md:grid-cols-12 md:items-center">
                <div className="flex items-start gap-3 md:col-span-4">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-landing-cta" aria-hidden />
                  <div>
                    <h3 className="font-landing-display text-base font-semibold text-white">
                      {card.role}
                    </h3>
                    <p className="mt-1 text-xs text-white/50">{card.sub}</p>
                    <p className="mt-2 text-[11px] text-white/40">{card.chips.join(' · ')}</p>
                  </div>
                </div>

                <div className="space-y-2 font-mono text-xs text-white/70 md:col-span-5">
                  <div className="flex items-center gap-2">
                    <span className="w-10 text-white/40">User</span>
                    <span className="truncate">{card.user}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(card.user, userCopyId)}
                      className="ml-auto text-white/40 hover:text-white"
                      aria-label="Copy username"
                    >
                      {copiedKey === userCopyId ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-10 text-white/40">Pass</span>
                    <span>{card.pass}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(card.pass, passCopyId)}
                      className="ml-auto text-white/40 hover:text-white"
                      aria-label="Copy password"
                    >
                      {copiedKey === passCopyId ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="md:col-span-3 md:text-right">
                  <Link href="/login">
                    <Button
                      size="sm"
                      className="bg-landing-cta hover:bg-landing-cta-hover h-9 px-4 text-xs font-semibold text-white"
                    >
                      Open demo
                    </Button>
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
