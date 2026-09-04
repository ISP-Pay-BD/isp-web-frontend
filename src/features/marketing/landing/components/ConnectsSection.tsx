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
    <section id="connects" className="py-20 md:py-28 bg-landing-panel/50 border-t border-white/10 relative">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-landing-cta">
            {t('marketing.sections.connects.badge')}
          </span>
          <h2 className="font-landing-display mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {t('marketing.sections.connects.title')}
          </h2>
          <p className="mt-4 text-base text-white/70">{t('marketing.sections.connects.desc')}</p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {displayConnects.map((item, idx) => {
            const Icon = connectIcons[idx % connectIcons.length] ?? Terminal;
            return (
              <div
                key={item.name}
                className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-7 backdrop-blur-sm transition-all hover:border-landing-cta/40 hover:bg-white/[0.04]"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-landing-panel border border-white/10 text-landing-cta mb-5">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-landing-display text-xl font-bold text-white">{item.name}</h3>
                  <p className="mt-2.5 text-sm text-white/65 leading-relaxed">{item.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-landing-accent">
                  <span className="font-mono">JSON / HTTPS</span>
                  <span className="flex items-center gap-1 font-semibold">
                    {t('marketing.sections.connects.docsLink')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <a href="#contact">
            <Button variant="outline" className="border-white/20 bg-white/5 h-11 text-white hover:bg-white/10">
              Request API Documentation &amp; Sandbox Key
              <ArrowRight className="ml-2 h-4 w-4 text-landing-cta" />
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
