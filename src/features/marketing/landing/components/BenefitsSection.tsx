'use client';

import { motion } from 'framer-motion';
import { Reveal } from '@/components/motion/Reveal';
import { useMotionSafe, easeOutExpo } from '@/lib/animations';
import type { BenefitItem } from '../types';

interface BenefitsSectionProps {
  benefits: BenefitItem[];
}

export function BenefitsSection({ benefits }: BenefitsSectionProps) {
  const { reduced } = useMotionSafe();
  const lead = benefits[0];
  const rest = benefits.slice(1);

  return (
    <section id="benefits" className="relative z-[1] border-t border-white/10 py-32 md:py-48">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal>
          <div className="max-w-2xl">
            <h2 className="font-landing-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Built by people who&apos;ve run a MikroTik at 2am
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/60">
              Since 2020, Bangladeshi ISPs — from 300-line neighbourhood networks to multi-branch
              operators — run billing, MikroTik, resellers, and bKash collection from one place.
            </p>
          </div>
        </Reveal>

        {lead ? (
          <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-16">
            <motion.div
              className="rounded-2xl border border-white/10 bg-landing-panel/60 p-6 backdrop-blur-sm lg:col-span-5 lg:p-8"
              initial={reduced ? false : { opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.55, ease: easeOutExpo }}
            >
              <h3 className="font-landing-display text-xl font-semibold text-white">{lead.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/60">{lead.desc}</p>
              {lead.stats && lead.stats.length > 0 ? (
                <dl className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm">
                  {lead.stats.map((s) => (
                    <div key={s.label} className="flex justify-between gap-4">
                      <dt className="text-white/45">{s.label}</dt>
                      <dd className="font-medium tabular-nums text-landing-cta">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </motion.div>

            <ul className="divide-y divide-white/10 border-y border-white/10 lg:col-span-7">
              {rest.map((item, i) => (
                <motion.li
                  key={item.title}
                  className="group py-6 transition-colors hover:bg-white/[0.02]"
                  initial={reduced ? false : { opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 + i * 0.08, duration: 0.45, ease: easeOutExpo }}
                >
                  <h3 className="font-landing-display text-base font-semibold text-white group-hover:text-landing-cta transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/55">{item.desc}</p>
                </motion.li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
