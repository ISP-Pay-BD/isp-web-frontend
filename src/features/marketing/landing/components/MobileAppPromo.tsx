'use client';

import Link from 'next/link';
import { Smartphone, CheckCircle, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/features/marketing/shared';
import type { MobileAppData } from '../types';

interface MobileAppPromoProps {
  data: MobileAppData;
}

export function MobileAppPromo({ data }: MobileAppPromoProps) {
  const t = useTranslations();

  return (
    <section id="mobile-app" className="py-20 md:py-28 bg-landing-panel/50 border-t border-white/10 relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-landing-accent/30 bg-landing-accent/10 px-3.5 py-1 text-xs font-semibold text-landing-accent">
              <Smartphone className="h-3.5 w-3.5" />
              {t('marketing.sections.mobileApp.badge')}
            </span>

            <h2 className="font-landing-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl leading-tight">
              {t('marketing.sections.mobileApp.title')}
            </h2>

            <p className="text-base text-white/70 leading-relaxed max-w-xl">
              {t('marketing.sections.mobileApp.desc')}
            </p>

            <ul className="space-y-3.5 pt-2">
              {data.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-white/85">
                  <CheckCircle className="h-5 w-5 text-landing-cta shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 flex flex-wrap gap-4">
              <Link href="/register">
                <Button className="bg-landing-cta hover:bg-landing-cta-hover h-12 px-7 text-base font-semibold text-white shadow-lg shadow-orange-500/20">
                  {t('marketing.sections.mobileApp.cta')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[310px] rounded-[40px] border-4 border-white/20 bg-landing-bg p-3 shadow-2xl shadow-purple-900/40 backdrop-blur-2xl">
              <div className="mx-auto h-4 w-28 rounded-full bg-black/60 mb-3" />

              <div className="rounded-[28px] border border-white/10 bg-landing-panel/90 p-5 space-y-4 text-xs font-sans">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-landing-cta flex items-center justify-center font-bold text-white text-[10px]">
                      ISP
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">{data.title}</div>
                      <div className="text-[10px] text-white/50">Subscriber Portal</div>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                    ACTIVE
                  </span>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-center">
                  <div className="text-[11px] text-white/60">Current Due Balance</div>
                  <div className="font-mono text-2xl font-black text-white mt-1">৳1,240</div>
                  <div className="text-[10px] text-white/50 mt-1">
                    Due: 25th of month · 15 Mbps Home · #SUB-4182
                  </div>
                  <Button className="mt-3 w-full bg-landing-cta hover:bg-landing-cta-hover h-9 text-xs font-semibold text-white">
                    <Zap className="mr-1.5 h-3.5 w-3.5" />
                    Pay with bKash / Nagad
                  </Button>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                    Recent Billing Ledger
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white/5 p-2.5">
                    <span>Aug Invoice · ৳1,240</span>
                    <span className="font-mono text-emerald-400 font-bold">PAID</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white/5 p-2.5">
                    <span>Jul Invoice · ৳1,240</span>
                    <span className="font-mono text-emerald-400 font-bold">PAID</span>
                  </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5 flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-white/70">
                    <ShieldCheck className="h-3.5 w-3.5 text-landing-accent" />
                    PPPoE Line Status
                  </span>
                  <span className="text-emerald-400 font-mono font-semibold">Connected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
