'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/features/marketing/shared';
import { formatCount } from '@/lib/format';
import { Reveal } from '@/components/motion/Reveal';
import { pluginPriceLabel, usePublicPlugins } from '../hooks/use-marketing-plugins';

export function PluginsPage() {
  const t = useTranslations();
  const [activeCategory, setActiveCategory] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Debounce the server-side search.
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data, isLoading, isError, isFetching, refetch } = usePublicPlugins({
    search,
    category: activeCategory,
    page,
  });
  const plugins = data?.items ?? [];
  const categories = data?.categories ?? [];
  const filtered = search !== '' || activeCategory !== '';

  const resetFilters = () => {
    setActiveCategory('');
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  return (
    <div className="pt-32 pb-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal className="max-w-2xl">
          <p className="text-landing-accent text-xs font-medium tracking-[0.08em]">
            {t('marketing.pages.plugins.badge')}
          </p>
          <h1 className="font-landing-display mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {t('marketing.plugins.title', 'Modular add-ons for your ISP stack')}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/60">
            {t(
              'marketing.plugins.subtitle',
              'Browse the add-ons available on the platform and request the ones your operation needs.',
            )}
          </p>
        </Reveal>

        <Reveal
          className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          delay={0.05}
        >
          <div className="flex flex-wrap gap-2">
            {['', ...categories].map((cat) => (
              <button
                key={cat || '__all'}
                type="button"
                onClick={() => {
                  setActiveCategory(cat);
                  setPage(1);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-200 ease-out ${
                  activeCategory === cat
                    ? 'bg-landing-cta text-white'
                    : 'border border-white/10 text-white/60 hover:text-white'
                }`}
              >
                {cat || t('marketing.plugins.all', 'All')}
              </button>
            ))}
          </div>
          <div className="relative min-w-[220px]">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-white/60" aria-hidden />
            <input
              type="search"
              placeholder={t('marketing.plugins.searchPlaceholder', 'Search plugins...')}
              aria-label={t('marketing.plugins.searchLabel', 'Search plugins')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="focus:border-landing-cta w-full rounded-lg border border-white/10 bg-transparent py-2 pr-3 pl-9 text-sm text-white placeholder-white/40 focus:outline-none"
            />
          </div>
        </Reveal>

        <Reveal className="mt-10" delay={0.08}>
          {isLoading ? (
            <div className="border-y border-white/10 py-12 text-center text-sm text-white/50">
              {t('marketing.plugins.loading', 'Loading plugins…')}
            </div>
          ) : isError ? (
            <div className="border-y border-white/10 py-12 text-center">
              <p className="text-sm text-white/70">{t('marketing.plugins.loadFailed', 'Failed to load plugins.')}</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-white"
              >
                {t('common.retry', 'Retry')}
              </button>
            </div>
          ) : plugins.length === 0 ? (
            <div className="border-y border-white/10 py-12 text-center">
              <h3 className="text-base font-semibold text-white">
                {filtered
                  ? t('marketing.plugins.noMatch', 'No plugins match')
                  : t('marketing.plugins.noneYet', 'No plugins published yet')}
              </h3>
              <p className="mt-1 text-sm text-white/50">
                {filtered
                  ? t('marketing.plugins.noMatchHint', 'Try another keyword or clear filters.')
                  : t('marketing.plugins.noneYetHint', 'Check back soon for new add-ons.')}
              </p>
              {filtered ? (
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  className="mt-4 border-white/15 text-white duration-200 ease-out"
                >
                  {t('marketing.plugins.resetFilters', 'Reset filters')}
                </Button>
              ) : null}
            </div>
          ) : (
            <ul
              className={`divide-y divide-white/10 border-y border-white/10 transition-opacity duration-200 ${
                isFetching ? 'opacity-60' : ''
              }`}
            >
              {plugins.map((plugin) => (
                <li
                  key={plugin.id}
                  className="flex flex-wrap items-baseline justify-between gap-3 py-5"
                >
                  <div className="max-w-xl min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-landing-display text-base font-semibold text-white">
                        <Link
                          href={`/plugins/${encodeURIComponent(plugin.slug)}`}
                          className="transition-colors duration-200 hover:text-landing-accent"
                        >
                          {plugin.name}
                        </Link>
                      </h2>
                      <span className="text-xs text-white/60">{plugin.category}</span>
                    </div>
                    {plugin.description ? (
                      <p className="mt-1 line-clamp-2 text-sm text-white/55">{plugin.description}</p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm text-white/80 tabular-nums">
                      {pluginPriceLabel(t, plugin)}
                    </span>
                    <Button size="sm"
                        className="bg-landing-cta hover:bg-landing-cta-hover h-8 px-3 text-xs font-semibold text-white duration-200 ease-out" render={<Link href={`/plugins/${encodeURIComponent(plugin.slug)}`} />}>
                        {t('marketing.sections.plugins.details', 'Details')}
                      </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {data && data.totalPages > 1 ? (
            <div className="mt-6 flex items-center justify-end gap-3 text-xs text-white/50">
              <span className="tabular-nums">
                {t('marketing.plugins.pageOf', 'Page {page} of {total}', {
                  page: formatCount(data.page),
                  total: formatCount(data.totalPages),
                })}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="border-white/15 bg-transparent text-white duration-200 ease-out hover:bg-white/5"
              >
                {t('common.previous', 'Previous')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= data.totalPages || isFetching}
                onClick={() => setPage((p) => p + 1)}
                className="border-white/15 bg-transparent text-white duration-200 ease-out hover:bg-white/5"
              >
                {t('common.next', 'Next')}
              </Button>
            </div>
          ) : null}
        </Reveal>

        <Reveal className="mt-16 border-t border-white/10 pt-10" delay={0.04}>
          <h3 className="font-landing-display text-xl font-semibold text-white">
            {t('marketing.plugins.customTitle', 'Need a custom integration or local gateway?')}
          </h3>
          <p className="mt-2 max-w-xl text-sm text-white/55">
            {t(
              'marketing.plugins.customDesc',
              'Tell us about the hardware driver, billing bridge or SMS gateway you need.',
            )}
          </p>
          <Button variant="outline"
              className="h-10 border-white/15 bg-transparent px-5 text-sm text-white duration-200 ease-out hover:bg-white/5" render={<Link href="/contact" className="mt-5 inline-block" />}>
              {t('marketing.plugins.customCta', 'Request custom addon')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </Reveal>
      </div>
    </div>
  );
}
