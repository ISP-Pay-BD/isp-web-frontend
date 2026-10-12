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
import {
  useAdminNews,
  useDeleteNews,
  useSaveNews,
  type NewsAudience,
  type NewsItem,
} from '@/features/admin/news/hooks/use-admin-news';

const AUDIENCE_LABEL: Record<NewsAudience, string> = {
  all: 'All Subscribers',
  customers: 'Broadband Customers',
  resellers: 'Reseller POPs',
  employees: 'Employees',
};

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
      { onSuccess: () => toast.success(item.status === 'published' ? 'Banner disabled' : 'Banner published') },
    );

  const handleSave = () => {
    if (!form.title.trim()) {
      toast.error('Announcement title is required');
      return;
    }
    if (form.startsAt && form.endsAt && form.endsAt < form.startsAt) {
      toast.error('End date must be after the start date');
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
          toast.success(editingId ? 'Banner updated' : `Announcement "${form.title.trim()}" saved`);
          setEditorOpen(false);
        },
      },
    );
  };

  const columns = useMemo<LegacyColumnDef<NewsItem, unknown>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Announcement Banner Title',
        size: 260,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
              <Megaphone className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold text-xs text-foreground block">{row.original.title}</span>
              <span className="text-[10px] text-muted-foreground line-clamp-1">{row.original.body || 'Portal notification banner'}</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'audience',
        header: 'Target Audience',
        size: 150,
        cell: ({ row }) => (
          <Badge variant="outline" className="text-[10px] font-mono">
            {AUDIENCE_LABEL[row.original.audience]}
          </Badge>
        ),
      },
      {
        accessorKey: 'startsAt',
        header: 'Active Schedule',
        size: 210,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
            <Calendar className="h-3 w-3 text-primary" />
            <span>{row.original.startsAt ? formatDate(row.original.startsAt) : 'Now'}</span>
            <span>→</span>
            <span>{row.original.endsAt ? formatDate(row.original.endsAt) : 'No end'}</span>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Live Status',
        size: 150,
        cell: ({ row }) => {
          const published = row.original.status === 'published';
          const live = isLive(row.original);
          return (
            <div className="flex items-center gap-2.5">
              <Switch checked={published} onCheckedChange={() => handleToggleActive(row.original)} />
              <Badge
                variant={live ? 'default' : 'secondary'}
                className={`text-[10px] font-mono ${live ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : ''}`}
              >
                {!published ? 'Disabled' : live ? 'Live' : 'Scheduled / Ended'}
              </Badge>
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        size: 130,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => setPreviewItem(row.original)} title="Preview Banner">
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditor(row.original)} title="Edit">
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(row.original.id)} title="Delete">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  if (banners.isLoading) return <PageSkeleton variant="table" />;
  if (banners.isError && !banners.data) {
    return <EmptyState title="Failed to load announcements" actionLabel="Retry" onAction={() => banners.refetch()} />;
  }

  const stats = banners.data?.stats;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Portal Announcement Banners"
        subtitle="Schedule maintenance notices, holiday billing alerts and promotional banners on customer portals"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Engagement' },
          { label: 'Announcements' },
        ]}
        actions={
          <Button className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => openEditor(null)}>
            <Plus className="h-4 w-4" />
            Create Announcement
          </Button>
        }
      />

      <OpsSummaryStrip
        items={[
          { label: 'Total Banners', value: stats?.total ?? 0 },
          { label: 'Live Now', value: `${stats?.bannersLive ?? 0} Banners` },
          { label: 'Disabled', value: stats?.draft ?? 0 },
        ]}
      />

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-primary" />
            Announcement Banners
          </CardTitle>
          <CardDescription>Banners are shown to their audience only inside the schedule window</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={banners.data?.items ?? []}
            getRowId={(row) => row.id}
            searchKey="title"
            searchPlaceholder="Search banners by title..."
            emptyTitle="No announcement banners"
            emptyDescription="Create a banner to show a notice on customer portals."
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
                New Banner
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
              {editingId ? 'Edit Announcement Banner' : 'Publish Announcement Banner'}
            </DialogTitle>
            <DialogDescription>Shown as a header ribbon on customer self-care portals.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Banner Title</Label>
              <Input value={form.title} maxLength={100} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Fiber core upgrade tonight" className="text-xs" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Target Audience</Label>
              <Select value={form.audience} onValueChange={(v) => { if (v) setForm({ ...form, audience: v as NewsAudience }); }}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(AUDIENCE_LABEL) as NewsAudience[]).map((a) => (
                    <SelectItem key={a} value={a}>
                      {AUDIENCE_LABEL[a]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Start Date</Label>
                <Input type="date" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} className="text-xs font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">End Date (optional)</Label>
                <Input type="date" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} className="text-xs font-mono" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Message</Label>
              <Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Enter the banner message..." className="h-20 text-xs font-mono resize-y" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
              <span className="font-semibold">Published</span>
              <Switch checked={form.active} onCheckedChange={(c) => setForm({ ...form, active: c })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveBanner.isPending} className="gap-1.5 bg-primary text-primary-foreground">
              <CheckCircle2 className="h-4 w-4" />
              {saveBanner.isPending ? 'Saving…' : 'Save Banner'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewItem} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Banner Preview
            </DialogTitle>
            <DialogDescription>As rendered on the customer dashboard</DialogDescription>
          </DialogHeader>
          {previewItem && (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/30 text-foreground space-y-2">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <Megaphone className="h-4 w-4" />
                  <span>{previewItem.title}</span>
                </div>
                {previewItem.body && <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{previewItem.body}</p>}
                <p className="text-[11px] text-muted-foreground">
                  For {AUDIENCE_LABEL[previewItem.audience]} ·{' '}
                  <span className="font-mono text-foreground">{previewItem.startsAt ? formatDate(previewItem.startsAt) : 'now'}</span> →{' '}
                  <span className="font-mono text-foreground">{previewItem.endsAt ? formatDate(previewItem.endsAt) : 'no end date'}</span>
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setPreviewItem(null)}>Close Preview</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete banner"
        description="The banner is removed from all portals."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleteId) return;
          deleteBanner.mutate(deleteId, {
            onSuccess: () => {
              toast.success('Banner deleted');
              setDeleteId(null);
            },
          });
        }}
      />
    </div>
  );
}
