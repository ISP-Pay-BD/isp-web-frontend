'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { DataTable } from '@/features/shared/data-table';
import { toast } from 'sonner';
import {
  Pin,
  Plus,
  Newspaper,
  Eye,
  CheckCircle2,
  Calendar,
  Share2,
} from 'lucide-react';
import { useAdminNews } from '../hooks/use-admin-news';
import type { AdminNewsItem } from '@/data/admin/extras.data';

const searchFilter = (
  row: LegacyRow<AdminNewsItem>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const n = row.original;
  return (
    n.title.toLowerCase().includes(q) ||
    n.body.toLowerCase().includes(q) ||
    n.audience.toLowerCase().includes(q) ||
    n.status.toLowerCase().includes(q)
  );
};

export function AdminNewsPage() {
  const { data, isLoading, isError, refetch } = useAdminNews();
  const [items, setItems] = useState<AdminNewsItem[] | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<AdminNewsItem | null>(null);

  const [newNotice, setNewNotice] = useState<{
    title: string;
    audience: 'customers' | 'all' | 'resellers';
    status: 'published' | 'draft';
    body: string;
  }>({
    title: '',
    audience: 'all',
    status: 'published',
    body: '',
  });

  const list = items ?? data?.items ?? [];

  const handleTogglePin = (id: string, currentlyPinned?: boolean) => {
    const updated = !currentlyPinned;
    setItems(
      list.map((n) => (n.id === id ? { ...n, pinned: updated } : n))
    );
    toast.success(updated ? 'Notice pinned to top of subscriber portals' : 'Notice unpinned');
  };

  const handleCreateNotice = () => {
    if (!newNotice.title.trim() || !newNotice.body.trim()) {
      toast.error('Notice title and content are required');
      return;
    }
    const created: AdminNewsItem = {
      id: `news_${Date.now()}`,
      title: newNotice.title.trim(),
      titleBn: newNotice.title.trim(),
      body: newNotice.body.trim(),
      audience: newNotice.audience,
      status: newNotice.status,
      pinned: false,
      publishedAt: new Date().toISOString(),
    };
    setItems([created, ...list]);
    toast.success(`Notice "${created.title}" published successfully!`);
    setCreateModalOpen(false);
    setNewNotice({ title: '', audience: 'all', status: 'published', body: '' });
  };

  const columns = useMemo<LegacyColumnDef<AdminNewsItem, unknown>[]>(
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
            <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
              {row.original.body}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'audience',
        header: 'Target Audience',
        size: 140,
        cell: ({ row }) => <Badge variant="outline" className="text-[10px] font-mono">{row.original.audience}</Badge>,
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
              className={`text-[10px] font-mono capitalize ${
                s === 'published' ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : ''
              }`}
            >
              {s}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'publishedAt',
        header: 'Published Date',
        size: 130,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {new Date(row.original.publishedAt).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        size: 140,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              size="sm"
              variant="ghost"
              className={`h-8 text-xs gap-1 ${row.original.pinned ? 'text-amber-500' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => handleTogglePin(row.original.id, row.original.pinned)}
              title={row.original.pinned ? 'Unpin Notice' : 'Pin to Top'}
            >
              <Pin className={`h-3.5 w-3.5 ${row.original.pinned ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">{row.original.pinned ? 'Unpin' : 'Pin'}</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs gap-1 text-primary hover:bg-primary/10"
              onClick={() => setPreviewItem(row.original)}
              title="View Notice Details"
            >
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">View</span>
            </Button>
          </div>
        ),
      },
    ],
    [list],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load news" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const publishedCount = list.filter((n) => n.status === 'published').length;
  const pinnedCount = list.filter((n) => n.pinned).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="News & Notices"
        subtitle="Publish maintenance bulletins, promotional offers, and service announcements to subscriber web portals"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Engagement' },
          { label: 'News & Notices' },
        ]}
        actions={
          <Button
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Publish Notice
          </Button>
        }
      />

      <OpsSummaryStrip
        items={[
          { label: 'Total Notices', value: list.length },
          { label: 'Active Published', value: `${publishedCount} Live` },
          { label: 'Pinned Bulletins', value: `${pinnedCount} Featured` },
          { label: 'Total Subscriber Views', value: '4,120 Impressions' },
          { label: 'Portal Feed Engine', value: 'Synchronized Web Feed' },
        ]}
      />

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Newspaper className="h-4 w-4 text-primary" />
                Portal Bulletins & News Articles
              </CardTitle>
              <CardDescription>
                Synchronized announcements displayed on subscriber homepages and notifications center
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={list}
            searchKey="title"
            searchFilterFn={searchFilter}
            searchPlaceholder="Search notices by title or content..."
            facetFilters={[
              { columnId: 'status', title: 'Status' },
              { columnId: 'audience', title: 'Audience' },
            ]}
            toolbarActions={
              <Button size="sm" onClick={() => setCreateModalOpen(true)} className="gap-1.5">
                <Plus className="h-4 w-4" />
                New Notice
              </Button>
            }
          />
        </CardContent>
      </Card>

      {/* Create Notice Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-primary" />
              Publish News Notice
            </DialogTitle>
            <DialogDescription>
              Broadcast an announcement to customer portals and mobile self-care.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Notice Title</Label>
              <Input
                value={newNotice.title}
                onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                placeholder="e.g. Eid-ul-Fitr Bonus Bandwidth Offer"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Target Audience</Label>
                <Select
                  value={newNotice.audience}
                  onValueChange={(v) => { if (v) setNewNotice({ ...newNotice, audience: v as 'customers' | 'all' | 'resellers' }); }}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Audiences</SelectItem>
                    <SelectItem value="customers">Broadband Customers</SelectItem>
                    <SelectItem value="resellers">Reseller POPs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Status</Label>
                <Select
                  value={newNotice.status}
                  onValueChange={(v) => { if (v) setNewNotice({ ...newNotice, status: v as any }); }}
                >
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
              <Textarea
                value={newNotice.body}
                onChange={(e) => setNewNotice({ ...newNotice, body: e.target.value })}
                placeholder="Enter full notice announcement details..."
                className="h-28 text-xs font-mono resize-y leading-relaxed"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNotice} className="gap-1.5 bg-primary text-primary-foreground">
              <CheckCircle2 className="h-4 w-4" />
              Publish Notice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={!!previewItem} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-primary" />
              Notice Preview
            </DialogTitle>
            <DialogDescription>
              Published for: <span className="font-semibold text-foreground">{previewItem?.audience}</span>
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
              <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                <span>Audience: {previewItem.audience}</span>
                <span>Published: {new Date(previewItem.publishedAt).toLocaleString()}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setPreviewItem(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
