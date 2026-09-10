'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  Megaphone,
  Plus,
  Eye,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Info,
  Sparkles,
} from 'lucide-react';
import { useIspOps } from '../hooks/use-isp-ops';
import type { IspOpsData } from '@/data/admin/isp-ops.data';

type Row = IspOpsData['announcements'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.title).toLowerCase().includes(q) ||
    String(r.audience).toLowerCase().includes(q) ||
    String(r.startsAt).toLowerCase().includes(q) ||
    String(r.endsAt).toLowerCase().includes(q)
  );
};

export function AnnouncementsPage() {
  const { data, isLoading, isError, refetch } = useIspOps();
  const [announcements, setAnnouncements] = useState<Row[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<Row | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    audience: 'All Subscribers',
    startsAt: '2026-09-10',
    endsAt: '2026-09-20',
    body: 'Emergency optical core maintenance will be carried out tonight between 2:00 AM and 5:00 AM.',
  });

  useMemo(() => {
    if (data?.announcements && announcements.length === 0) {
      setAnnouncements(data.announcements);
    }
  }, [data?.announcements, announcements.length]);

  const rows = announcements.length > 0 ? announcements : (data?.announcements ?? []);

  const handleToggleActive = (index: number) => {
    setAnnouncements((prev) =>
      prev.map((a, i) => (i === index ? { ...a, active: !a.active } : a))
    );
    toast.success('Announcement visibility updated');
  };

  const handleCreateAnnouncement = () => {
    if (!formData.title.trim()) {
      toast.error('Announcement title is required');
      return;
    }
    const created: Row = {
      id: `ann_${Date.now()}`,
      title: formData.title.trim(),
      audience: formData.audience,
      startsAt: formData.startsAt,
      endsAt: formData.endsAt,
      active: true,
    };
    setAnnouncements((prev) => [created, ...prev]);
    toast.success(`Announcement "${created.title}" published to subscriber portals!`);
    setCreateModalOpen(false);
    setFormData({
      title: '',
      audience: 'All Subscribers',
      startsAt: '2026-09-10',
      endsAt: '2026-09-20',
      body: '',
    });
  };

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
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
              <span className="font-semibold text-xs text-foreground block">{String(row.original.title)}</span>
              <span className="text-[10px] text-muted-foreground">Portal Top Notification Banner</span>
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
            {String(row.original.audience)}
          </Badge>
        ),
      },
      {
        accessorKey: 'startsAt',
        header: 'Active Schedule',
        size: 190,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
            <Calendar className="h-3 w-3 text-primary" />
            <span>{String(row.original.startsAt)}</span>
            <span>→</span>
            <span>{String(row.original.endsAt)}</span>
          </div>
        ),
      },
      {
        accessorKey: 'active',
        header: 'Live Status',
        size: 140,
        cell: ({ row }) => {
          const isActive = row.original.active;
          return (
            <div className="flex items-center gap-2.5">
              <Switch
                checked={isActive}
                onCheckedChange={() => handleToggleActive(row.index)}
              />
              <Badge
                variant={isActive ? 'default' : 'secondary'}
                className={`text-[10px] font-mono ${
                  isActive ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : ''
                }`}
              >
                {isActive ? 'Published' : 'Disabled'}
              </Badge>
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        size: 90,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs gap-1 text-primary hover:bg-primary/10"
            onClick={() => setPreviewItem(row.original)}
            title="Preview Banner"
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </Button>
        ),
      },
    ],
    [announcements],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load announcements" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const activeCount = rows.filter((r) => r.active).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Portal Announcement Banners"
        subtitle="Broadcast emergency maintenance notices, holiday billing alerts, and promotional banners on customer portals"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Engagement' },
          { label: 'Announcements' },
        ]}
        actions={
          <Button
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Create Announcement
          </Button>
        }
      />

      <OpsSummaryStrip
        items={[
          { label: 'Total Banners', value: rows.length },
          { label: 'Active Live Banners', value: `${activeCount} Published` },
          { label: 'Target Audience Scope', value: 'All Customer Tiers' },
          { label: 'Avg Click-Through Rate', value: '14.2%' },
          { label: 'Portal Display Engine', value: 'Instant Toast & Ribbon' },
        ]}
      />

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-primary" />
                Active Announcement Campaigns
              </CardTitle>
              <CardDescription>
                Banners displayed on subscriber portal headers and mobile captive screens
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={rows}
            searchKey="title"
            searchFilterFn={searchFilter}
            searchPlaceholder="Search banners by title or audience..."
            toolbarActions={
              <Button size="sm" onClick={() => setCreateModalOpen(true)} className="gap-1.5">
                <Plus className="h-4 w-4" />
                New Banner
              </Button>
            }
          />
        </CardContent>
      </Card>

      {/* Create Announcement Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              Publish Announcement Banner
            </DialogTitle>
            <DialogDescription>
              Broadcast a header announcement ribbon to customer self-care portals.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Banner Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Fiber Core Upgrades Tonight"
                className="text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Target Audience</Label>
              <Select
                value={formData.audience}
                onValueChange={(v) => { if (v) setFormData({ ...formData, audience: v }); }}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Subscribers">All Broadband Subscribers</SelectItem>
                  <SelectItem value="Uttara Sector 3">Uttara Area Only</SelectItem>
                  <SelectItem value="Mirpur Section 10">Mirpur Area Only</SelectItem>
                  <SelectItem value="Corporate Leased Lines">Corporate Clients Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Start Date</Label>
                <Input
                  type="date"
                  value={formData.startsAt}
                  onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">End Date</Label>
                <Input
                  type="date"
                  value={formData.endsAt}
                  onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Detailed Message Script</Label>
              <Textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Enter detailed notice content..."
                className="h-20 text-xs font-mono resize-y"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAnnouncement} className="gap-1.5 bg-primary text-primary-foreground">
              <CheckCircle2 className="h-4 w-4" />
              Publish Banner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={!!previewItem} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Subscriber Portal Banner Simulation
            </DialogTitle>
            <DialogDescription>Live preview as rendered on customer dashboard</DialogDescription>
          </DialogHeader>
          {previewItem && (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/30 text-foreground space-y-2">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <Megaphone className="h-4 w-4" />
                  <span>{previewItem.title}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Notice to {previewItem.audience}: This announcement is currently active from{' '}
                  <span className="font-mono text-foreground font-medium">{previewItem.startsAt}</span> to{' '}
                  <span className="font-mono text-foreground font-medium">{previewItem.endsAt}</span>.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setPreviewItem(null)}>Close Preview</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
