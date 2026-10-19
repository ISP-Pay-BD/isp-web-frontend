'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ImageIcon, Plus, Pencil, Trash2 } from 'lucide-react';
import { platformService } from '@/lib/api/services/platform.service';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { PlatformPageHeader, platformDate } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ProductShowcaseItem, ShowcaseInput } from '@/features/platform/types';
import { useTranslations } from '@/i18n/locale-context';

const EMPTY: ShowcaseInput = { name: '', target: 'website', bullets: '', sort_order: 0, status: 'active' };

function ShowcaseDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: ProductShowcaseItem | null;
}) {
  const t = useTranslations();
  const qc = useQueryClient();
  const form = useForm<ShowcaseInput>({ defaultValues: EMPTY });

  useEffect(() => {
    if (!open) return;
    form.reset(
      editing
        ? {
            name: editing.name,
            target: editing.target,
            bullets: editing.bullets.join('\n'),
            sort_order: editing.sortOrder,
            status: editing.status,
          }
        : EMPTY,
    );
  }, [open, editing, form]);

  const save = useMutation({
    mutationFn: (v: ShowcaseInput) => {
      const payload = { ...v, sort_order: Number(v.sort_order) || 0 };
      return editing ? platformService.updateShowcase(editing.id, payload) : platformService.createShowcase(payload);
    },
    onSuccess: () => {
      toast.success(editing ? t('platform.showcase.page.updated', 'Showcase section updated') : t('platform.showcase.page.created', 'Showcase section created'));
      void qc.invalidateQueries({ queryKey: ['platform', 'showcase'] });
      onOpenChange(false);
    },
    onError: (err) => handleApiError(err, form.setError as never),
  });

  const err = form.formState.errors;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? t('platform.showcase.page.editTitle', 'Edit {name}', { name: editing.name }) : t('platform.showcase.page.newTitle', 'New showcase section')}</DialogTitle>
        </DialogHeader>
        <form id="showcase-form" onSubmit={form.handleSubmit((v) => save.mutate(v))} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="sc-name">{t('platform.showcase.page.sectionName', 'Section name')}</Label>
            <Input id="sc-name" {...form.register('name', { required: t('platform.showcase.page.nameRequired', 'Name is required'), minLength: { value: 2, message: t('platform.showcase.page.nameMin', 'At least 2 characters') } })} />
            {err.name ? <p className="text-xs text-destructive">{err.name.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sc-target">{t('platform.showcase.page.shownOn', 'Shown on')}</Label>
            <select id="sc-target" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register('target')}>
              <option value="website">{t('platform.showcase.page.website', 'Website')}</option>
              <option value="mobile">{t('platform.showcase.page.mobileApp', 'Mobile app')}</option>
            </select>
            {err.target ? <p className="text-xs text-destructive">{err.target.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sc-sort">{t('platform.showcase.page.sortOrder', 'Sort order')}</Label>
            <Input id="sc-sort" type="number" min={0} {...form.register('sort_order')} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="sc-bullets">{t('platform.showcase.page.highlights', 'Highlights (one per line)')}</Label>
            <Textarea id="sc-bullets" rows={5} {...form.register('bullets')} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/40 p-3 sm:col-span-2">
            <span className="text-sm">{t('status.active', 'Active')}</span>
            <Switch aria-label={t('status.active', 'Active')}
              checked={form.watch('status') === 'active'}
              onCheckedChange={(v) => form.setValue('status', v ? 'active' : 'inactive')}
            />
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button type="submit" form="showcase-form" disabled={save.isPending}>
            {save.isPending ? t('platform.showcase.page.saving', 'Saving…') : editing ? t('platform.showcase.page.saveChanges', 'Save changes') : t('platform.showcase.page.createSection', 'Create section')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ShowcasePage() {
  const t = useTranslations();
  const qc = useQueryClient();
  const [target, setTarget] = useState<'all' | 'website' | 'mobile'>('all');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProductShowcaseItem | null>(null);
  const [deleting, setDeleting] = useState<ProductShowcaseItem | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['platform', 'showcase'],
    queryFn: () => platformService.getShowcaseSections(),
  });

  const remove = useMutation({
    mutationFn: (id: string) => platformService.deleteShowcase(id),
    onSuccess: () => {
      toast.success(t('platform.showcase.page.deleted', 'Showcase section deleted'));
      void qc.invalidateQueries({ queryKey: ['platform', 'showcase'] });
    },
    onSettled: () => setDeleting(null),
  });

  if (isLoading) return <PageSkeleton variant="cards" rows={4} />;
  if (error || !data) {
    return (
      <EmptyState variant="error"
        title={t('platform.showcase.page.loadFailed', 'Failed to load showcase')}
        description={error instanceof Error ? error.message : t('platform.showcase.page.loadFailedHint', 'Could not retrieve showcase sections.')}
        actionLabel={t('common.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  const q = search.trim().toLowerCase();
  const filteredItems = data.items.filter(
    (item) =>
      (target === 'all' || item.target === target) &&
      (!q || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)),
  );
  const activeCount = data.items.filter((i) => i.status === 'active').length;
  const imageCount = data.items.reduce((s, i) => s + i.imageCount, 0);

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title={t('platform.showcase.page.title', 'Product Showcase')}
        subtitle={t('platform.showcase.page.subtitle', 'Screenshot sections shown on the marketing website and the mobile app')}
        breadcrumb={[
          { label: 'Platform', href: '/platform/dashboard' },
          { label: t('platform.showcase.page.crumb', 'Showcase') },
        ]}
        actions={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" /> {t('platform.showcase.page.newSection', 'New section')}
          </Button>
        }
      />

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{data.items.length}</span>{' '}
          <span className="text-muted-foreground">{t('platform.showcase.page.kpiSections', 'sections')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-500">{activeCount}</span>{' '}
          <span className="text-muted-foreground">{t('platform.showcase.page.kpiActive', 'active')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-primary">{imageCount}</span>{' '}
          <span className="text-muted-foreground">{t('platform.showcase.page.kpiShots', 'screenshots')}</span>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'website', 'mobile'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setTarget(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                target === tab
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'bg-card border border-border/70 hover:bg-muted text-muted-foreground'
              }`}
            >
              {tab === 'all' ? t('platform.showcase.page.tabAll', 'All') : tab === 'website' ? t('platform.showcase.page.website', 'Website') : t('platform.showcase.page.tabMobile', 'Mobile')}
            </button>
          ))}
        </div>

        <div className="max-w-xs w-full">
          <input
            type="search"
            placeholder={t('platform.showcase.page.searchPlaceholder', 'Search sections...')}
            aria-label={t('platform.showcase.page.searchLabel', 'Search sections')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-8 px-3 rounded-lg border border-border/70 bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState
          title={data.items.length === 0 ? t('platform.showcase.page.emptyNone', 'No showcase sections yet') : t('platform.showcase.page.emptyFiltered', 'No sections match')}
          description={data.items.length === 0 ? t('platform.showcase.page.emptyHint', 'Create a section, then upload its screenshots from the classic admin.') : undefined}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="border-border/60 bg-card overflow-hidden group hover:border-primary/50 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video bg-muted flex items-center justify-center overflow-hidden">
                  {item.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.thumbnailUrl} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                  <Badge
                    className="absolute top-3 right-3 text-xs font-bold shadow-xs"
                    variant={item.status === 'active' ? 'default' : 'secondary'}
                  >
                    {t(`status.${item.status}`, item.status)}
                  </Badge>
                </div>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-foreground">{item.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono">{item.slug}</p>
                    </div>
                    <Badge variant="outline" className="text-xs font-mono shrink-0">
                      {item.subtitle}
                    </Badge>
                  </div>
                  {item.bullets.length > 0 ? (
                    <ul className="list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">
                      {item.bullets.slice(0, 4).map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  ) : null}
                </CardContent>
              </div>
              <div className="px-4 pb-3 pt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {item.imageCount === 1
                    ? t('platform.showcase.page.shotOne', '{n} screenshot', { n: item.imageCount })
                    : t('platform.showcase.page.shotMany', '{n} screenshots', { n: item.imageCount })}{' '}
                  · {platformDate(item.createdAt)}
                </span>
                <span className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                    aria-label={t('platform.showcase.page.edit', 'Edit section')}
                    onClick={() => {
                      setEditing(item);
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                    aria-label={t('platform.showcase.page.delete', 'Delete section')}
                    onClick={() => setDeleting(item)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ShowcaseDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={deleting ? t('platform.showcase.page.deleteNamed', 'Delete {name}?', { name: deleting.name }) : t('platform.showcase.page.delete', 'Delete section')}
        description={t('platform.showcase.page.deleteDesc', 'The section and all of its screenshots are deleted permanently.')}
        confirmLabel={remove.isPending ? t('platform.showcase.page.deleting', 'Deleting…') : t('platform.showcase.page.delete', 'Delete section')}
        destructive
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      />
    </div>
  );
}
