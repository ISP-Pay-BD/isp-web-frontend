'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatBdtWithSymbol } from '@/lib/format';
import { useTranslations } from '@/features/marketing/shared';
import { Reveal } from '@/components/motion/Reveal';
import { useMarketingPlugins } from '../hooks/use-marketing-plugins';

export function PluginsPage() {
  const t = useTranslations();
  const { data, isLoading, isError, refetch } = useMarketingPlugins();
  const plugins = data?.plugins ?? [];
  const categories = data?.categories ?? ['All'];
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlugins = plugins.filter((p) => {
    const matchesCategory =
      activeCategory === 'All' || p.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.desc && p.desc.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="py-24 text-center text-sm text-white/50">Loading plugins…</div>
    );
  }

  if (isError) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm text-white/70">Failed to load plugins.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-landing-cta">
            {t('marketing.pages.plugins.badge')}
          </p>
          <h1 className="font-landing-display mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {t('marketing.pages.plugins.title')}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/60">
            {t('marketing.pages.plugins.subtitle')}
          </p>
        </Reveal>

        <Reveal className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" delay={0.05}>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-200 ease-out ${
                  activeCategory === cat
                    ? 'bg-landing-cta text-white'
                    : 'border border-white/10 text-white/60 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" aria-hidden />
            <input
              type="search"
              placeholder="Search plugins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-transparent py-2 pl-9 pr-3 text-sm text-white placeholder-white/40 focus:border-landing-cta focus:outline-none"
            />
          </div>
        </Reveal>

        <Reveal className="mt-10" delay={0.08}>
        {filteredPlugins.length === 0 ? (
          <div className="border-y border-white/10 py-12 text-center">
            <h3 className="text-base font-semibold text-white">No plugins match</h3>
            <p className="mt-1 text-sm text-white/50">Try another keyword or clear filters.</p>
            <Button
              onClick={() => {
                setActiveCategory('All');
                setSearchQuery('');
              }}
              variant="outline"
              className="mt-4 border-white/15 text-white duration-200 ease-out"
            >
              Reset filters
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-white/10 border-y border-white/10">
            {filteredPlugins.map((plugin) => (
              <li
                key={plugin.id}
                className="flex flex-wrap items-baseline justify-between gap-3 py-5"
              >
                <div className="min-w-0 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-landing-display text-base font-semibold text-white">
                      {plugin.name}
                    </h2>
                    <span className="text-[11px] text-white/40">{plugin.category}</span>
                  </div>
                  <p className="mt-1 text-sm text-white/55">
                    {plugin.desc ?? 'Modular add-on for your operator console.'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm tabular-nums text-white/80">
                    {plugin.priceBdt === 0 ? 'Free' : `${formatBdtWithSymbol(plugin.priceBdt)}/mo`}
                  </span>
                  <Link href="/register">
                    <Button
                      size="sm"
                      className="h-8 bg-landing-cta px-3 text-xs font-semibold text-white duration-200 ease-out hover:bg-landing-cta-hover"
                    >
                      Activate
                    </Button>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
        </Reveal>

        <Reveal className="mt-16 border-t border-white/10 pt-10" delay={0.04}>
          <h3 className="font-landing-display text-xl font-semibold text-white">
            Need a custom integration or local gateway?
          </h3>
          <p className="mt-2 max-w-xl text-sm text-white/55">
            Custom hardware drivers, billing bridges, and SMS aggregator webhooks on request.
          </p>
          <Link href="/#contact" className="mt-5 inline-block">
            <Button
              variant="outline"
              className="h-10 border-white/15 bg-transparent px-5 text-sm text-white duration-200 ease-out hover:bg-white/5"
            >
              Request custom addon
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </Reveal>
      </div>
    </div>
  );
}
