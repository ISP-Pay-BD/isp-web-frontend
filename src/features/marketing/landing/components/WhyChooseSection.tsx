'use client';

import { Clock, ShieldCheck, Headset, Wallet } from 'lucide-react';
import type { WhyChooseItem } from '../types';

interface WhyChooseSectionProps {
  items: WhyChooseItem[];
}

const iconMap: Record<string, React.ElementType> = {
  Clock,
  ShieldCheck,
  Headset,
  Wallet,
};

export function WhyChooseSection({ items }: WhyChooseSectionProps) {
  return (
    <section id="why-choose" className="py-16 md:py-20 border-b border-white/10 bg-[#0c0118]">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => {
            const Icon = iconMap[item.icon] ?? Clock;
            return (
              <div
                key={index}
                className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/[0.05]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-landing-panel border border-white/10 text-landing-cta">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-landing-display text-base font-bold text-white">
                    {item.title}
                  </h4>
                  <p className="mt-1 text-xs text-white/65 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
