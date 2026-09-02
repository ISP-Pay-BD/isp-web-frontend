'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { FaqItem } from '../types';

interface FAQSectionProps {
  faq: FaqItem[];
}

export function FAQSection({ faq }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  const mid = Math.ceil(faq.length / 2);
  const leftCol = faq.slice(0, mid);
  const rightCol = faq.slice(mid);

  return (
    <section id="faq" className="py-20 md:py-28 bg-[#0c0118] border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-landing-cta">
            Frequently Asked Questions
          </span>
          <h2 className="font-landing-display mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Answers before you ask sales
          </h2>
          <p className="mt-4 text-base text-white/70">
            How billing, MikroTik RouterOS sync, bKash/Nagad auto-reconciliation, and reseller payouts work.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-4">
            {leftCol.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-white/10 bg-white/[0.02] transition-colors hover:border-white/20"
                >
                  <button
                    type="button"
                    onClick={() => toggle(idx)}
                    className="flex w-full items-center justify-between p-5 text-left text-base font-semibold text-white focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-white/60 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-landing-cta' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-white/10 px-5 pb-5 pt-3 text-sm leading-relaxed text-white/70">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {rightCol.map((item, idx) => {
              const actualIdx = mid + idx;
              const isOpen = openIndex === actualIdx;
              return (
                <div
                  key={actualIdx}
                  className="rounded-xl border border-white/10 bg-white/[0.02] transition-colors hover:border-white/20"
                >
                  <button
                    type="button"
                    onClick={() => toggle(actualIdx)}
                    className="flex w-full items-center justify-between p-5 text-left text-base font-semibold text-white focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-white/60 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-landing-cta' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-white/10 px-5 pb-5 pt-3 text-sm leading-relaxed text-white/70">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
