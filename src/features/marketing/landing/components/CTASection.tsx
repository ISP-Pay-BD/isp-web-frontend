'use client';

import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/Reveal';
import { useTranslations } from '@/features/marketing/shared';

export function CTASection() {
  const t = useTranslations();

  return (
    <section id="cta" className="border-t border-white/[0.07] py-20 md:py-28">
      <Reveal className="mx-auto max-w-3xl px-4 text-center md:px-6">
        <h2 className="font-landing-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {t('marketing.sections.ctaFinal.title')}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/60">
          {t('marketing.sections.ctaFinal.desc')}
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link href="/register">
            <Button className="bg-landing-cta hover:bg-landing-cta-hover h-11 px-6 text-sm font-semibold text-white">
              {t('marketing.sections.ctaFinal.primary')}
            </Button>
          </Link>
          <a
            href="https://wa.me/8801781808231?text=Hi%2C%20I%27d%20like%20to%20book%20an%20ISP%20Pay%20BD%20demo"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              className="h-11 border-white/15 bg-transparent px-5 text-sm font-medium text-white/90 hover:bg-white/5"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              {t('marketing.sections.ctaFinal.whatsapp')}
            </Button>
          </a>
          <a href="#contact">
            <Button
              variant="ghost"
              className="h-11 text-sm text-white/60 hover:bg-white/5 hover:text-white"
            >
              {t('marketing.sections.ctaFinal.sales')}
            </Button>
          </a>
        </div>

        <p className="mt-7 text-xs text-white/40">
          {t('marketing.sections.ctaFinal.bullet1')} · {t('marketing.sections.ctaFinal.bullet2')} ·{' '}
          {t('marketing.sections.ctaFinal.bullet3')}
        </p>
      </Reveal>
    </section>
  );
}
