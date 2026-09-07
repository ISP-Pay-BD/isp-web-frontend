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
    <section id="why-choose" className="border-b border-white/10 bg-[#0c0118] py-12 md:py-14">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {items.map((item, index) => {
            const Icon = iconMap[item.icon] ?? Clock;
            return (
              <li key={index} className="flex gap-3">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-landing-cta" aria-hidden />
                <div>
                  <h3 className="font-landing-display text-sm font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-white/60">{item.desc}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
