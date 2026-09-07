'use client';

import type { TestimonialItem } from '../types';

interface TestimonialsProps {
  testimonials: TestimonialItem[];
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function Testimonials({ testimonials }: TestimonialsProps) {
  const list = testimonials.slice(0, 6);
  if (list.length === 0) return null;

  return (
    <section id="testimonials" className="border-t border-white/10 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="max-w-2xl">
          <h2 className="font-landing-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            From operators who run real lines
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/60">
            Local ISPs managing hundreds to thousands of subscribers — not demo quotes.
          </p>
        </div>

        <ul className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((item) => (
            <li key={item.name} className="border-t border-white/10 pt-6">
              <p className="text-sm leading-relaxed text-white/80">&ldquo;{item.quote}&rdquo;</p>
              <div className="mt-5 flex items-center gap-3">
                <span
                  aria-hidden
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-[11px] font-semibold text-white/70"
                >
                  {initials(item.name)}
                </span>
                <div className="min-w-0">
                  <p className="font-landing-display truncate text-sm font-semibold text-white">
                    {item.name}
                  </p>
                  <p className="truncate text-xs text-white/45">{item.role}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
