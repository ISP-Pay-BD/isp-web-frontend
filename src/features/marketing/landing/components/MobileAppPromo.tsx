'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/Reveal';
import { landingAssets } from '@/config/assets';
import { useTranslations } from '@/features/marketing/shared';
import { SectionTitle } from './SectionTitle';
import { TiltCard } from './TiltCard';
import type { MobileAppData } from '../types';

interface MobileAppPromoProps {
  data: MobileAppData;
}

export function MobileAppPromo({ data }: MobileAppPromoProps) {
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

          {/* Real screens from the branded app: home in front, the payment gateways behind it. */}
          <Reveal
            delay={0.08}
            className="relative mx-auto h-[540px] w-full max-w-[400px] lg:col-span-5"
          >
            <div
              className="pointer-events-none absolute inset-0 -z-10"
              aria-hidden
              style={{
                backgroundImage:
                  'radial-gradient(closest-side, color-mix(in srgb, var(--landing-cta) 22%, transparent), transparent)',
              }}
            />
            <Image
              src={landingAssets.appScreens.payment}
              alt={t('marketing.landing.app.paymentAlt')}
              width={390}
              height={798}
              sizes="220px"
              className="absolute top-12 left-0 w-[200px] -rotate-6 drop-shadow-[0_30px_60px_rgba(0,0,0,0.55)] sm:w-[220px]"
            />
            <TiltCard className="absolute top-0 right-0 w-[230px] rounded-[2.5rem] sm:w-[250px]">
              <div className="rounded-[2.5rem] bg-white/[0.06] p-2 shadow-[0_30px_80px_rgba(0,0,0,0.6)] ring-1 ring-white/15">
                <Image
                  src={landingAssets.appScreens.home}
                  alt={t('marketing.landing.app.homeAlt')}
                  width={612}
                  height={1360}
                  sizes="250px"
                  className="h-auto w-full rounded-[2rem]"
                />
              </div>
            </TiltCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
