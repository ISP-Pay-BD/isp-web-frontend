'use client';

import Link from 'next/link';
import { Puzzle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatBdtWithSymbol } from '@/lib/format';
import { useTranslations } from '@/features/marketing/shared';
import type { PluginItem } from '../types';

interface PluginsHighlightProps {
  plugins: PluginItem[];
}

export function PluginsHighlight({ plugins }: PluginsHighlightProps) {
  const t = useTranslations();
  const displayPlugins = plugins.slice(0, 4);

  return (
    <section id="plugins" className="py-20 md:py-28 bg-[#0c0118] border-t border-white/10 relative">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-landing-cta">
            {t('marketing.sections.plugins.badge')}
          </span>
          <h2 className="font-landing-display mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {t('marketing.sections.plugins.title')}
          </h2>
          <p className="mt-4 text-base text-white/70">{t('marketing.sections.plugins.desc')}</p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayPlugins.map((plugin) => (
            <div
              key={plugin.id}
              className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm transition-all hover:border-landing-cta/40 hover:bg-white/[0.05]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded bg-landing-cta/15 px-2.5 py-1 text-[11px] font-semibold text-landing-cta">
                    {plugin.category}
                  </span>
                  <span className="font-mono text-sm font-bold text-white">
                    {plugin.priceBdt === 0
                      ? t('common.free')
                      : `${formatBdtWithSymbol(plugin.priceBdt)}/mo`}
                  </span>
                </div>

                <div className="mt-6 flex h-12 w-12 items-center justify-center rounded-xl bg-landing-panel border border-white/10 text-landing-cta">
                  <Puzzle className="h-6 w-6" />
                </div>

                <h3 className="font-landing-display mt-4 text-lg font-bold text-white">{plugin.name}</h3>

                <p className="mt-2 text-xs text-white/65 leading-relaxed">
                  {plugin.desc ?? 'Modular add-on extending your core ISP platform.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {t('marketing.sections.plugins.instantActivation')}
                </span>
                <Link href="/plugins" className="text-white/60 hover:text-white transition-colors">
                  {t('marketing.sections.plugins.details')} &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/plugins">
            <Button variant="outline" className="h-11 border-white/20 bg-white/5 px-6 text-sm font-semibold text-white hover:bg-white/10">
              {t('marketing.sections.plugins.browseAll')}
              <ArrowRight className="ml-2 h-4 w-4 text-landing-cta" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
