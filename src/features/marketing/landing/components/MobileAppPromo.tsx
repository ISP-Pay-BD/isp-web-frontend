'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/Reveal';
import { useTranslations } from '@/features/marketing/shared';
import { SectionTitle } from './SectionTitle';
import { SubscriberPhone } from './SubscriberPhone';
import type { HeroStageData, MobileAppData } from '../types';

interface MobileAppPromoProps {
  data: MobileAppData;
  subscriber: HeroStageData['subscriber'];
}

export function MobileAppPromo({ data, subscriber }: MobileAppPromoProps) {
  const t = useTranslations();

  return (
    <section
      id="mobile-app"
      className="bg-landing-panel/50 relative z-[1] border-t border-white/10 py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <Reveal className="lg:col-span-7">
            <SectionTitle
              title={t('marketing.sections.mobileApp.title')}
              description={t('marketing.sections.mobileApp.desc')}
            />

            <ul className="mt-8 space-y-3">
              {data.features.map((feature) => (
                <li key={feature} className="flex gap-2 text-sm text-white/80">
                  <span className="bg-landing-cta mt-2 h-1 w-1 shrink-0 rounded-full" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              nativeButton={false}
              render={<Link href="/register" />}
              className="bg-landing-cta hover:bg-landing-cta-hover mt-8 h-11 rounded-full px-6 text-sm font-semibold text-white"
            >
              {t('marketing.sections.mobileApp.cta')}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Button>
          </Reveal>

          {/* The same subscriber app as in the hero, so the page tells one story. */}
          <Reveal delay={0.08} className="flex justify-center lg:col-span-5">
            <SubscriberPhone subscriber={subscriber} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
