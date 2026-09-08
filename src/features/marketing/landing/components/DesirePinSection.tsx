'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useMotionSafe } from '@/lib/animations';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const GALLERY = [
  {
    seed: 'noc-wall',
    title: 'NOC visibility',
    copy: 'Live PPPoE sessions, optical power, and expiry windows — one surface for night ops.',
  },
  {
    seed: 'payment-match',
    title: 'Payment gravity',
    copy: 'bKash and Nagad land on the right invoice before your accountant opens Excel.',
  },
  {
    seed: 'reseller-map',
    title: 'Reseller ledger',
    copy: 'Fund POPs, split commission, and keep every wallet scoped to the right desk.',
  },
  {
    seed: 'customer-app-ui',
    title: 'Subscriber self-care',
    copy: 'Branded Bangla app for balance, renewals, and tickets — midnight calls drop.',
  },
] as const;

export function DesirePinSection() {
  const { reduced } = useMotionSafe();
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reduced || !rootRef.current) return;

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
    { dependencies: [reduced], scope: rootRef },
  );

  return (
    <section id="desire" ref={rootRef} className="relative py-32 md:py-48">
      <div
        data-desire-track
        className="mx-auto grid max-w-6xl gap-12 px-4 md:px-6 lg:grid-cols-12 lg:items-start lg:gap-10"
      >
        <div data-desire-pin className="lg:col-span-5">
          <h2 className="font-landing-display text-[clamp(2rem,4vw,3.5rem)] font-semibold tracking-tight text-white text-balance">
            Built for the desk that never sleeps
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/60">
            Scroll the night shift. Collection, sync, and support stay in frame while the network
            keeps moving.
          </p>
        </div>

        <div className="flex flex-col gap-10 lg:col-span-7 lg:gap-16">
          {GALLERY.map((item) => (
            <article
              key={item.seed}
              data-desire-card
              className="group overflow-hidden rounded-2xl border border-white/10 bg-landing-panel"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <div
                  data-desire-media
                  className="absolute inset-0 origin-center will-change-transform transition-transform duration-700 ease-out group-hover:scale-105"
                  style={{
                    backgroundImage: `url('https://picsum.photos/seed/${item.seed}/1400/900')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'grayscale(0.85) contrast(1.2) brightness(0.55)',
                    mixBlendMode: 'luminosity',
                  }}
                  aria-hidden
                />
                <div className="absolute inset-0 bg-gradient-to-t from-landing-panel via-transparent to-transparent" />
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
