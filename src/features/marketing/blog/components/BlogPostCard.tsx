'use client';

import Link from 'next/link';
import { Newspaper } from 'lucide-react';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { blogImage } from '../hooks/use-public-blog';
import type { PublicBlogPost } from '../types';

/** Backend 'Y-m-d H:i:s' → readable date (space form is not parsed by every browser). */
export function blogDate(value: string | null): string {
  return value ? formatDate(value.replace(' ', 'T')) : '';
}

export function BlogCover({ post, className }: { post: PublicBlogPost; className?: string }) {
  const src = blogImage(post.thumbnail);
  return (
    <div className={cn('relative overflow-hidden bg-white/[0.04]', className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      ) : (
        <div className="from-landing-cta/15 flex h-full w-full items-center justify-center bg-gradient-to-br to-transparent">
          <Newspaper className="h-8 w-8 text-white/25" aria-hidden />
        </div>
      )}
    </div>
  );
}

export function BlogPostCard({
  post,
  featured = false,
}: {
  post: PublicBlogPost;
  featured?: boolean;
}) {
  const href = `/blog/${encodeURIComponent(post.slug)}`;
  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors duration-200 ease-out hover:border-white/20',
        featured && 'md:flex-row',
      )}
    >
      <Link href={href} tabIndex={-1} aria-hidden className={cn('block', featured && 'md:w-1/2')}>
        <BlogCover post={post} className={cn('aspect-video', featured && 'md:h-full')} />
      </Link>
      <div className={cn('flex flex-1 flex-col p-5', featured && 'md:justify-center md:p-8')}>
        <div className="flex flex-wrap items-center gap-2 text-xs text-white/50">
          {post.category ? (
            <span className="text-landing-accent font-medium">{post.category}</span>
          ) : null}
          {post.publishedAt ? <span>· {blogDate(post.publishedAt)}</span> : null}
        </div>
        <h2
          className={cn(
            'font-landing-display mt-2 font-semibold text-white',
            featured ? 'text-2xl leading-tight md:text-3xl' : 'line-clamp-2 text-lg leading-snug',
          )}
        >
          <Link href={href} className="hover:text-landing-accent transition-colors duration-200">
            {post.title}
          </Link>
        </h2>
        {post.excerpt ? (
          <p
            className={cn(
              'mt-2 text-sm leading-relaxed text-white/60',
              featured ? 'line-clamp-4' : 'line-clamp-3',
            )}
          >
            {post.excerpt}
          </p>
        ) : null}
        <p className="mt-auto pt-4 text-xs text-white/40">{post.author}</p>
      </div>
    </article>
  );
}
