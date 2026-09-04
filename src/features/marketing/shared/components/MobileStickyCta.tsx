'use client';

import { motion } from 'framer-motion';
import { MorphArrowButton } from '@/components/motion/MorphArrowButton';
import { useMotionSafe } from '@/lib/animations';
import { useTranslations } from '../context/LocaleContext';

export function MobileStickyCta() {
  const t = useTranslations();
  const { reduced } = useMotionSafe();

  return (
    <motion.div
      initial={reduced ? false : { y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: reduced ? 0 : 0.4, delay: reduced ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-landing-panel/95 p-3 backdrop-blur-md md:hidden"
    >
      <MorphArrowButton
        href="/register"
        magnetic={false}
        className="bg-landing-cta hover:bg-landing-cta-hover h-12 w-full text-base font-semibold text-white"
      >
        {t('marketing.stickyCta')}
      </MorphArrowButton>
    </motion.div>
  );
}
