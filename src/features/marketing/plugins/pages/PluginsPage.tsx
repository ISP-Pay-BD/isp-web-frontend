'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Puzzle,
  Search,
  CheckCircle2,
  Star,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatBdtWithSymbol } from '@/lib/format';
import { pluginsMarketplaceFull, pluginCategories } from '@/data/marketing/plugins.data';
import { useTranslations } from '@/features/marketing/shared';

export function PluginsPage() {
  const t = useTranslations();
  const plugins = pluginsMarketplaceFull;
  const categories = pluginCategories;
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

  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-landing-cta inline-flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            {t('marketing.pages.plugins.badge')}
          </span>
          <h1 className="font-landing-display mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            {t('marketing.pages.plugins.title')}
          </h1>
          <p className="mt-4 text-base md:text-lg text-white/70 leading-relaxed">
            {t('marketing.pages.plugins.subtitle')}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Categories Pill Bar */}
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                  activeCategory === cat
                    ? 'bg-landing-cta text-white shadow-md'
                    : 'border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Search plugins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:border-landing-cta focus:outline-none"
            />
          </div>
        </div>

        {/* Plugin Grid */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPlugins.map((plugin) => (
            <div
              key={plugin.id}
              className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-7 backdrop-blur-sm transition-all hover:border-landing-cta/40 hover:bg-white/[0.04]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded bg-landing-cta/15 px-2.5 py-1 text-[11px] font-semibold text-landing-cta">
                    {plugin.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-amber-400">
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    <span>{plugin.rating ?? 4.8}</span>
                    <span className="text-white/40 text-[10px]">
                      ({plugin.installs ?? 240})
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-landing-panel border border-white/10 text-landing-cta">
                    <Puzzle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-landing-display text-lg font-bold text-white">
                      {plugin.name}
                    </h3>
                    <div className="font-mono text-sm font-bold text-landing-accent">
                      {plugin.priceBdt === 0 ? 'Free' : `${formatBdtWithSymbol(plugin.priceBdt)}/mo`}
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-xs text-white/65 leading-relaxed">
                  {plugin.desc ?? 'Fully modular add-on for your operator console.'}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Instant Activation
                </span>
                <Link href="/register">
                  <Button className="bg-white/10 hover:bg-landing-cta text-white h-9 px-4 text-xs font-semibold transition-colors">
                    Activate
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredPlugins.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center my-12">
            <Puzzle className="mx-auto h-12 w-12 text-white/20 mb-3" />
            <h3 className="text-lg font-bold text-white">No plugins match your search</h3>
            <p className="mt-1 text-sm text-white/60">Try searching for other keywords or clear your active category filter.</p>
            <Button
              onClick={() => {
                setActiveCategory('All');
                setSearchQuery('');
              }}
              variant="outline"
              className="mt-4 border-white/20 text-white"
            >
              Reset Filters
            </Button>
          </div>
        )}

        {/* Custom Plugin Builder CTA */}
        <div className="mt-20 rounded-2xl border border-white/15 bg-landing-panel/90 p-8 md:p-12 text-center">
          <h3 className="font-landing-display text-2xl md:text-3xl font-bold text-white">
            Need a custom integration or local gateway?
          </h3>
          <p className="mt-3 text-sm md:text-base text-white/70 max-w-xl mx-auto">
            Our Dhaka-based engineering team develops custom hardware drivers, billing bridges, and SMS aggregator webhooks upon request.
          </p>
          <div className="mt-6 flex justify-center">
            <Link href="/#contact">
              <Button className="bg-landing-cta hover:bg-landing-cta-hover h-11 px-7 text-white font-semibold">
                Request Custom Addon
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
