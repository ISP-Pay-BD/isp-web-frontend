'use client';

import Link from 'next/link';
import { Rocket, MessageSquare, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/features/marketing/shared';

export function CTASection() {
  const t = useTranslations();

  return (
    <section id="cta" className="py-20 md:py-28 bg-landing-panel/60 border-t border-white/10 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[600px] rounded-full bg-[#f75803]/15 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-5xl px-4 md:px-6 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-landing-cta/40 bg-landing-cta/15 px-3.5 py-1 text-xs font-semibold text-landing-cta">
          {t('marketing.sections.ctaFinal.badge')}
        </span>

        <h2 className="font-landing-display mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
          {t('marketing.sections.ctaFinal.title')}
        </h2>

        <p className="mt-4 text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
          {t('marketing.sections.ctaFinal.desc')}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/register">
            <Button className="bg-landing-cta hover:bg-landing-cta-hover h-12 px-8 text-base font-semibold text-white shadow-xl shadow-orange-500/25">
              <Rocket className="mr-2 h-5 w-5" />
              {t('marketing.sections.ctaFinal.primary')}
            </Button>
          </Link>
          <a
            href="https://wa.me/8801781808231?text=Hi%2C%20I%27d%20like%20to%20book%20an%20ISP%20Pay%20BD%20demo"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="h-12 border-white/20 bg-white/5 px-6 text-base font-medium text-white hover:bg-white/10">
              <MessageSquare className="mr-2 h-5 w-5 text-emerald-400" />
              {t('marketing.sections.ctaFinal.whatsapp')}
            </Button>
          </a>
          <Link href="/contact">
            <Button variant="ghost" className="h-12 text-white/80 hover:text-white hover:bg-white/5">
              {t('marketing.sections.ctaFinal.sales')}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs text-white/50">
          <span>{t('marketing.sections.ctaFinal.bullet1')}</span>
          <span>{t('marketing.sections.ctaFinal.bullet2')}</span>
          <span>{t('marketing.sections.ctaFinal.bullet3')}</span>
        </div>
      </div>
    </section>
  );
}
