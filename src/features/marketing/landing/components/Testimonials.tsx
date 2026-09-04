'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useMotionSafe } from '@/lib/animations';
import { cn } from '@/lib/utils';
import type { TestimonialItem } from '../types';

interface TestimonialsProps {
  testimonials: TestimonialItem[];
}

function TestimonialCard({ item }: { item: TestimonialItem }) {
  const avatar =
    item.image ??
    `https://i.pravatar.cc/150?u=${encodeURIComponent(item.name)}`;

  return (
    <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_0_24px_rgba(0,0,0,0.25)] backdrop-blur-sm">
      <div className="flex items-center gap-1 text-amber-400">
        {[...Array(item.rating ?? 5)].map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
        ))}
      </div>
      <p className="mt-4 min-h-[4.5rem] text-sm leading-relaxed text-white/85">
        &ldquo;{item.quote}&rdquo;
      </p>
      <div className="mt-5 flex items-center gap-3">
        <img
          src={avatar}
          alt={item.name}
          width={40}
          height={40}
          loading="eager"
          decoding="async"
          className="h-10 w-10 shrink-0 rounded-full border border-white/15 object-cover bg-white/10"
        />
        <div className="min-w-0">
          <h4 className="font-landing-display truncate text-sm font-bold text-white">
            {item.name}
          </h4>
          <p className="truncate text-xs text-white/55">{item.role}</p>
        </div>
      </div>
    </div>
  );
}

function ColumnStack({
  testimonials,
  ariaHidden,
}: {
  testimonials: TestimonialItem[];
  ariaHidden?: boolean;
}) {
  return (
    <div
      className="flex flex-col gap-6 pb-6"
      aria-hidden={ariaHidden || undefined}
    >
      {testimonials.map((item, i) => (
        <TestimonialCard key={`${item.name}-${i}`} item={item} />
      ))}
    </div>
  );
}

function TestimonialsColumn({
  testimonials,
  duration = 40,
  className,
  animate,
}: {
  testimonials: TestimonialItem[];
  duration?: number;
  className?: string;
  animate: boolean;
}) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <div
        className={cn(animate && 'animate-testimonials-marquee')}
        style={animate ? { animationDuration: `${duration}s` } : undefined}
      >
        {/* Two identical halves → -50% translate loops with no visible jump */}
        <ColumnStack testimonials={testimonials} />
        <ColumnStack testimonials={testimonials} ariaHidden />
      </div>
    </div>
  );
}

export function Testimonials({ testimonials }: TestimonialsProps) {
  const { reduced } = useMotionSafe();
  const list = testimonials.length > 0 ? testimonials : [];

  const col1 = list.filter((_, i) => i % 3 === 0);
  const col2 = list.filter((_, i) => i % 3 === 1);
  const col3 = list.filter((_, i) => i % 3 === 2);

  if (list.length === 0) return null;

  return (
    <section
      id="testimonials"
      className="relative border-t border-white/[0.07] bg-landing-panel/40 py-20 md:py-28"
    >
      <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-6">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="mx-auto flex max-w-[540px] flex-col items-center justify-center text-center"
        >
          <div className="rounded-lg border border-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-landing-cta">
            Testimonials
          </div>
          <h2 className="font-landing-display mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Trusted by ISP operators across Bangladesh
          </h2>
          <p className="mt-5 text-base text-white/60">
            Real reviews from local operators managing 300 to 10,000+ subscriber lines every day.
          </p>
        </motion.div>

        <div className="mt-12 flex justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)] max-h-[740px]">
          <TestimonialsColumn testimonials={col1} duration={45} animate={!reduced} />
          <TestimonialsColumn
            testimonials={col2.length > 0 ? col2 : col1}
            duration={58}
            className="hidden md:block"
            animate={!reduced}
          />
          <TestimonialsColumn
            testimonials={col3.length > 0 ? col3 : col1}
            duration={52}
            className="hidden lg:block"
            animate={!reduced}
          />
        </div>
      </div>
    </section>
  );
}
