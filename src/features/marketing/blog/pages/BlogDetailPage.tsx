'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Eye } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Reveal } from '@/components/motion/Reveal';
import { useTranslations } from '@/features/marketing/shared';
import { formatCount } from '@/lib/format';
import { cn } from '@/lib/utils';
import { usePublicBlog } from '../hooks/use-public-blog';
import { BlogCover, BlogPostCard, blogDate } from '../components/BlogPostCard';
import { blogContentHtml } from '../lib/sanitize-html';

export function BlogDetailPage() {
  const t = useTranslations();
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? '';
  const { data, isLoading, isError, error, refetch } = usePublicBlog(slug);
  const html = useMemo(() => (data ? blogContentHtml(data.post.content) : ''), [data]);

  return (
    <div className="pt-28 pb-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />{' '}
          {t('marketing.blog.allPosts', 'All articles')}
        </Link>

        {isLoading ? (
          <div className="mt-8 space-y-4" aria-busy="true">
            <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
            <div className="h-10 w-full animate-pulse rounded bg-white/10" />
            <div className="aspect-video w-full animate-pulse rounded-2xl bg-white/[0.06]" />
          </div>
        ) : isError || !data ? (
          error?.status === 404 ? (
            <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6">
              <h1 className="text-xl font-semibold text-white">
                {t('marketing.blog.notFoundTitle', 'Article not found')}
              </h1>
              <p className="mt-2 text-sm text-white/60">
                {t('marketing.blog.notFoundDesc', "This article doesn't exist or isn't published.")}
              </p>
              <Link
                href="/blog"
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'mt-4 border-white/20 text-white',
                )}
              >
                {t('marketing.blog.browse', 'Browse articles')}
              </Link>
            </div>
          ) : (
            <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm text-white/70">
                {error?.message ||
                  t('marketing.blog.loadOneFailed', 'Failed to load this article.')}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-white"
              >
                {t('common.retry', 'Retry')}
              </button>
            </div>
          )
        ) : (
          <>
            <Reveal>
              <article className="mt-8">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/50">
                  {data.post.category ? (
                    <span className="text-landing-accent font-medium">{data.post.category}</span>
                  ) : null}
                  {data.post.publishedAt ? <span>{blogDate(data.post.publishedAt)}</span> : null}
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" aria-hidden />
                    {t('marketing.blog.views', '{n} views', { n: formatCount(data.post.views) })}
                  </span>
                </div>
                <h1 className="font-landing-display mt-3 text-3xl leading-tight font-semibold tracking-tight text-white sm:text-4xl">
                  {data.post.title}
                </h1>
                <p className="mt-3 text-sm text-white/50">
                  {t('marketing.blog.by', 'By {author}', { author: data.post.author })}
                </p>
                {data.post.thumbnail ? (
                  <BlogCover
                    post={data.post}
                    className="mt-8 aspect-video rounded-2xl border border-white/10"
                  />
                ) : null}
                <div
                  className="[&_a]:text-landing-accent mt-8 max-w-none space-y-4 text-base leading-relaxed text-white/75 [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-white/20 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-white [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-white [&_img]:rounded-xl [&_li]:ml-5 [&_ol]:list-decimal [&_strong]:text-white [&_ul]:list-disc"
                  // Sanitized: scripts, handlers and javascript: URLs are stripped in blogContentHtml.
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </article>
            </Reveal>

            {data.related.length > 0 ? (
              <Reveal className="mt-16 border-t border-white/10 pt-10" delay={0.04}>
                <h2 className="font-landing-display text-xl font-semibold text-white">
                  {t('marketing.blog.related', 'Related articles')}
                </h2>
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  {data.related.map((post) => (
                    <BlogPostCard key={post.id} post={post} />
                  ))}
                </div>
              </Reveal>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
