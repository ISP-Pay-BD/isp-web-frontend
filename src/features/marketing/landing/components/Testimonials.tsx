import { Star } from 'lucide-react';
import type { TestimonialItem } from '../types';

interface TestimonialsProps {
  testimonials: TestimonialItem[];
}

export function Testimonials({ testimonials }: TestimonialsProps) {
  return (
    <section id="testimonials" className="py-20 md:py-28 bg-landing-panel/50 border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-landing-accent">
            Operator Feedback
          </span>
          <h2 className="font-landing-display mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Trusted by ISP operators across Bangladesh
          </h2>
          <p className="mt-4 text-base text-white/70">
            Real reviews from local operators managing 300 to 10,000+ subscriber lines every single day.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {testimonials.map((t, index) => {
            const initials = t.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            return (
              <div
                key={index}
                className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-sm transition-all hover:border-landing-cta/40 hover:bg-white/[0.04]"
              >
                <div>
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.rating ?? 5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400" />
                    ))}
                  </div>

                  <p className="mt-6 text-base italic leading-relaxed text-white/90">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                <div className="mt-8 flex items-center gap-3.5 border-t border-white/10 pt-6">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-landing-cta/20 border border-landing-cta/40 font-bold text-landing-cta text-sm">
                    {initials}
                  </div>
                  <div>
                    <h4 className="font-landing-display text-base font-bold text-white">
                      {t.name}
                    </h4>
                    <p className="text-xs text-white/60">
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
