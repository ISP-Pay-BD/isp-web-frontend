'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/features/marketing/shared';

export function CTASection() {
  const t = useTranslations();

  return (
    <section id="cta" className="border-t border-white/10 py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <h2 className="font-landing-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {t('marketing.sections.ctaFinal.title')}
        </h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-white/60">
          {t('marketing.sections.ctaFinal.desc')}
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link href="/register">
            <Button className="h-12 rounded-lg bg-landing-cta px-6 text-sm font-semibold text-white hover:bg-landing-cta-hover">
              {t('marketing.sections.ctaFinal.primary')}
            </Button>
          </Link>
          <a href="/contact">
            <Button
              variant="ghost"
              className="h-12 rounded-lg px-4 text-sm font-medium text-white/70 hover:bg-white/[0.06] hover:text-white"
            >
              {t('marketing.sections.ctaFinal.sales')}
            </Button>
          </a>
        </div>

        <p className="mt-6 text-xs text-white/40">
          {t('marketing.sections.ctaFinal.bullet1')} · {t('marketing.sections.ctaFinal.bullet2')} ·{' '}
          {t('marketing.sections.ctaFinal.bullet3')}
        </p>
      </div>
    </section>
  );
}
