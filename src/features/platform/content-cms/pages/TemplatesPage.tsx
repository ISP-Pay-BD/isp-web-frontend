'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ExternalLink, Eye, EyeOff, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { PlatformPageHeader } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatBdtWithSymbol, formatCount } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
import {
  useDeleteTemplate,
  usePlatformTemplates,
  useSetTemplateVisible,
} from '../hooks/use-content-cms';
import { TemplateDialog } from '../components/TemplateDialog';
import { CmsImage } from '../components/CmsImage';
import { CmsLoadError } from '../components/CmsLoadError';
import type { LandingTemplate } from '../types';

export function TemplatesPage() {
  const t = useTranslations();
  const { data, isLoading, error, refetch } = usePlatformTemplates();
  const remove = useDeleteTemplate();
  const visibility = useSetTemplateVisible();
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<LandingTemplate | null>(null);
  const [deleting, setDeleting] = useState<LandingTemplate | null>(null);

  const items = useMemo(() => data ?? [], [data]);
  const categories = useMemo(
    () => [...new Set(items.map((i) => i.category).filter(Boolean))].sort(),
    [items],
  );

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const header = (
    <PlatformPageHeader
      title={t('platform.cms.templates.title', 'Website Templates')}
      subtitle={t(
        'platform.cms.templates.subtitle',
        'ISP website templates listed in the public catalogue',
      )}
      breadcrumb={[
        { label: 'Platform', href: '/platform/dashboard' },
        { label: t('platform.cms.templates.crumb', 'Templates') },
      ]}
      actions={
        <Button size="sm" onClick={openNew} disabled={Boolean(error)}>
          <Plus className="mr-1.5 h-4 w-4" /> {t('platform.cms.templates.new', 'New template')}
        </Button>
      }
    />
  );

  if (isLoading) return <PageSkeleton variant="cards" rows={6} />;
  if (error || !data) {
    return (
      <div className="space-y-6">
        {header}
        <CmsLoadError
          error={error}
          title={t('platform.cms.templates.loadFailed', 'Could not load templates')}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const q = search.trim().toLowerCase();
  const filtered = items.filter(
    (i) =>
      (!category || i.category === category) &&
      (!q || `${i.title} ${i.category} ${i.technology}`.toLowerCase().includes(q)),
  );
  const visibleCount = items.filter((i) => i.published).length;
  const featuredCount = items.filter((i) => i.isFeatured).length;

  const priceLabel = (tpl: LandingTemplate) =>
    tpl.priceType === 'Free' || tpl.price <= 0
      ? t('platform.cms.templates.priceFree', 'Free')
      : formatBdtWithSymbol(tpl.price);

  return (
    <div className="space-y-6">
      {header}

      <div className="border-border/60 flex flex-wrap gap-x-6 gap-y-2 border-y py-3 text-sm">
        <p>
          <span className="text-foreground font-semibold tabular-nums">
            {formatCount(items.length)}
          </span>{' '}
          <span className="text-muted-foreground">
            {t('platform.cms.templates.kpiTotal', 'templates')}
          </span>
        </p>
        <p>
          <span className="font-semibold text-emerald-500 tabular-nums">
            {formatCount(visibleCount)}
          </span>{' '}
          <span className="text-muted-foreground">
            {t('platform.cms.templates.kpiVisible', 'visible')}
          </span>
        </p>
        <p>
          <span className="text-primary font-semibold tabular-nums">
            {formatCount(featuredCount)}
          </span>{' '}
          <span className="text-muted-foreground">
            {t('platform.cms.templates.kpiFeatured', 'featured')}
          </span>
        </p>
      </div>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-1.5">
          {['', ...categories].map((c) => (
            <button
              key={c || '__all'}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition duration-200 ease-out ${
                category === c
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'border-border/70 bg-card text-muted-foreground hover:bg-muted border'
              }`}
            >
              {c || t('platform.cms.tabAll', 'All')}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t(
            'platform.cms.templates.searchPlaceholder',
            'Search name, category or technology…',
          )}
          aria-label={t('platform.cms.templates.searchLabel', 'Search templates')}
          className="border-border/70 bg-card text-foreground placeholder:text-muted-foreground focus:ring-primary h-9 w-full rounded-lg border px-3 text-sm focus:ring-1 focus:outline-none sm:max-w-xs"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={
            items.length === 0
              ? t('platform.cms.templates.emptyNone', 'No templates yet')
              : t('platform.cms.emptyFiltered', 'Nothing matches these filters')
          }
          description={
            items.length === 0
              ? t(
                  'platform.cms.templates.emptyHint',
                  'Add the first website template to the public catalogue.',
                )
              : undefined
          }
          actionLabel={
            items.length === 0 ? t('platform.cms.templates.new', 'New template') : undefined
          }
          onAction={items.length === 0 ? openNew : undefined}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((tpl) => (
            <Card
              key={tpl.id}
              className="group border-border/60 bg-card hover:border-primary/50 flex flex-col justify-between overflow-hidden p-0 transition duration-200 ease-out hover:shadow-md"
            >
              <div>
                <div className="relative">
                  <CmsImage src={tpl.image} alt={tpl.title} className="aspect-video w-full" />
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    {tpl.isFeatured ? (
                      <Badge
                        variant="outline"
                        className="bg-background/80 gap-1 text-xs backdrop-blur"
                      >
                        <Star className="h-3 w-3" aria-hidden />{' '}
                        {t('platform.cms.featured', 'Featured')}
                      </Badge>
                    ) : null}
                    <Badge variant={tpl.published ? 'default' : 'secondary'} className="text-xs">
                      {tpl.published
                        ? t('platform.cms.templates.statusVisible', 'Visible')
                        : t('platform.cms.templates.statusHidden', 'Hidden')}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-foreground truncate text-sm font-bold">{tpl.title}</h3>
                      <p className="text-muted-foreground text-xs">
                        {tpl.category} · {tpl.technology}
                      </p>
                    </div>
                    <span className="text-foreground shrink-0 font-mono text-sm font-semibold tabular-nums">
                      {priceLabel(tpl)}
                    </span>
                  </div>
                  {tpl.description ? (
                    <p className="text-muted-foreground line-clamp-2 text-xs">{tpl.description}</p>
                  ) : null}
                  {tpl.features.length > 0 ? (
                    <ul className="text-muted-foreground list-disc space-y-0.5 pl-4 text-xs">
                      {tpl.features.slice(0, 3).map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
              <div className="border-border/40 text-muted-foreground flex items-center justify-between border-t px-4 py-2 text-xs">
                <span className="tabular-nums">
                  {t('platform.cms.templates.sortN', 'Order {n}', { n: tpl.sortOrder })}
                </span>
                <span className="flex gap-1">
                  {tpl.demoUrl && /^https?:\/\//i.test(tpl.demoUrl) ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2"
                      aria-label={t('platform.cms.templates.openDemo', 'Open live demo')}
                      render={<a href={tpl.demoUrl} target="_blank" rel="noopener noreferrer" />}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2"
                    disabled={visibility.isPending}
                    aria-label={
                      tpl.published
                        ? t('platform.cms.templates.hide', 'Hide from website')
                        : t('platform.cms.templates.show', 'Show on website')
                    }
                    title={
                      tpl.published
                        ? t('platform.cms.templates.hide', 'Hide from website')
                        : t('platform.cms.templates.show', 'Show on website')
                    }
                    onClick={() =>
                      visibility.mutate(
                        { tpl, visible: !tpl.published },
                        {
                          onSuccess: (x) =>
                            toast.success(
                              x.published
                                ? t('platform.cms.templates.nowVisible', 'Template is now visible')
                                : t(
                                    'platform.cms.templates.nowHidden',
                                    'Template hidden from website',
                                  ),
                            ),
                        },
                      )
                    }
                  >
                    {tpl.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2"
                    aria-label={t('platform.cms.edit', 'Edit')}
                    onClick={() => {
                      setEditing(tpl);
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
                    onClick={() => setDeleting(tpl)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <TemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        categories={categories}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={t('platform.cms.templates.deleteTitle', 'Delete this template?')}
        description={
          deleting
            ? t(
                'platform.cms.templates.deleteDesc',
                '"{title}" is removed from the catalogue permanently.',
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
            onSuccess: () => toast.success(t('platform.cms.templates.deleted', 'Template deleted')),
            onSettled: () => setDeleting(null),
          })
        }
      />
    </div>
  );
}
