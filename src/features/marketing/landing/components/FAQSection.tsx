'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';
import { useLocale } from '@/features/marketing/shared';
import { useMotionSafe } from '@/lib/animations';
import { SectionTitle } from './SectionTitle';
import type { FaqItem } from '../types';

interface FAQSectionProps {
  faq: FaqItem[];
}

function FaqCard({
  question,
  answer,
  open,
  onToggle,
}: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  const { reduced } = useMotionSafe();

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border transition-colors duration-300 ${
        open
          ? 'border-landing-cta/40 bg-landing-panel/90 ring-landing-cta/20 ring-1'
          : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="focus-visible:ring-landing-cta/50 flex w-full items-start justify-between gap-4 p-5 text-left focus:outline-none focus-visible:ring-2 sm:p-6"
        aria-expanded={open}
      >
        <span className="text-sm leading-snug font-semibold text-white/90 group-hover:text-white sm:text-base">
          {question}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
            open ? 'text-landing-accent rotate-180' : 'text-white/60'
          }`}
          aria-hidden
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduced ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="border-t border-white/10 px-5 pt-3.5 pb-5 text-sm leading-relaxed text-white/65 sm:px-6 sm:pb-6">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQSection({ faq }: FAQSectionProps) {
  const { locale, t } = useLocale();
  const bn = locale === 'bn';
  const [openIndices, setOpenIndices] = useState<number[]>([0]);

  const toggle = (index: number) =>
    setOpenIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );

  const items = faq.map((item, index) => ({
    index,
    question: bn && item.qBn ? item.qBn : item.q,
    answer: bn && item.aBn ? item.aBn : item.a,
  }));
  const card = (item: (typeof items)[number]) => (
    <FaqCard
      key={item.index}
      question={item.question}
      answer={item.answer}
      open={openIndices.includes(item.index)}
      onToggle={() => toggle(item.index)}
    />
  );
  // Two balanced columns on desktop; one list in reading order on phones.
  const columns = [items.filter((_, i) => i % 2 === 0), items.filter((_, i) => i % 2 !== 0)];

  return (
    <section id="faq" className="relative z-[1] border-t border-white/[0.07] py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal>
          <SectionTitle
            align="center"
            title={t('marketing.landing.faq.title')}
            description={t('marketing.landing.faq.subtitle')}
          />
        </Reveal>

        <div className="mt-14 space-y-4 md:hidden">{items.map(card)}</div>
        <div className="mt-14 hidden items-start gap-6 md:grid md:grid-cols-2">
          {columns.map((column, c) => (
            <div key={c} className="space-y-6">
              {column.map(card)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
