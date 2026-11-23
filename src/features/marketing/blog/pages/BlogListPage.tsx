'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/Reveal';
import { useTranslations } from '@/features/marketing/shared';
import { formatCount } from '@/lib/format';
import { usePublicBlogs } from '../hooks/use-public-blog';
import { BlogPostCard, blogDate } from '../components/BlogPostCard';

export function BlogListPage() {
  const t = useTranslations();
  const [category, setCategory] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Debounce the server-side search; a new search starts at page 1.
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data, isLoading, isError, isFetching, refetch } = usePublicBlogs({
    category,
    search,
    page,
  });
  const posts = data?.items ?? [];
  const filtered = category !== '' || search !== '';
  const [lead, ...rest] = posts;
  const showLead = !filtered && page === 1 && lead;
  const lastPage = data?.lastPage ?? 1;

  const reset = () => {
    setCategory('');
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  const goTo = (next: number) => {
    setPage(next);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pt-32 pb-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal className="max-w-2xl">
          <p className="text-landing-accent text-xs font-medium tracking-[0.08em]">
            {t('marketing.blog.badge', 'Blog & insights')}
          </p>
          <h1 className="font-landing-display mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {t('marketing.blog.title', 'Notes on running a modern ISP')}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/60">
            {t(
              'marketing.blog.subtitle',
              'Billing automation, MikroTik operations, reseller growth and what we learn building ISP Pay BD.',
            )}
          </p>
        </Reveal>

        <Reveal
          className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          delay={0.05}
        >
          <div className="flex flex-wrap gap-2">
            {(data?.categories ?? []).map((c) => {
              const value = c.name === 'All' ? '' : c.name;
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => {
                    setCategory(value);
                    setPage(1);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-200 ease-out ${
                    category === value
                      ? 'bg-landing-cta text-white'
                      : 'border border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  {c.name === 'All' ? t('marketing.blog.all', 'All') : c.name}{' '}
                  <span className="tabular-nums opacity-60">{formatCount(c.count)}</span>
                </button>
              );
            })}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-white/60" aria-hidden />
            <input
              type="search"
              placeholder={t('marketing.blog.searchPlaceholder', 'Search articles…')}
              aria-label={t('marketing.blog.searchLabel', 'Search articles')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="focus:border-landing-cta w-full rounded-lg border border-white/10 bg-transparent py-2 pr-3 pl-9 text-sm text-white placeholder-white/40 focus:outline-none"
            />
          </div>
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <Reveal delay={0.08}>
            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2" aria-busy="true">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-72 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]"
                  />
                ))}
              </div>
            ) : isError ? (
              <div className="border-y border-white/10 py-12 text-center">
                <p className="text-sm text-white/70">
                  {t('marketing.blog.loadFailed', 'Failed to load articles.')}
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-4 rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {t('common.retry', 'Retry')}
                </button>
              </div>
            ) : posts.length === 0 ? (
              <div className="border-y border-white/10 py-12 text-center">
                <h2 className="text-base font-semibold text-white">
                  {filtered
                    ? t('marketing.blog.noMatch', 'No articles match')
                    : t('marketing.blog.noneYet', 'No articles published yet')}
                </h2>
                <p className="mt-1 text-sm text-white/50">
                  {filtered
                    ? t('marketing.blog.noMatchHint', 'Try another keyword or category.')
                    : t('marketing.blog.noneYetHint', 'Check back soon for new posts.')}
                </p>
                {filtered ? (
                  <Button
                    onClick={reset}
                    variant="outline"
                    className="mt-4 border-white/15 text-white duration-200 ease-out"
                  >
                    {t('marketing.blog.resetFilters', 'Reset filters')}
                  </Button>
                ) : null}
              </div>
            ) : (
              <div
                className={`space-y-6 transition-opacity duration-200 ${isFetching ? 'opacity-60' : ''}`}
              >
                {showLead ? <BlogPostCard post={lead} featured /> : null}
                <div className="grid gap-6 sm:grid-cols-2">
                  {(showLead ? rest : posts).map((post) => (
                    <BlogPostCard key={post.id} post={post} />
                  ))}
                </div>
                {lastPage > 1 ? (
                  <nav
                    aria-label={t('marketing.blog.pagination', 'Article pages')}
                    className="flex items-center justify-between gap-3 border-t border-white/10 pt-6"
                  >
                    <button
                      type="button"
                      disabled={page <= 1 || isFetching}
                      onClick={() => goTo(page - 1)}
                      className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 transition-colors duration-200 ease-out hover:bg-white/5 hover:text-white disabled:pointer-events-none disabled:opacity-40"
                    >
                      {t('marketing.blog.prev', 'Newer')}
                    </button>
                    <span className="text-sm text-white/60 tabular-nums">
                      {t('marketing.blog.pageOf', 'Page {page} of {pages}', {
                        page,
                        pages: lastPage,
                      })}
                    </span>
                    <button
                      type="button"
                      disabled={page >= lastPage || isFetching}
                      onClick={() => goTo(page + 1)}
                      className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 transition-colors duration-200 ease-out hover:bg-white/5 hover:text-white disabled:pointer-events-none disabled:opacity-40"
                    >
                      {t('marketing.blog.next', 'Older')}
                    </button>
                  </nav>
                ) : null}
              </div>
            )}
          </Reveal>

          {data && data.recent.length > 0 ? (
            <Reveal className="lg:sticky lg:top-28 lg:self-start" delay={0.1}>
              <aside className="space-y-4">
                <h2 className="text-xs font-bold tracking-wider text-white uppercase">
                  {t('marketing.blog.recent', 'Recent posts')}
                </h2>
                <ul className="divide-y divide-white/10 border-y border-white/10">
                  {data.recent.map((post) => (
                    <li key={post.id} className="py-3">
                      <Link
                        href={`/blog/${encodeURIComponent(post.slug)}`}
                        className="hover:text-landing-accent line-clamp-2 text-sm font-medium text-white/85 transition-colors duration-200"
                      >
                        {post.title}
                      </Link>
                      <p className="mt-1 text-xs text-white/40">{blogDate(post.publishedAt)}</p>
                    </li>
                  ))}
                </ul>
              </aside>
            </Reveal>
          ) : null}
        </div>
      </div>
    </div>
  );
}
