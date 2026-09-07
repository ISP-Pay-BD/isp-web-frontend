'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';
import { useMotionSafe } from '@/lib/animations';
import type { FaqItem } from '../types';

interface FAQSectionProps {
  faq: FaqItem[];
}

export function FAQSection({ faq }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { reduced } = useMotionSafe();

  return (
    <section id="faq" className="border-t border-white/[0.07] py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <Reveal className="max-w-xl">
          <h2 className="font-landing-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Answers before you ask sales
          </h2>
          <p className="mt-4 text-base text-white/55">
            Billing, MikroTik sync, bKash/Nagad reconciliation, and reseller payouts.
          </p>
        </Reveal>

        <Reveal className="mt-12 divide-y divide-white/[0.07] border-y border-white/[0.07]">
          {faq.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={item.q} className="group transition-colors hover:bg-white/[0.02]">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-landing-cta/50"
                  aria-expanded={isOpen}
                >
                  <span className="transition-transform duration-150 group-hover:translate-x-0.5">
                    {item.q}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: reduced ? 0 : 0.2 }}
                    className="inline-flex shrink-0"
                  >
                    <ChevronDown
                      className={`h-4 w-4 ${isOpen ? 'text-landing-cta' : 'text-white/40'}`}
                    />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="answer"
                      initial={reduced ? false : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={reduced ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: reduced ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 text-sm leading-relaxed text-white/55">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
