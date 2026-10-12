'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Pin, Plus, Newspaper, Eye, CheckCircle2, Edit, Trash2 } from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/format';
import {
  useAdminNews,
  useDeleteNews,
  useSaveNews,
  type NewsAudience,
  type NewsItem,
  type NewsStatus,
} from '../hooks/use-admin-news';

const AUDIENCE_LABEL: Record<NewsAudience, string> = {
  all: 'All Audiences',
  customers: 'Broadband Customers',
  resellers: 'Reseller POPs',
  employees: 'Employees',
};

interface NoticeForm {
  title: string;
  audience: NewsAudience;
  status: NewsStatus;
  body: string;
  url: string;
  image: File | null;
}

const EMPTY: NoticeForm = { title: '', audience: 'all', status: 'published', body: '', url: '', image: null };

export function AdminNewsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const news = useAdminNews({ kind: 'news', page, pageSize, search, status });
  const saveNews = useSaveNews();
  const deleteNews = useDeleteNews();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<NoticeForm>(EMPTY);
  const [previewItem, setPreviewItem] = useState<NewsItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openEditor = (item: NewsItem | null) => {
    setEditingId(item?.id ?? null);
    setForm(item ? { title: item.title, audience: item.audience, status: item.status, body: item.body, url: item.url, image: null } : EMPTY);
    setEditorOpen(true);
  };

  const handleTogglePin = (item: NewsItem) =>
    saveNews.mutate(
      { id: item.id, input: { pinned: !item.pinned } },
      { onSuccess: () => toast.success(!item.pinned ? 'Notice pinned to the top of subscriber feeds' : 'Notice unpinned') },
    );

  const handleSave = () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast.error('Notice title and content are required');
      return;
    }
    saveNews.mutate(
      {
        id: editingId ?? undefined,
        input: { title: form.title.trim(), body: form.body.trim(), url: form.url.trim(), audience: form.audience, status: form.status, kind: 'news', image: form.image },
      },
      {
        onSuccess: () => {
          toast.success(editingId ? 'Notice updated' : form.status === 'published' ? `Notice "${form.title.trim()}" published` : 'Notice saved as draft');
          setEditorOpen(false);
        },
      },
    );
  };

  const columns = useMemo<LegacyColumnDef<NewsItem, unknown>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Notice Title & Overview',
        size: 280,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="max-w-md space-y-1">
            <div className="flex items-center gap-2 font-semibold text-xs text-foreground">
              {row.original.pinned && (
                <Badge variant="secondary" className="gap-1 text-[10px] bg-amber-500/15 text-amber-500 border border-amber-500/30 px-1.5 py-0">
                  <Pin className="h-3 w-3 fill-current" />
                  Pinned
                </Badge>
              )}
              <span>{row.original.title}</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">{row.original.body}</p>
          </div>
        ),
      },
      {
        accessorKey: 'audience',
        header: 'Target Audience',
        size: 150,
        cell: ({ row }) => <Badge variant="outline" className="text-[10px] font-mono">{AUDIENCE_LABEL[row.original.audience]}</Badge>,
      },
      {
        accessorKey: 'status',
        header: 'Publication Status',
        size: 130,
        cell: ({ row }) => {
          const s = row.original.status;
          return (
            <Badge
              variant={s === 'published' ? 'default' : 'secondary'}
              className={`text-[10px] font-mono capitalize ${s === 'published' ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : ''}`}
            >
              {s}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'publishedAt',
        header: 'Created',
        size: 130,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{row.original.publishedAt ? formatDate(row.original.publishedAt) : '—'}</span>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        size: 200,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              size="sm"
              variant="ghost"
              className={`h-8 text-xs gap-1 ${row.original.pinned ? 'text-amber-500' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => handleTogglePin(row.original)}
              title={row.original.pinned ? 'Unpin Notice' : 'Pin to Top'}
            >
              <Pin className={`h-3.5 w-3.5 ${row.original.pinned ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">{row.original.pinned ? 'Unpin' : 'Pin'}</span>
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => setPreviewItem(row.original)} title="View">
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditor(row.original)} title="Edit">
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(row.original.id)} title="Delete">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  if (news.isLoading) return <PageSkeleton variant="table" />;
  if (news.isError && !news.data) {
    return <EmptyState title="Failed to load news" description="Could not fetch notices." actionLabel="Retry" onAction={() => news.refetch()} />;
  }

  const stats = news.data?.stats;

  return (
    <div className="space-y-6">
      <PageHeader
        title="News & Notices"
        subtitle="Publish maintenance bulletins, offers and service announcements to subscriber portals and the mobile app"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Engagement' },
          { label: 'News & Notices' },
        ]}
        actions={
          <Button className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => openEditor(null)}>
            <Plus className="h-4 w-4" />
            Publish Notice
          </Button>
        }
      />

      <OpsSummaryStrip
        items={[
          { label: 'Total Notices', value: stats?.total ?? 0 },
          { label: 'Active Published', value: `${stats?.published ?? 0} Live` },
          { label: 'Drafts', value: stats?.draft ?? 0 },
          { label: 'Pinned Bulletins', value: `${stats?.pinned ?? 0} Featured` },
        ]}
      />

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Newspaper className="h-4 w-4 text-primary" />
                Portal Bulletins & News Articles
              </CardTitle>
              <CardDescription>Published notices appear in the customer portal and app feed; pinned ones stay on top</CardDescription>
            </div>
            <Select value={status} onValueChange={(v) => { if (v) { setStatus(v); setPage(1); } }}>
              <SelectTrigger className="h-9 w-[140px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Drafts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={news.data?.items ?? []}
            getRowId={(row) => row.id}
            searchKey="title"
            searchPlaceholder="Search notices by title or content..."
            emptyTitle="No notices yet"
            emptyDescription="Publish your first notice to reach subscribers."
            server={{
              page,
              pageSize,
              total: news.data?.meta.total ?? 0,
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
                New Notice
              </Button>
            }
          />
        </CardContent>
      </Card>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-primary" />
              {editingId ? 'Edit Notice' : 'Publish News Notice'}
            </DialogTitle>
            <DialogDescription>Shown in customer portals and the mobile self-care app.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Notice Title</Label>
              <Input value={form.title} maxLength={100} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Scheduled maintenance tonight" className="text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
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
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Status</Label>
                <Select value={form.status} onValueChange={(v) => { if (v) setForm({ ...form, status: v as NewsStatus }); }}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Publish Immediately</SelectItem>
                    <SelectItem value="draft">Save as Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Notice Content</Label>
              <Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Enter full notice details..." className="h-28 text-xs font-mono resize-y leading-relaxed" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Link (optional)</Label>
                <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." className="text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Image (optional)</Label>
                <Input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => setForm({ ...form, image: e.target.files?.[0] ?? null })} className="text-xs" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveNews.isPending} className="gap-1.5 bg-primary text-primary-foreground">
              <CheckCircle2 className="h-4 w-4" />
              {saveNews.isPending ? 'Saving…' : editingId ? 'Save Changes' : 'Publish Notice'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewItem} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-primary" />
              Notice Preview
            </DialogTitle>
            <DialogDescription>
              Published for: <span className="font-semibold text-foreground">{previewItem ? AUDIENCE_LABEL[previewItem.audience] : ''}</span>
            </DialogDescription>
          </DialogHeader>
          {previewItem && (
            <div className="space-y-3 py-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-foreground">{previewItem.title}</span>
                {previewItem.pinned && (
                  <Badge variant="secondary" className="text-[10px] bg-amber-500/15 text-amber-500 border border-amber-500/30">
                    Pinned
                  </Badge>
                )}
              </div>
              <div className="p-4 bg-muted/20 border border-border/50 rounded-xl font-sans text-xs leading-relaxed whitespace-pre-wrap text-foreground/90">
                {previewItem.body}
              </div>
              {previewItem.url && (
                <a href={previewItem.url} target="_blank" rel="noreferrer" className="text-primary underline break-all">
                  {previewItem.url}
                </a>
              )}
              <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                <span className="capitalize">Status: {previewItem.status}</span>
                <span>Created: {previewItem.publishedAt ? formatDateTime(previewItem.publishedAt) : '—'}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setPreviewItem(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete notice"
        description="The notice is removed from every subscriber feed."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleteId) return;
          deleteNews.mutate(deleteId, {
            onSuccess: () => {
              toast.success('Notice deleted');
              setDeleteId(null);
            },
          });
        }}
      />
    </div>
  );
}
