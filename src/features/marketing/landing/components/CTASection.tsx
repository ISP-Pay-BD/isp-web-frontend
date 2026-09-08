'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/features/marketing/shared';

export function CTASection() {
  const t = useTranslations();

  return (
    <section id="cta" className="relative overflow-hidden py-32 md:py-48">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 100%, color-mix(in srgb, var(--landing-cta) 22%, transparent), transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-5xl px-4 text-center md:px-6">
        <h2 className="font-landing-display mx-auto max-w-4xl text-[clamp(2.5rem,6vw,4.75rem)] font-semibold tracking-[-0.04em] text-white text-balance">
          {t('marketing.sections.ctaFinal.title')}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
          {t('marketing.sections.ctaFinal.desc')}
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          <Link href="/register">
            <Button className="bg-landing-cta hover:bg-landing-cta-hover h-12 rounded-full px-8 text-sm font-semibold text-white sm:h-14 sm:px-10 sm:text-base">
              {t('marketing.sections.ctaFinal.primary')}
            </Button>
          </Link>
          <a href="/contact">
            <Button
              variant="ghost"
              className="h-12 rounded-full border border-white/20 bg-white/[0.04] px-7 text-sm font-medium text-white hover:bg-white/[0.08] sm:h-14 sm:px-8 sm:text-base"
            >
              {t('marketing.sections.ctaFinal.sales')}
            </Button>
          </a>
        </div>

        <p className="mt-8 text-xs text-white/40 sm:text-sm">
          {t('marketing.sections.ctaFinal.bullet1')} · {t('marketing.sections.ctaFinal.bullet2')} ·{' '}
          {t('marketing.sections.ctaFinal.bullet3')}
        </p>
      </div>
    </section>
  );
}
