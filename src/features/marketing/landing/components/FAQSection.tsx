'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Reveal, RevealItem } from '@/components/motion/Reveal';
import { useMotionSafe } from '@/lib/animations';
import type { FaqItem } from '../types';

interface FAQSectionProps {
  faq: FaqItem[];
  title?: string;
  subtitle?: string;
}

export function FAQSection({
  faq,
  title = 'Frequently asked questions',
  subtitle = 'MikroTik sync, payment gateways, reseller billing, fiber OLT, Bangla customer tools, and BTRC reports.',
}: FAQSectionProps) {
  // Support multi-open or single-open across 2 columns cleanly
  const [openIndices, setOpenIndices] = useState<number[]>([0]);
  const { reduced } = useMotionSafe();

  const toggleIndex = (idx: number) => {
    setOpenIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  return (
    <section id="faq" className="relative z-[1] border-t border-white/[0.07] bg-landing-bg py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal>
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-landing-cta/20 bg-landing-cta/10 px-3.5 py-1 text-xs font-semibold text-landing-cta">
              <HelpCircle className="h-3.5 w-3.5" />
              FAQ &amp; Knowledge Base
            </span>
            <h2 className="font-landing-display mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl text-balance">
              {title}
            </h2>
            <p className="mt-4 text-base text-white/60 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          </div>
        </Reveal>

        {/* 2 Balanced Masonry Columns to prevent uneven stretching */}
        <div className="mt-14 grid gap-4 md:grid-cols-2 md:gap-6 items-start">
          {/* Left Column */}
          <div className="space-y-4 md:space-y-6">
            {faq.filter((_, i) => i % 2 === 0).map((item) => {
              const originalIndex = faq.findIndex((f) => f.q === item.q);
              const isOpen = openIndices.includes(originalIndex);
              return (
                <div
                  key={item.q}
                  className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                    isOpen
                      ? 'border-landing-cta/40 bg-landing-panel/90 shadow-[0_12px_40px_rgba(0,0,0,0.5)] ring-1 ring-landing-cta/20'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleIndex(originalIndex)}
                    className="flex w-full items-start justify-between gap-4 p-5 sm:p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-landing-cta/50"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm sm:text-base font-semibold text-white/90 group-hover:text-white leading-snug">
                      {item.q}
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: reduced ? 0 : 0.2 }}
                      className={`inline-flex shrink-0 p-1.5 rounded-lg border transition-colors ${
                        isOpen
                          ? 'border-landing-cta/40 bg-landing-cta/15 text-landing-cta'
                          : 'border-white/10 bg-white/5 text-white/40 group-hover:text-white/70'
                      }`}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.div>
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
                        <div className="border-t border-white/10 px-5 pb-5 sm:px-6 sm:pb-6 pt-3.5 bg-black/20">
                          <p className="text-xs sm:text-sm leading-relaxed text-white/65">
                            {item.a}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Right Column */}
          <div className="space-y-4 md:space-y-6">
            {faq.filter((_, i) => i % 2 !== 0).map((item) => {
              const originalIndex = faq.findIndex((f) => f.q === item.q);
              const isOpen = openIndices.includes(originalIndex);
              return (
                <div
                  key={item.q}
                  className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                    isOpen
                      ? 'border-landing-cta/40 bg-landing-panel/90 shadow-[0_12px_40px_rgba(0,0,0,0.5)] ring-1 ring-landing-cta/20'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleIndex(originalIndex)}
                    className="flex w-full items-start justify-between gap-4 p-5 sm:p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-landing-cta/50"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm sm:text-base font-semibold text-white/90 group-hover:text-white leading-snug">
                      {item.q}
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: reduced ? 0 : 0.2 }}
                      className={`inline-flex shrink-0 p-1.5 rounded-lg border transition-colors ${
                        isOpen
                          ? 'border-landing-cta/40 bg-landing-cta/15 text-landing-cta'
                          : 'border-white/10 bg-white/5 text-white/40 group-hover:text-white/70'
                      }`}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.div>
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
                        <div className="border-t border-white/10 px-5 pb-5 sm:px-6 sm:pb-6 pt-3.5 bg-black/20">
                          <p className="text-xs sm:text-sm leading-relaxed text-white/65">
                            {item.a}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

