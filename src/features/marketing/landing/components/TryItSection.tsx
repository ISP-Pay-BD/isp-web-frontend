'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, UserCheck, User, Copy, Check, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/features/marketing/shared';

const demoCards = [
  {
    role: 'Admin Panel',
    icon: Shield,
    sub: 'Full ISP management dashboard',
    user: 'demo@isppaybd.com',
    pass: '12345678',
    chips: ['Subscribers', 'Billing', 'MikroTik Sync', 'BTRC Reports', 'Accounting'],
    tag: 'Operator',
    color: 'text-landing-cta',
  },
  {
    role: 'Reseller Panel',
    icon: UserCheck,
    sub: 'POP reseller management portal',
    user: 'reseller@isppaybd.com',
    pass: '12345678',
    chips: ['Subscribers', 'Instant Recharge', 'Commissions', 'Ledger', 'Support'],
    tag: 'Reseller',
    color: 'text-emerald-400',
  },
  {
    role: 'Customer Portal',
    icon: User,
    sub: 'Self-service client dashboard',
    user: '34003395',
    pass: '9591',
    chips: ['Dashboard', 'Invoices', 'bKash / Nagad', 'WiFi Speed', 'Tickets'],
    tag: 'Subscriber',
    color: 'text-landing-accent',
  },
];

export function TryItSection() {
  const t = useTranslations();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <section id="try-it" className="py-20 md:py-28 bg-[#0c0118] border-t border-white/10 relative">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-landing-cta">
            {t('marketing.sections.tryIt.badge')}
          </span>
          <h2 className="font-landing-display mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {t('marketing.sections.tryIt.title')}
          </h2>
          <p className="mt-4 text-base text-white/70">{t('marketing.sections.tryIt.desc')}</p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {demoCards.map((card, idx) => {
            const Icon = card.icon;
            const userCopyId = `u-${idx}`;
            const passCopyId = `p-${idx}`;

            return (
              <div
                key={card.role}
                className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-7 backdrop-blur-sm transition-all hover:border-landing-cta/40 hover:bg-white/[0.04]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-landing-panel border border-white/10 text-landing-cta">
                      <Icon className={`h-5 w-5 ${card.color}`} />
                    </div>
                    <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10px] font-mono text-white/70">
                      {card.tag}
                    </span>
                  </div>

                  <h3 className="font-landing-display mt-4 text-xl font-bold text-white">{card.role}</h3>
                  <p className="mt-1 text-xs text-white/60">{card.sub}</p>

                  <div className="mt-6 space-y-2.5 rounded-xl border border-white/10 bg-white/[0.02] p-3.5 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-white/40">{t('marketing.sections.tryIt.userLabel')}</span>
                      <span className="text-white font-semibold">{card.user}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(card.user, userCopyId)}
                        className="text-white/50 hover:text-white"
                        title="Copy Username"
                      >
                        {copiedKey === userCopyId ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/40">{t('marketing.sections.tryIt.passLabel')}</span>
                      <span className="text-white font-semibold">{card.pass}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(card.pass, passCopyId)}
                        className="text-white/50 hover:text-white"
                        title="Copy Password"
                      >
                        {copiedKey === passCopyId ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {card.chips.map((chip) => (
                      <span
                        key={chip}
                        className="rounded-md border border-white/5 bg-white/[0.03] px-2 py-0.5 text-[10px] text-white/60"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <Link href={`/login?user=${encodeURIComponent(card.user)}&pass=${encodeURIComponent(card.pass)}`}>
                    <Button className="w-full bg-white/10 hover:bg-white/20 text-white h-10 text-xs font-semibold">
                      <PlayCircle className="mr-2 h-4 w-4 text-landing-cta" />
                      {t('marketing.sections.tryIt.openPanel').replace('{role}', card.role)}
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
