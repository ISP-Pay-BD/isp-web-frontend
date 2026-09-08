'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useMotionSafe } from '@/lib/animations';
import { landingMedia } from '../media';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export interface DesireItem {
  title: string;
  copy: string;
}

interface DesirePinSectionProps {
  scrubLine: string;
  title: string;
  subtitle: string;
  items: DesireItem[];
}

export function DesirePinSection({ scrubLine, title, subtitle, items }: DesirePinSectionProps) {
  const { reduced } = useMotionSafe();
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reduced || !rootRef.current) return;

      const words = gsap.utils.toArray<HTMLElement>('[data-scrub-word]');
      if (words.length) {
        gsap.set(words, { opacity: 0.12 });
        gsap.to(words, {
          opacity: 1,
          ease: 'none',
          stagger: 0.08,
          scrollTrigger: {
            trigger: '[data-scrub-line]',
            start: 'top 80%',
            end: 'top 35%',
            scrub: true,
          },
        });
      }

      const mm = gsap.matchMedia();

      mm.add('(min-width: 1024px)', () => {
        const pinEl = rootRef.current?.querySelector<HTMLElement>('[data-desire-pin]');
        const track = rootRef.current?.querySelector<HTMLElement>('[data-desire-track]');
        if (!pinEl || !track) return;

        ScrollTrigger.create({
          trigger: track,
          start: 'top top+=96',
          end: 'bottom bottom',
          pin: pinEl,
          pinSpacing: true,
        });

        gsap.utils.toArray<HTMLElement>('[data-desire-card]').forEach((card) => {
          const media = card.querySelector<HTMLElement>('[data-desire-media]');
          if (!media) return;

          gsap.fromTo(
            media,
            { scale: 0.8, opacity: 0.45 },
            {
              scale: 1,
              opacity: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                start: 'top 90%',
                end: 'top 45%',
                scrub: true,
              },
            },
          );

          gsap.to(media, {
            opacity: 0.2,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'bottom 55%',
              end: 'bottom top',
              scrub: true,
            },
          });
        });
      });

      return () => mm.revert();
    },
    { dependencies: [reduced, scrubLine], scope: rootRef },
  );

  return (
    <section id="desire" ref={rootRef} className="relative py-32 md:py-48">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <p
          data-scrub-line
          className="font-landing-display max-w-4xl text-[clamp(1.5rem,3.2vw,2.75rem)] leading-tight font-semibold tracking-tight text-white text-balance"
        >
          {scrubLine.split(' ').map((word, i, words) => (
            <span key={`${word}-${i}`} data-scrub-word className="inline-block will-change-[opacity]">
              {word}
              {i < words.length - 1 ? '\u00A0' : ''}
            </span>
          ))}
        </p>
      </div>

      <div
        data-desire-track
        className="mx-auto mt-20 grid max-w-6xl gap-12 px-4 md:mt-28 md:px-6 lg:grid-cols-12 lg:items-start lg:gap-10"
      >
        <div data-desire-pin className="lg:col-span-5">
          <h2 className="font-landing-display text-[clamp(2rem,4vw,3.5rem)] font-semibold tracking-tight text-white text-balance">
            {title}
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/60">{subtitle}</p>
        </div>

        <div className="flex flex-col gap-10 lg:col-span-7 lg:gap-16">
          {items.map((item, index) => (
            <article
              key={item.title}
              data-desire-card
              className="group overflow-hidden rounded-2xl border border-white/10 bg-landing-panel"
            >
              <div className="relative aspect-16/10 overflow-hidden">
                <div
                  data-desire-media
                  className="absolute inset-0 origin-center will-change-transform transition-transform duration-700 ease-out group-hover:scale-105"
                  style={{
                    backgroundImage: `url('${landingMedia.desire[index] ?? landingMedia.desire[0]}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'grayscale(0.85) contrast(1.2) brightness(0.55)',
                    mixBlendMode: 'luminosity',
                  }}
                  aria-hidden
                />
                <div className="absolute inset-0 bg-linear-to-t from-landing-panel via-transparent to-transparent" />
              </div>
              <div className="p-6 md:p-8">
                <h3 className="font-landing-display text-xl font-semibold text-white md:text-2xl">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-white/60 md:text-base">
                  {item.copy}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
