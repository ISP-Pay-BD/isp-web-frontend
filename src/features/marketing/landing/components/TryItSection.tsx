'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, UserCheck, User, Copy, Check, ArrowRight, Sparkles, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/features/marketing/shared';
import { Reveal, RevealItem } from '@/components/motion/Reveal';
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
    <section id="try-it" className="relative z-[1] border-t border-white/10 bg-landing-bg py-24 md:py-32">
      {/* Subtle ambient lighting */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[600px] rounded-full bg-landing-cta/5 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-4 md:px-6">
        <Reveal>
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-landing-cta/20 bg-landing-cta/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-landing-cta">
              <Sparkles className="h-3.5 w-3.5" />
              {t('marketing.sections.tryIt.badge')}
            </span>
            <h2 className="font-landing-display mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {t('marketing.sections.tryIt.title')}
            </h2>
            <p className="mt-4 text-base text-white/60 leading-relaxed">
              {t('marketing.sections.tryIt.desc')}
            </p>
          </div>
        </Reveal>

        <Reveal stagger className="mt-14 grid gap-6 md:grid-cols-3">
          {demoCards.map((card, idx) => {
            const Icon = card.icon;
            const userCopyId = `u-${idx}`;
            const passCopyId = `p-${idx}`;

            return (
              <RevealItem key={card.role}>
                <SpotlightCard className="h-full">
                  <div className="relative flex flex-col justify-between h-full p-6 sm:p-7">
                    {/* Header */}
                    <div>
                      <div className="flex items-center justify-between">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${card.iconBg}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white/50">
                          <KeyRound className="h-3 w-3 text-white/40" />
                          Demo Ready
                        </span>
                      </div>

                      <h3 className="font-landing-display mt-5 text-xl font-bold text-white tracking-tight">
                        {card.role}
                      </h3>
                      <p className="mt-1.5 text-xs text-white/60 leading-relaxed min-h-[32px]">
                        {card.sub}
                      </p>

                      {/* Feature Chips */}
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {card.chips.map((chip) => (
                          <span
                            key={chip}
                            className="rounded-md bg-white/[0.04] border border-white/5 px-2 py-0.5 text-[11px] text-white/50 font-medium"
                          >
                            {chip}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Credentials Box */}
                    <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
                      <div className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-2 font-mono text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-white/40 text-[11px] uppercase tracking-wider font-semibold">User</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(card.user, userCopyId)}
                            className="flex items-center gap-1.5 text-white/90 hover:text-white group/btn px-1.5 py-0.5 rounded transition-colors hover:bg-white/10"
                            title="Click to copy"
                          >
                            <span className="font-medium truncate max-w-[150px]">{card.user}</span>
                            {copiedKey === userCopyId ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 text-white/40 group-hover/btn:text-white shrink-0" />
                            )}
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                          <span className="text-white/40 text-[11px] uppercase tracking-wider font-semibold">Pass</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(card.pass, passCopyId)}
                            className="flex items-center gap-1.5 text-white/90 hover:text-white group/btn px-1.5 py-0.5 rounded transition-colors hover:bg-white/10"
                            title="Click to copy"
                          >
                            <span className="font-medium">{card.pass}</span>
                            {copiedKey === passCopyId ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 text-white/40 group-hover/btn:text-white shrink-0" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <Link href={card.loginHref} className="block w-full">
                        <Button
                          className="w-full bg-landing-cta hover:bg-landing-cta-hover text-white font-semibold text-xs h-10 shadow-lg shadow-landing-cta/20 transition-all duration-300 group hover:shadow-landing-cta/30"
                        >
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

