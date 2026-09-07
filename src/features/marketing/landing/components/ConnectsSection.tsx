'use client';

import { Terminal, Webhook, Smartphone, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/features/marketing/shared';
import type { ConnectItem } from '../types';

interface ConnectsSectionProps {
  connects: ConnectItem[];
}

const connectIcons = [Terminal, Webhook, Smartphone];

export function ConnectsSection({ connects }: ConnectsSectionProps) {
  const t = useTranslations();
  const displayConnects =
    connects.length > 0
      ? connects
      : [
          {
            name: 'REST API Access',
            desc: 'Query subscribers, trigger reconnects, and fetch billing ledgers from your internal ERP.',
          },
          {
            name: 'Realtime Webhooks',
            desc: 'Get instantaneous HTTP callbacks when a payment clears, line drops, or subscriber registers.',
          },
          {
            name: 'Mobile & Portal SDK',
            desc: 'Embed ISP Pay BD recharge widgets inside your existing Android app or community website.',
          },
        ];

  return (
    <section id="connects" className="relative border-t border-white/10 bg-landing-panel/50 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-landing-cta">
              {t('marketing.sections.connects.badge')}
            </p>
            <h2 className="font-landing-display mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {t('marketing.sections.connects.title')}
            </h2>
            <p className="mt-4 text-base text-white/60">{t('marketing.sections.connects.desc')}</p>
          </div>
          <a href="#contact">
            <Button
              variant="outline"
              className="h-10 border-white/15 bg-transparent px-5 text-sm text-white hover:bg-white/5"
            >
              Request API docs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </div>

        <ul className="mt-12 divide-y divide-white/10 border-y border-white/10">
          {displayConnects.map((item, idx) => {
            const Icon = connectIcons[idx % connectIcons.length] ?? Terminal;
            return (
              <li key={item.name} className="flex gap-4 py-5">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-landing-cta" aria-hidden />
                <div>
                  <h3 className="font-landing-display text-base font-semibold text-white">
                    {item.name}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/55">{item.desc}</p>
                  <p className="mt-2 font-mono text-[11px] text-white/35">JSON / HTTPS</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
