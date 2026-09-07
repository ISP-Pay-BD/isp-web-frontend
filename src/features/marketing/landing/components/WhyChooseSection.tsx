'use client';

import type { WhyChooseItem } from '../types';

interface WhyChooseSectionProps {
  items: WhyChooseItem[];
}

export function WhyChooseSection({ items }: WhyChooseSectionProps) {
  return (
    <section id="why-choose" className="border-y border-white/10 py-12 md:py-14">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {items.map((item, index) => (
            <li key={index}>
              <h3 className="font-landing-display text-sm font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/55">{item.desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
