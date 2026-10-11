'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/Reveal';
import { useTranslations } from '@/features/marketing/shared';

export function CTASection() {
  const t = useTranslations();

  return (
    <section id="cta" className="relative z-[1] overflow-hidden py-32 md:py-48">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(ellipse 70% 55% at 50% 100%, color-mix(in srgb, var(--landing-cta) 22%, transparent), transparent 70%)',
        }}
      />

      <Reveal className="relative mx-auto max-w-4xl px-4 text-center md:px-6">
        <h2 className="font-landing-display text-[clamp(2.5rem,6vw,4.5rem)] font-semibold tracking-[-0.04em] text-balance text-white">
          {t('marketing.sections.ctaFinal.title')}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
          {t('marketing.sections.ctaFinal.desc')}
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-3.5">
          <Button
            nativeButton={false}
            render={<Link href="/register" />}
            className="group bg-landing-cta hover:bg-landing-cta-hover h-13 rounded-full pr-2 pl-8 text-sm font-semibold text-white active:scale-[0.98] sm:h-14 sm:pl-9 sm:text-base"
          >
            <span className="mr-3">{t('marketing.sections.ctaFinal.primary')}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/20 transition-transform duration-300 group-hover:translate-x-0.5 sm:h-10 sm:w-10">
              <ArrowRight className="size-4" aria-hidden />
            </span>
          </Button>
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link href="/contact" />}
            className="h-13 rounded-full border border-white/20 bg-white/4 px-8 text-sm font-medium text-white transition-colors hover:border-white/35 hover:bg-white/8 active:scale-[0.98] sm:h-14 sm:px-9 sm:text-base"
          >
            {t('marketing.sections.ctaFinal.sales')}
          </Button>
        </div>

        <p className="mt-8 text-xs text-white/40 sm:text-sm">
          {t('marketing.sections.ctaFinal.bullet1')} · {t('marketing.sections.ctaFinal.bullet2')} ·{' '}
          {t('marketing.sections.ctaFinal.bullet3')}
        </p>
      </Reveal>
    </section>
  );
}
