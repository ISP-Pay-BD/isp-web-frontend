'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { DataTable } from '@/features/shared/data-table';
import { toast } from 'sonner';
import { Megaphone, Plus, Eye, CheckCircle2, Calendar, Edit, Trash2 } from 'lucide-react';
import { formatDate, formatDateIso } from '@/lib/format';
import { useLocale } from '@/i18n/locale-context';
import {
  useAdminNews,
  useDeleteNews,
  useSaveNews,
  type NewsAudience,
  type NewsItem,
} from '@/features/admin/news/hooks/use-admin-news';

type Translate = ReturnType<typeof useLocale>['t'];

const audienceLabels = (t: Translate): Record<NewsAudience, string> => ({
  all: t('admin.ops.announcements.audAll', 'All Subscribers'),
  customers: t('admin.ops.announcements.audCustomers', 'Broadband Customers'),
  resellers: t('admin.ops.announcements.audResellers', 'Reseller POPs'),
  employees: t('admin.ops.announcements.audEmployees', 'Employees'),
});

interface BannerForm {
  title: string;
  audience: NewsAudience;
  startsAt: string;
  endsAt: string;
  body: string;
  active: boolean;
}

const isLive = (b: NewsItem, now = Date.now()) =>
  b.status === 'published' &&
  (!b.startsAt || new Date(b.startsAt).getTime() <= now) &&
  (!b.endsAt || new Date(b.endsAt).getTime() >= now);

