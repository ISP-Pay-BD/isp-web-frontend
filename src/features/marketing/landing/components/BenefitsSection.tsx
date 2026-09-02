'use client';

import { Network, GitFork, Wallet } from 'lucide-react';
import type { BenefitItem } from '../types';

interface BenefitsSectionProps {
  benefits: BenefitItem[];
}

export function BenefitsSection({ benefits }: BenefitsSectionProps) {
  const icons = [Network, GitFork, Wallet];

  return (
    <section id="benefits" className="border-t border-white/10 bg-landing-panel/40 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-landing-cta">
            Built For ISPs
          </span>
          <h2 className="font-landing-display mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Built by people who&apos;ve run a MikroTik at 2am.
          </h2>
          <p className="mt-4 text-base text-white/70">
            Since 2020, Bangladeshi ISPs — from 300-line neighbourhood networks to multi-branch operators — run billing, MikroTik, resellers, and bKash collection from one place. Not five tabs and a spreadsheet.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {benefits.map((item, index) => {
            const Icon = icons[index] ?? Network;
            const isWide = index === 0;

            return (
              <div
                key={index}
                className={`relative flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm transition-all duration-300 hover:border-landing-cta/40 hover:bg-white/[0.05] ${
                  isWide ? 'md:col-span-3 lg:col-span-1' : ''
                }`}
              >
                <div>
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-landing-panel text-landing-cta shadow-inner">
                    <Icon className="h-7 w-7" />
                  </div>

                  <h3 className="font-landing-display text-2xl font-bold text-white">
                    {item.title}
                  </h3>

                  <p className="mt-4 text-sm leading-relaxed text-white/70">
                    {item.desc}
                  </p>
                </div>

                {item.stats && item.stats.length > 0 && (
                  <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/10 pt-6 text-xs text-white/80">
                    {item.stats.map((s, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span>{s.label}:</span>
                        <strong className="text-white">{s.value}</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
