'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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
    <section id="plugins" className="relative border-t border-white/10 bg-landing-bg py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.08em] text-landing-cta">
              {t('marketing.sections.plugins.badge')}
            </p>
            <h2 className="font-landing-display mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {t('marketing.sections.plugins.title')}
            </h2>
            <p className="mt-4 text-base text-white/60">{t('marketing.sections.plugins.desc')}</p>
          </div>
          <Link href="/plugins">
            <Button
              variant="outline"
              className="h-10 border-white/15 bg-transparent px-5 text-sm text-white hover:bg-white/5"
            >
              {t('marketing.sections.plugins.browseAll')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <ul className="mt-12 divide-y divide-white/10 border-y border-white/10">
          {displayPlugins.map((plugin) => (
            <li key={plugin.id} className="flex flex-wrap items-baseline justify-between gap-3 py-5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-landing-display text-base font-semibold text-white">
                    {plugin.name}
                  </h3>
                  <span className="text-[11px] text-white/40">{plugin.category}</span>
                </div>
                <p className="mt-1 max-w-xl text-sm text-white/55">
                  {plugin.desc ?? 'Modular add-on extending your core ISP platform.'}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="font-mono tabular-nums text-white/80">
                  {plugin.priceBdt === 0
                    ? t('common.free')
                    : `${formatBdtWithSymbol(plugin.priceBdt)}/mo`}
                </span>
                <Link href="/plugins" className="text-xs text-landing-cta hover:underline">
                  {t('marketing.sections.plugins.details')}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