export function AnnouncementsPage() {
  const { t } = useLocale();
  const audienceLabel = audienceLabels(t);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const banners = useAdminNews({ kind: 'banner', page, pageSize, search });
  const saveBanner = useSaveNews();
  const deleteBanner = useDeleteNews();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BannerForm>({ title: '', audience: 'all', startsAt: '', endsAt: '', body: '', active: true });
  const [previewItem, setPreviewItem] = useState<NewsItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openEditor = (item: NewsItem | null) => {
    setEditingId(item?.id ?? null);
    setForm(
      item
        ? {
            title: item.title,
            audience: item.audience,
            startsAt: item.startsAt ? formatDateIso(item.startsAt) : '',
            endsAt: item.endsAt ? formatDateIso(item.endsAt) : '',
            body: item.body,
            active: item.status === 'published',
          }
        : { title: '', audience: 'all', startsAt: formatDateIso(new Date()), endsAt: '', body: '', active: true },
    );
    setEditorOpen(true);
  };

  const handleToggleActive = (item: NewsItem) =>
    saveBanner.mutate(
      { id: item.id, input: { status: item.status === 'published' ? 'draft' : 'published' } },
      { onSuccess: () => toast.success(
            item.status === 'published'
              ? t('admin.ops.announcements.disabled', 'Banner disabled')
              : t('admin.ops.announcements.published', 'Banner published'),
          ),
      },
    );

  const handleSave = () => {
    if (!form.title.trim()) {
      toast.error(t('admin.ops.announcements.errTitle', 'Announcement title is required'));
      return;
    }
    if (form.startsAt && form.endsAt && form.endsAt < form.startsAt) {
      toast.error(t('admin.ops.announcements.errDates', 'End date must be after the start date'));
      return;
    }
    saveBanner.mutate(
      {
        id: editingId ?? undefined,
        input: {
          title: form.title.trim(),
          body: form.body.trim(),
          audience: form.audience,
          kind: 'banner',
          status: form.active ? 'published' : 'draft',
          startsAt: form.startsAt ? `${form.startsAt} 00:00:00` : '',
          endsAt: form.endsAt ? `${form.endsAt} 23:59:59` : '',
        },
      },
      {
        onSuccess: () => {
          toast.success(
            editingId
              ? t('admin.ops.announcements.updated', 'Banner updated')
              : t('admin.ops.announcements.saved', 'Announcement "{title}" saved', { title: form.title.trim() }),
          );
          setEditorOpen(false);
        },
      },
    );
  };

  const columns = useMemo<LegacyColumnDef<NewsItem, unknown>[]>(
    () => [
      {
        accessorKey: 'title',
        header: t('admin.ops.announcements.colTitle', 'Announcement Banner Title'),
        size: 260,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
              <Megaphone className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold text-xs text-foreground block">{row.original.title}</span>
              <span className="text-xs text-muted-foreground line-clamp-1">{row.original.body || t('admin.ops.announcements.defaultBody', 'Portal notification banner')}</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'audience',
        header: t('admin.ops.announcements.audience', 'Target Audience'),
        size: 150,
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs font-mono">
            {audienceLabel[row.original.audience]}
          </Badge>
        ),
      },
      {
        accessorKey: 'startsAt',
        header: t('admin.ops.announcements.colSchedule', 'Active Schedule'),
        size: 210,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
            <Calendar className="h-3 w-3 text-primary" />
            <span>{row.original.startsAt ? formatDate(row.original.startsAt) : t('admin.ops.announcements.now', 'Now')}</span>
            <span>→</span>
            <span>{row.original.endsAt ? formatDate(row.original.endsAt) : t('admin.ops.announcements.noEnd', 'No end')}</span>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: t('admin.ops.announcements.colLive', 'Live Status'),
        size: 150,
        cell: ({ row }) => {
          const published = row.original.status === 'published';
          const live = isLive(row.original);
          return (
            <div className="flex items-center gap-2.5">
              <Switch
                checked={published}
                onCheckedChange={() => handleToggleActive(row.original)}
                aria-label={t('admin.ops.announcements.togglePublished', 'Published')}
              />
              <Badge
                variant={live ? 'default' : 'secondary'}
                tone={live ? 'success' : undefined} className="text-xs font-mono"
              >
                {!published
                  ? t('admin.ops.announcements.statusDisabled', 'Disabled')
                  : live
                    ? t('admin.ops.announcements.statusLive', 'Live')
                    : t('admin.ops.announcements.statusScheduled', 'Scheduled / Ended')}
              </Badge>
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">{t('common.actions', 'Actions')}</span>,
        size: 130,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => setPreviewItem(row.original)} title={t('admin.ops.announcements.preview', 'Preview Banner')} aria-label={t('admin.ops.announcements.preview', 'Preview Banner')}>
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditor(row.original)} title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')}>
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(row.original.id)} title={t('common.delete', 'Delete')} aria-label={t('common.delete', 'Delete')}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t],
  );

  if (banners.isLoading) return <PageSkeleton variant="table" />;
  if (banners.isError && !banners.data) {
    return <EmptyState variant="error" title={t('admin.ops.announcements.loadFailed', 'Failed to load announcements')} actionLabel={t('common.retry', 'Retry')} onAction={() => banners.refetch()} />;
  }

  const stats = banners.data?.stats;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.ops.announcements.title', 'Portal Announcement Banners')}
        subtitle={t(
          'admin.ops.announcements.subtitle',
          'Schedule maintenance notices, holiday billing alerts and promotional banners on customer portals',
        )}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), url: '/admin/dashboard' },
          { label: t('common.crumb.engagement', 'Engagement') },
          { label: t('nav.announcements', 'Announcements') },
        ]}
        actions={
          <Button className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => openEditor(null)}>
            <Plus className="h-4 w-4" />
            {t('admin.ops.announcements.create', 'Create Announcement')}
          </Button>
        }
      />

      <OpsSummaryStrip
        items={[
          { label: t('admin.ops.announcements.totalBanners', 'Total Banners'), value: stats?.total ?? 0 },
          {
            label: t('admin.ops.announcements.liveNow', 'Live Now'),
            value: t('admin.ops.announcements.bannersCount', '{n} Banners', { n: stats?.bannersLive ?? 0 }),
          },
          { label: t('admin.ops.announcements.statusDisabled', 'Disabled'), value: stats?.draft ?? 0 },
        ]}
      />

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-primary" />
            {t('admin.ops.announcements.cardTitle', 'Announcement Banners')}
          </CardTitle>
          <CardDescription>
            {t('admin.ops.announcements.cardDesc', 'Banners are shown to their audience only inside the schedule window')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable urlState
            columns={columns}
            data={banners.data?.items ?? []}
            getRowId={(row) => row.id}
            searchKey="title"
            searchPlaceholder={t('admin.ops.announcements.search', 'Search banners by title...')}
            emptyTitle={t('admin.ops.announcements.emptyTitle', 'No announcement banners')}
            emptyDescription={t('admin.ops.announcements.emptyDesc', 'Create a banner to show a notice on customer portals.')}
            server={{
              page,
              pageSize,
              total: banners.data?.meta.total ?? 0,
              onPageChange: setPage,
              onPageSizeChange: (size) => {
                setPageSize(size);
                setPage(1);
              },
              search,
              onSearchChange: (q) => {
                setSearch(q);
                setPage(1);
              },
            }}
            toolbarActions={
              <Button size="sm" onClick={() => openEditor(null)} className="gap-1.5">
                <Plus className="h-4 w-4" />
                {t('admin.ops.announcements.newBanner', 'New Banner')}
              </Button>
            }
          />
        </CardContent>
      </Card>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              {editingId
                ? t('admin.ops.announcements.editTitle', 'Edit Announcement Banner')
                : t('admin.ops.announcements.publishTitle', 'Publish Announcement Banner')}
            </DialogTitle>
            <DialogDescription>
              {t('admin.ops.announcements.dialogDesc', 'Shown as a header ribbon on customer self-care portals.')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-2">
              <Label htmlFor="banner-title" className="text-xs font-semibold">{t('admin.ops.announcements.fieldTitle', 'Banner Title')}</Label>
              <Input
                id="banner-title"
                value={form.title}
                maxLength={100}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={t('admin.ops.announcements.titlePlaceholder', 'e.g. Fiber core upgrade tonight')}
                className="text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-audience" className="text-xs font-semibold">{t('admin.ops.announcements.audience', 'Target Audience')}</Label>
              <Select items={audienceLabel} value={form.audience} onValueChange={(v) => { if (v) setForm({ ...form, audience: v as NewsAudience }); }}>
                <SelectTrigger id="target-audience" className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(audienceLabel) as NewsAudience[]).map((a) => (
                    <SelectItem key={a} value={a}>
                      {audienceLabel[a]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="start-date" className="text-xs font-semibold">{t('admin.ops.announcements.startDate', 'Start Date')}</Label>
                <Input id="start-date" type="date" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} className="text-xs font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end-date-optional" className="text-xs font-semibold">{t('admin.ops.announcements.endDate', 'End Date (optional)')}</Label>
                <Input id="end-date-optional" type="date" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} className="text-xs font-mono" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message" className="text-xs font-semibold">{t('admin.ops.announcements.message', 'Message')}</Label>
              <Textarea
                id="message"
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder={t('admin.ops.announcements.messagePlaceholder', 'Enter the banner message...')}
                className="h-20 text-xs font-mono resize-y"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
              <span className="font-semibold">{t('admin.ops.announcements.togglePublished', 'Published')}</span>
              <Switch aria-label={t('admin.ops.announcements.togglePublished', 'Published')} checked={form.active} onCheckedChange={(c) => setForm({ ...form, active: c })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditorOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={handleSave} disabled={saveBanner.isPending} className="gap-1.5 bg-primary text-primary-foreground">
              <CheckCircle2 className="h-4 w-4" />
              {saveBanner.isPending ? t('admin.ops.announcements.saving', 'Saving…') : t('admin.ops.announcements.save', 'Save Banner')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewItem} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              {t('admin.ops.announcements.previewTitle', 'Banner Preview')}
            </DialogTitle>
            <DialogDescription>{t('admin.ops.announcements.previewDesc', 'As rendered on the customer dashboard')}</DialogDescription>
          </DialogHeader>
          {previewItem && (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/30 text-foreground space-y-2">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <Megaphone className="h-4 w-4" />
                  <span>{previewItem.title}</span>
                </div>
                {previewItem.body && <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{previewItem.body}</p>}
                <p className="text-xs text-muted-foreground">
                  {t('admin.ops.announcements.forAudience', 'For {audience} ·', { audience: audienceLabel[previewItem.audience] })}{' '}
                  <span className="font-mono text-foreground">
                    {previewItem.startsAt ? formatDate(previewItem.startsAt) : t('admin.ops.announcements.nowLower', 'now')}
                  </span>{' '}
                  →{' '}
                  <span className="font-mono text-foreground">
                    {previewItem.endsAt ? formatDate(previewItem.endsAt) : t('admin.ops.announcements.noEndDate', 'no end date')}
                  </span>
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setPreviewItem(null)}>{t('admin.ops.announcements.closePreview', 'Close Preview')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t('admin.ops.announcements.deleteTitle', 'Delete banner')}
        description={t('admin.ops.announcements.deleteDesc', 'The banner is removed from all portals.')}
        confirmLabel={t('common.delete', 'Delete')}
        destructive
        onConfirm={() => {
          if (!deleteId) return;
          deleteBanner.mutate(deleteId, {
            onSuccess: () => {
              toast.success(t('admin.ops.announcements.deleted', 'Banner deleted'));
              setDeleteId(null);
            },
          });
        }}
      />
    </div>
  );
}
