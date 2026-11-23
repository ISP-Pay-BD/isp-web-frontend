'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Eye, EyeOff, ExternalLink, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { PlatformPageHeader, platformDate } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCount } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
import { useDeleteBlog, usePlatformBlogs, useSetBlogPublished } from '../hooks/use-content-cms';
import { BlogDialog } from '../components/BlogDialog';
import { CmsImage } from '../components/CmsImage';
import { CmsLoadError } from '../components/CmsLoadError';
import type { BlogPost } from '../types';

type StatusTab = 'all' | 'published' | 'draft';

export function BlogsPage() {
  const t = useTranslations();
  const { data, isLoading, error, refetch } = usePlatformBlogs();
  const remove = useDeleteBlog();
  const publish = useSetBlogPublished();
  const [tab, setTab] = useState<StatusTab>('all');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [deleting, setDeleting] = useState<BlogPost | null>(null);

  const posts = useMemo(() => data ?? [], [data]);
  const categories = useMemo(
    () => [...new Set(posts.map((p) => p.category).filter(Boolean))].sort(),
    [posts],
  );

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const header = (
    <PlatformPageHeader
      title={t('platform.cms.blogs.title', 'Blog Posts')}
      subtitle={t('platform.cms.blogs.subtitle', 'Articles published on the public website blog')}
      breadcrumb={[
        { label: 'Platform', href: '/platform/dashboard' },
        { label: t('platform.cms.blogs.crumb', 'Blog') },
      ]}
      actions={
        <Button size="sm" onClick={openNew} disabled={Boolean(error)}>
          <Plus className="mr-1.5 h-4 w-4" /> {t('platform.cms.blogs.new', 'New post')}
        </Button>
      }
    />
  );

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (error || !data) {
    return (
      <div className="space-y-6">
        {header}
        <CmsLoadError
          error={error}
          title={t('platform.cms.blogs.loadFailed', 'Could not load blog posts')}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const q = search.trim().toLowerCase();
  const filtered = posts.filter(
    (p) =>
      (tab === 'all' || (tab === 'published' ? p.published : !p.published)) &&
      (!q || `${p.title} ${p.category} ${p.author}`.toLowerCase().includes(q)),
  );
  const publishedCount = posts.filter((p) => p.published).length;
  const totalViews = posts.reduce((s, p) => s + p.views, 0);

  const tabs: { id: StatusTab; label: string }[] = [
    { id: 'all', label: t('platform.cms.tabAll', 'All') },
    { id: 'published', label: t('platform.cms.blogs.tabPublished', 'Published') },
    { id: 'draft', label: t('platform.cms.blogs.tabDraft', 'Drafts') },
  ];

  return (
    <div className="space-y-6">
      {header}

      <div className="border-border/60 flex flex-wrap gap-x-6 gap-y-2 border-y py-3 text-sm">
        <p>
          <span className="text-foreground font-semibold tabular-nums">
            {formatCount(posts.length)}
          </span>{' '}
          <span className="text-muted-foreground">{t('platform.cms.blogs.kpiPosts', 'posts')}</span>
        </p>
        <p>
          <span className="font-semibold text-emerald-500 tabular-nums">
            {formatCount(publishedCount)}
          </span>{' '}
          <span className="text-muted-foreground">
            {t('platform.cms.blogs.kpiPublished', 'published')}
          </span>
        </p>
        <p>
          <span className="font-semibold text-amber-500 tabular-nums">
            {formatCount(posts.length - publishedCount)}
          </span>{' '}
          <span className="text-muted-foreground">
            {t('platform.cms.blogs.kpiDrafts', 'drafts')}
          </span>
        </p>
        <p>
          <span className="text-primary font-semibold tabular-nums">{formatCount(totalViews)}</span>{' '}
          <span className="text-muted-foreground">{t('platform.cms.blogs.kpiViews', 'views')}</span>
        </p>
      </div>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-1.5" role="tablist">
          {tabs.map((x) => (
            <button
              key={x.id}
              type="button"
              role="tab"
              aria-selected={tab === x.id}
              onClick={() => setTab(x.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition duration-200 ease-out ${
                tab === x.id
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'border-border/70 bg-card text-muted-foreground hover:bg-muted border'
              }`}
            >
              {x.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t(
            'platform.cms.blogs.searchPlaceholder',
            'Search title, category or author…',
          )}
          aria-label={t('platform.cms.blogs.searchLabel', 'Search blog posts')}
          className="border-border/70 bg-card text-foreground placeholder:text-muted-foreground focus:ring-primary h-9 w-full rounded-lg border px-3 text-sm focus:ring-1 focus:outline-none sm:max-w-xs"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={
            posts.length === 0
              ? t('platform.cms.blogs.emptyNone', 'No blog posts yet')
              : t('platform.cms.emptyFiltered', 'Nothing matches these filters')
          }
          description={
            posts.length === 0
              ? t('platform.cms.blogs.emptyHint', 'Write the first article for the website blog.')
              : undefined
          }
          actionLabel={posts.length === 0 ? t('platform.cms.blogs.new', 'New post') : undefined}
          onAction={posts.length === 0 ? openNew : undefined}
        />
      ) : (
        <ul className="divide-border/60 border-border/60 bg-card divide-y overflow-hidden rounded-xl border">
          {filtered.map((post) => (
            <li
              key={post.id}
              className="hover:bg-muted/30 flex flex-col gap-3 p-4 transition-colors duration-200 sm:flex-row sm:items-center"
            >
              <CmsImage
                src={post.thumbnail}
                alt={post.title}
                className="aspect-video w-full shrink-0 rounded-lg sm:w-32"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={post.published ? 'default' : 'secondary'} className="text-xs">
                    {post.published
                      ? t('platform.cms.blogs.statusPublished', 'Published')
                      : t('platform.cms.blogs.statusDraft', 'Draft')}
                  </Badge>
                  {post.isFeatured ? (
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Star className="h-3 w-3" aria-hidden />{' '}
                      {t('platform.cms.featured', 'Featured')}
                    </Badge>
                  ) : null}
                  <span className="text-muted-foreground text-xs">{post.category}</span>
                </div>
                <h3 className="text-foreground line-clamp-2 text-sm font-semibold">{post.title}</h3>
                <p className="text-muted-foreground text-xs">
                  {post.author} · {platformDate(post.publishedAt ?? post.createdAt)} ·{' '}
                  {t('platform.cms.blogs.viewsN', '{n} views', { n: formatCount(post.views) })}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1 self-end sm:self-center">
                {post.published ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2"
                    aria-label={t('platform.cms.blogs.viewPublic', 'View on website')}
                    render={
                      <Link
                        href={`/blog/${encodeURIComponent(post.slug)}`}
                        target="_blank"
                        rel="noopener"
                      />
                    }
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2"
                  disabled={publish.isPending}
                  aria-label={
                    post.published
                      ? t('platform.cms.blogs.unpublish', 'Move to drafts')
                      : t('platform.cms.blogs.publishNow', 'Publish')
                  }
                  title={
                    post.published
                      ? t('platform.cms.blogs.unpublish', 'Move to drafts')
                      : t('platform.cms.blogs.publishNow', 'Publish')
                  }
                  onClick={() =>
                    publish.mutate(
                      { post, published: !post.published },
                      {
                        onSuccess: (p) =>
                          toast.success(
                            p.published
                              ? t('platform.cms.blogs.nowPublished', 'Post published')
                              : t('platform.cms.blogs.nowDraft', 'Post moved to drafts'),
                          ),
                      },
                    )
                  }
                >
                  {post.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2"
                  aria-label={t('platform.cms.edit', 'Edit')}
                  onClick={() => {
                    setEditing(post);
                    setDialogOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive h-8 px-2"
                  aria-label={t('platform.cms.delete', 'Delete')}
                  onClick={() => setDeleting(post)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <BlogDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        categories={categories}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={t('platform.cms.blogs.deleteTitle', 'Delete this post?')}
        description={
          deleting
            ? t(
                'platform.cms.blogs.deleteDesc',
                '"{title}" is removed from the website permanently.',
                { title: deleting.title },
              )
            : undefined
        }
        confirmLabel={
          remove.isPending
            ? t('platform.cms.deleting', 'Deleting…')
            : t('platform.cms.delete', 'Delete')
        }
        destructive
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => toast.success(t('platform.cms.blogs.deleted', 'Blog post deleted')),
            onSettled: () => setDeleting(null),
          })
        }
      />
    </div>
  );
}
