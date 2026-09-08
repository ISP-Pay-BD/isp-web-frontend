'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/Reveal';
import { useTranslations } from '@/features/marketing/shared';
import { useMotionSafe } from '@/lib/animations';
import { landingMedia } from '../media';

export function CTASection() {
  const t = useTranslations();
  const { reduced } = useMotionSafe();

  return (
    <section id="cta" className="relative z-[1] overflow-hidden py-32 md:py-48">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        aria-hidden
        style={{
          backgroundImage: `radial-gradient(ellipse 80% 55% at 50% 100%, color-mix(in srgb, var(--landing-cta) 32%, transparent), transparent 70%), url('${landingMedia.heroAtmosphere}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          filter: 'grayscale(1) contrast(1.1) brightness(0.45)',
          mixBlendMode: 'luminosity',
        }}
      />

      {!reduced ? (
        <motion.div
          className="pointer-events-none absolute bottom-[-20%] left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-landing-cta/20 blur-3xl"
          animate={{ opacity: [0.25, 0.45, 0.25], scale: [0.92, 1.05, 0.92] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden
        />
      ) : null}

      <Reveal className="relative mx-auto max-w-4xl px-4 text-center md:px-6">
        <h2 className="font-landing-display text-[clamp(2.5rem,6vw,4.5rem)] font-semibold tracking-[-0.04em] text-white text-balance">
          {t('marketing.sections.ctaFinal.title')}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
          {t('marketing.sections.ctaFinal.desc')}
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          <Link href="/register">
            <Button className="bg-landing-cta hover:bg-landing-cta-hover h-12 rounded-full px-8 text-sm font-semibold text-white shadow-[0_0_40px_rgba(247,88,3,0.25)] transition-[transform,box-shadow] duration-300 hover:shadow-[0_0_56px_rgba(247,88,3,0.4)] active:scale-[0.98] sm:h-14 sm:px-10 sm:text-base">
              {t('marketing.sections.ctaFinal.primary')}
            </Button>
          </Link>
          <a href="/contact">
            <Button
              variant="ghost"
              className="h-12 rounded-full border border-white/20 bg-white/4 px-7 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/8 active:scale-[0.98] sm:h-14 sm:px-8 sm:text-base"
            >
              {t('marketing.sections.ctaFinal.sales')}
            </Button>
          </a>
        </div>

        <p className="mt-8 text-xs text-white/40 sm:text-sm">
          {t('marketing.sections.ctaFinal.bullet1')} · {t('marketing.sections.ctaFinal.bullet2')} ·{' '}
          {t('marketing.sections.ctaFinal.bullet3')}
        </p>
      </Reveal>
    </section>
  );
}
