'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/features/marketing/shared';
import type { MobileAppData } from '../types';

interface MobileAppPromoProps {
  data: MobileAppData;
}

export function MobileAppPromo({ data }: MobileAppPromoProps) {
  const t = useTranslations();

  return (
    <section id="mobile-app" className="relative border-t border-white/10 bg-landing-panel/50 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-landing-cta">
              {t('marketing.sections.mobileApp.badge')}
            </p>
            <h2 className="font-landing-display mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {t('marketing.sections.mobileApp.title')}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/60">
              {t('marketing.sections.mobileApp.desc')}
            </p>

            <ul className="mt-8 space-y-3">
              {data.features.map((feature) => (
                <li key={feature} className="flex gap-2 text-sm text-white/80">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-landing-cta" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Link href="/register">
                <Button className="bg-landing-cta hover:bg-landing-cta-hover h-11 px-6 text-sm font-semibold text-white">
                  {t('marketing.sections.mobileApp.cta')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-xl border border-white/10 bg-[#0c0118] p-5 text-sm">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <p className="font-landing-display text-sm font-semibold text-white">{data.title}</p>
                  <p className="text-xs text-white/45">Subscriber portal</p>
                </div>
                <span className="text-[11px] font-medium text-white/50">Active</span>
              </div>
              <div className="mt-4">
                <p className="text-xs text-white/45">Current due</p>
                <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-white">৳1,240</p>
                <p className="mt-1 text-[11px] text-white/40">Due 25th · 15 Mbps · #SUB-4182</p>
              </div>
              <ul className="mt-5 divide-y divide-white/10 border-y border-white/10 text-xs text-white/70">
                <li className="flex justify-between py-2.5">
                  <span>Aug invoice</span>
                  <span>Paid</span>
                </li>
                <li className="flex justify-between py-2.5">
                  <span>Jul invoice</span>
                  <span>Paid</span>
                </li>
              </ul>
              <p className="mt-4 text-xs text-white/50">PPPoE · Connected</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
