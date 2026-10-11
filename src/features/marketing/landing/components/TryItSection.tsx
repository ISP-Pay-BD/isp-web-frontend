'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, UserCheck, User, Copy, Check, ArrowRight, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/features/marketing/shared';
import { Reveal, RevealItem } from '@/components/motion/Reveal';
import { SectionTitle } from './SectionTitle';
import { SpotlightCard } from './SpotlightCard';

const demoCards = [
  {
    role: 'Admin Panel',
    icon: Shield,
    accent: 'from-orange-500/20 to-amber-500/10',
    borderGlow: 'hover:border-landing-cta/40',
    iconBg: 'bg-landing-cta/10 text-landing-cta border-landing-cta/20',
    sub: 'Full ISP management dashboard',
    user: 'demo@isppaybd.com',
    pass: '12345678',
    chips: ['Subscribers', 'Billing', 'MikroTik Sync', 'BTRC Reports'],
    loginHref: '/login?role=admin',
  },
  {
    role: 'Reseller Panel',
    icon: UserCheck,
    accent: 'from-blue-500/20 to-cyan-500/10',
    borderGlow: 'hover:border-blue-400/40',
    iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    sub: 'POP reseller management portal',
    user: 'reseller@isppaybd.com',
    pass: '12345678',
    chips: ['Subscribers', 'Instant Recharge', 'Commissions', 'Ledger'],
    loginHref: '/login?role=reseller',
  },
  {
    role: 'Customer Portal',
    icon: User,
    accent: 'from-emerald-500/20 to-teal-500/10',
    borderGlow: 'hover:border-emerald-400/40',
    iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    sub: 'Self-service client dashboard',
    user: '34003395',
    pass: '9591',
    chips: ['Dashboard', 'Invoices', 'bKash / Nagad', 'Tickets'],
    loginHref: '/login?role=customer',
  },
] as const;

export function TryItSection() {
  const t = useTranslations();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <section
      id="try-it"
      className="bg-landing-bg relative z-[1] border-t border-white/10 py-24 md:py-32"
    >
      <div className="relative mx-auto max-w-6xl px-4 md:px-6">
        <Reveal>
          <SectionTitle
            align="center"
            title={t('marketing.sections.tryIt.title')}
            description={t('marketing.sections.tryIt.desc')}
          />
        </Reveal>

        <Reveal stagger className="mt-14 grid gap-6 md:grid-cols-3">
          {demoCards.map((card, idx) => {
            const Icon = card.icon;
            const userCopyId = `u-${idx}`;
            const passCopyId = `p-${idx}`;

            return (
              <RevealItem key={card.role}>
                <SpotlightCard className="h-full">
                  <div className="relative flex h-full flex-col justify-between p-6 sm:p-7">
                    {/* Header */}
                    <div>
                      <div className="flex items-center justify-between">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl border ${card.iconBg}`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium text-white/50">
                          <KeyRound className="h-3 w-3 text-white/40" />
                          Demo Ready
                        </span>
                      </div>

                      <h3 className="font-landing-display mt-5 text-xl font-bold tracking-tight text-white">
                        {card.role}
                      </h3>
                      <p className="mt-1.5 min-h-[32px] text-xs leading-relaxed text-white/60">
                        {card.sub}
                      </p>

                      {/* Feature Chips */}
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {card.chips.map((chip) => (
                          <span
                            key={chip}
                            className="rounded-md border border-white/5 bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-white/50"
                          >
                            {chip}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Credentials Box */}
                    <div className="mt-6 space-y-3 border-t border-white/10 pt-5">
                      <div className="space-y-2 rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold tracking-wider text-white/40 uppercase">
                            User
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(card.user, userCopyId)}
                            className="group/btn flex items-center gap-1.5 rounded px-1.5 py-0.5 text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                            title="Click to copy"
                          >
                            <span className="max-w-[150px] truncate font-medium">{card.user}</span>
                            {copiedKey === userCopyId ? (
                              <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 shrink-0 text-white/40 group-hover/btn:text-white" />
                            )}
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-1">
                          <span className="text-[11px] font-semibold tracking-wider text-white/40 uppercase">
                            Pass
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(card.pass, passCopyId)}
                            className="group/btn flex items-center gap-1.5 rounded px-1.5 py-0.5 text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                            title="Click to copy"
                          >
                            <span className="font-medium">{card.pass}</span>
                            {copiedKey === passCopyId ? (
                              <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 shrink-0 text-white/40 group-hover/btn:text-white" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <Link href={card.loginHref} className="block w-full">
                        <Button className="bg-landing-cta hover:bg-landing-cta-hover shadow-landing-cta/20 group hover:shadow-landing-cta/30 h-10 w-full text-xs font-semibold text-white shadow-lg transition-all duration-300">
                          <span>Explore {card.role}</span>
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </SpotlightCard>
              </RevealItem>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
