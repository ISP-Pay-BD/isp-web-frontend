'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { landingMedia } from '../media';
import type { TestimonialItem } from '../types';

interface TestimonialsProps {
  testimonials: TestimonialItem[];
  title?: string;
  subtitle?: string;
}

function cleanCopy(text: string) {
  return text.replace(/\s*[—–]\s*/g, ', ');
}

export function Testimonials({
  testimonials,
  title = 'What Bangladesh ISP operators say',
  subtitle = 'Feedback from owners, NOC leads, and accounts teams managing hundreds to thousands of lines.',
}: TestimonialsProps) {
  const list = testimonials.slice(0, 8);
  const [active, setActive] = useState(0);

  if (list.length === 0) return null;

  const current = list[active] ?? list[0];
  const goPrev = () => setActive((i) => (i - 1 + list.length) % list.length);
  const goNext = () => setActive((i) => (i + 1) % list.length);

  return (
    <section id="testimonials" className="py-32 md:py-48">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="max-w-2xl">
          <h2 className="font-landing-display text-[clamp(2rem,4vw,3.25rem)] font-semibold tracking-tight text-white text-balance">
            {title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/60">{subtitle}</p>
        </div>

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="flex items-end justify-center lg:col-span-5 lg:justify-start">
            <div className="flex items-center pl-2">
              {list.slice(0, 5).map((item, index) => {
                const isActive = index === Math.min(active, 4);
                return (
                  <button
                    key={`${item.name}-${index}`}
                    type="button"
                    onClick={() => setActive(index)}
                    aria-label={`Show testimonial from ${item.name}`}
                    aria-pressed={isActive}
                    className="relative -ml-4 first:ml-0 transition-transform duration-500 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-landing-cta/60"
                    style={{
                      zIndex: isActive ? 20 : 10 - index,
                      transform: isActive ? 'scale(1.12)' : 'scale(1)',
                    }}
                  >
                    <span
                      className={`block overflow-hidden rounded-full border-2 ${
                        isActive
                          ? 'h-24 w-24 border-white/50 sm:h-28 sm:w-28'
                          : 'h-14 w-14 border-white/20 opacity-70 hover:opacity-100 sm:h-16 sm:w-16'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={landingMedia.portraits[index % landingMedia.portraits.length]}
                        alt=""
                        className="h-full w-full object-cover grayscale contrast-125 transition-transform duration-700 ease-out hover:scale-105"
                      />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-7">
            <blockquote>
              <p className="font-landing-display text-[clamp(1.35rem,2.5vw,2rem)] leading-snug font-medium tracking-tight text-white text-balance">
                &ldquo;{cleanCopy(current.quote)}&rdquo;
              </p>
              <footer className="mt-8">
                <p className="font-landing-display text-base font-semibold text-white">
                  {current.name}
                </p>
                <p className="mt-1 text-sm text-white/45">{current.role}</p>
              </footer>
            </blockquote>

            <div className="mt-10 flex items-center gap-3">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous testimonial"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/30 hover:text-white active:scale-[0.96]"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next testimonial"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/30 hover:text-white active:scale-[0.96]"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
