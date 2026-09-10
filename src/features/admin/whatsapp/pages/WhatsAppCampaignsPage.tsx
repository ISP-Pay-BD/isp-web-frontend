'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  Play,
  CheckCircle2,
  Clock,
  Send,
  Eye,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { WhatsAppNavLinks } from './WhatsAppInboxPage';
import { useWhatsApp } from '../hooks/use-whatsapp';
import type { WhatsAppCampaign } from '@/data/admin/comms.data';

const campaignSearchFilter = (
  row: LegacyRow<WhatsAppCampaign>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const c = row.original;
  return (
    c.name.toLowerCase().includes(q) ||
    c.templateName.toLowerCase().includes(q) ||
    c.status.toLowerCase().includes(q)
  );
};

export function WhatsAppCampaignsPage() {
  const { data, isLoading, isError, refetch } = useWhatsApp();
  const [campaigns, setCampaigns] = useState<WhatsAppCampaign[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<WhatsAppCampaign | null>(null);

  const [newCamp, setNewCamp] = useState({
    name: '',
    templateId: 'wat_4',
    templateName: 'eid_bonus_offer_2026',
    audience: 'all_opted_in',
    recipientCount: 300,
  });

  useMemo(() => {
    if (data?.campaigns && campaigns.length === 0) {
      setCampaigns(data.campaigns);
    }
  }, [data?.campaigns, campaigns.length]);

  const list = campaigns.length > 0 ? campaigns : (data?.campaigns ?? []);
  const templates = data?.templates ?? [];

  const handleCreateCampaign = () => {
    if (!newCamp.name.trim()) {
      toast.error('Campaign title is required');
      return;
    }
    const tpl = templates.find((t) => t.id === newCamp.templateId);
    const created: WhatsAppCampaign = {
      id: `camp_${Date.now()}`,
      name: newCamp.name.trim(),
      templateId: newCamp.templateId,
      templateName: tpl?.name ?? newCamp.templateName,
      status: 'running',
      totalRecipients: newCamp.recipientCount,
      sentCount: Math.floor(newCamp.recipientCount * 0.4),
      deliveredCount: Math.floor(newCamp.recipientCount * 0.38),
      createdAt: new Date().toISOString(),
    };

    setCampaigns((prev) => [created, ...prev]);
    toast.success(`Campaign "${created.name}" created and broadcast initiated!`);
    setCreateModalOpen(false);
    setNewCamp({
      name: '',
      templateId: 'wat_4',
      templateName: 'eid_bonus_offer_2026',
      audience: 'all_opted_in',
      recipientCount: 300,
    });
  };

  const columns = useMemo<LegacyColumnDef<WhatsAppCampaign, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Campaign Name',
        size: 220,
        enableHiding: false,
        cell: ({ row }) => (
          <div>
            <span className="font-semibold text-xs text-foreground block">{row.original.name}</span>
            <span className="text-[10px] text-muted-foreground font-mono">ID: {row.original.id}</span>
          </div>
        ),
      },
      {
        accessorKey: 'templateName',
        header: 'Meta Template',
        size: 190,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-foreground/90 bg-muted/30 px-2 py-0.5 rounded border border-border/40">
            {row.original.templateName}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 130,
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Badge
              variant={
                status === 'completed'
                  ? 'default'
                  : status === 'failed'
                    ? 'destructive'
                    : 'secondary'
              }
              className={`text-[10px] font-mono capitalize gap-1 ${
                status === 'completed'
                  ? 'bg-emerald-600 hover:bg-emerald-600 text-white'
                  : status === 'running'
                    ? 'bg-blue-600 hover:bg-blue-600 text-white animate-pulse'
                    : ''
              }`}
            >
              {status === 'completed' ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : status === 'running' ? (
                <Activity className="h-3 w-3" />
              ) : status === 'failed' ? (
                <AlertCircle className="h-3 w-3" />
              ) : (
                <Clock className="h-3 w-3" />
              )}
              {status}
            </Badge>
          );
        },
      },
      {
        id: 'progress',
        header: 'Dispatch Progress',
        size: 200,
        cell: ({ row }) => {
          const c = row.original;
          const pct = Math.round((c.sentCount / (c.totalRecipients || 1)) * 100);
          return (
            <div className="space-y-1 w-full max-w-[170px]">
              <div className="flex justify-between text-[11px] font-mono">
                <span>{c.sentCount}/{c.totalRecipients} sent</span>
                <span className="font-semibold text-foreground">{pct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    c.status === 'completed'
                      ? 'bg-emerald-500'
                      : c.status === 'failed'
                        ? 'bg-destructive'
                        : 'bg-primary'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'deliveredCount',
        header: 'Delivered',
        size: 110,
        cell: ({ row }) => (
          <Badge variant="outline" className="font-mono text-xs text-emerald-500 border-emerald-300">
            {row.original.deliveredCount} msgs
          </Badge>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created At',
        size: 150,
        cell: ({ row }) => (
          <span className="text-xs font-mono text-muted-foreground">
            {new Date(row.original.createdAt).toLocaleString([], {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        ),
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
            onClick={() => setSelectedCampaign(row.original)}
            title="Inspect Campaign"
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Details</span>
          </Button>
        ),
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load campaigns"
        description="Could not fetch WhatsApp campaigns."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const totalSent = list.reduce((sum, c) => sum + c.sentCount, 0);
  const totalRecipients = list.reduce((sum, c) => sum + c.totalRecipients, 0);
  const totalDelivered = list.reduce((sum, c) => sum + c.deliveredCount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="WhatsApp Broadcast Campaigns"
        subtitle="Launch and monitor high-engagement bulk template campaigns with real-time delivery telemetry"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'WhatsApp' },
          { label: 'Campaigns' },
        ]}
        actions={
          <Button
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Create Campaign
          </Button>
        }
      />

      <WhatsAppNavLinks />

      <OpsSummaryStrip
        items={[
          { label: 'Total Campaigns', value: list.length },
          { label: 'Active Running', value: list.filter((c) => c.status === 'running').length },
          { label: 'Total Reached Subscribers', value: `${totalSent.toLocaleString()} Users` },
          { label: 'Delivered Messages', value: `${totalDelivered.toLocaleString()} Messages` },
          { label: 'Avg Delivery Success Rate', value: `${Math.round((totalDelivered / (totalSent || 1)) * 100)}%` },
        ]}
      />

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-primary" />
                Broadcast Campaign Telemetry
              </CardTitle>
              <CardDescription>
                Live campaign dispatches throttled via Meta Business Cloud rate limits
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={list}
            getRowId={(row) => row.id}
            searchKey="name"
            searchPlaceholder="Search campaigns by name or template..."
            searchFilterFn={campaignSearchFilter}
            facetFilters={[{ columnId: 'status', title: 'Campaign Status' }]}
            emptyTitle="No campaigns found"
            emptyDescription="Launch your first WhatsApp broadcast campaign to reach subscribers."
            toolbarActions={
              <Button size="sm" onClick={() => setCreateModalOpen(true)} className="gap-1.5">
                <Plus className="h-4 w-4" />
                Create Campaign
              </Button>
            }
          />
        </CardContent>
      </Card>

      {/* Create Campaign Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              Launch WhatsApp Campaign
            </DialogTitle>
            <DialogDescription>
              Configure bulk template broadcast to verified opted-in subscribers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Campaign Name</Label>
              <Input
                value={newCamp.name}
                onChange={(e) => setNewCamp({ ...newCamp, name: e.target.value })}
                placeholder="e.g. October Festival Speed Boost"
                className="text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Meta HSM Template</Label>
              <Select
                value={newCamp.templateId}
                onValueChange={(val) => {
                  if (val) {
                    const found = templates.find((t) => t.id === val);
                    setNewCamp({
                      ...newCamp,
                      templateId: val,
                      templateName: found?.name ?? newCamp.templateName,
                    });
                  }
                }}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id} className="text-xs font-mono">
                      {t.name} ({t.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Target Audience Segment</Label>
              <Select
                value={newCamp.audience}
                onValueChange={(v) => { if (v) setNewCamp({ ...newCamp, audience: v }); }}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_opted_in">All Verified Opted-In Users (300)</SelectItem>
                  <SelectItem value="uttara">Uttara Area Subscribers (120)</SelectItem>
                  <SelectItem value="mirpur">Mirpur Area Subscribers (95)</SelectItem>
                  <SelectItem value="high_tier">50+ Mbps Plan Users (85)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 bg-muted/20 border border-border/50 rounded-lg space-y-1.5">
              <div className="flex justify-between text-muted-foreground">
                <span>Target Count:</span>
                <span className="font-semibold text-foreground font-mono">~300 subscribers</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Meta Category Fee:</span>
                <span className="font-semibold text-foreground font-mono">৳0.85 / Marketing Msg</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Estimated Cost:</span>
                <span className="font-semibold text-primary font-mono">৳255.00 BDT</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCampaign} className="gap-1.5 bg-primary text-primary-foreground">
              <Send className="h-4 w-4" />
              Launch Broadcast
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Campaign Details Modal */}
      <Dialog open={!!selectedCampaign} onOpenChange={(open) => !open && setSelectedCampaign(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              Campaign Telemetry Report
            </DialogTitle>
            <DialogDescription>Live metrics for {selectedCampaign?.name}</DialogDescription>
          </DialogHeader>
          {selectedCampaign && (
            <div className="space-y-3 py-2 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-muted/20 rounded-lg border border-border/50">
                <div>
                  <span className="text-muted-foreground block">Template:</span>
                  <span className="font-mono font-semibold">{selectedCampaign.templateName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Status:</span>
                  <Badge variant="secondary" className="font-mono text-[10px] mt-0.5">
                    {selectedCampaign.status.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground block">Target Recipients:</span>
                  <span className="font-mono font-semibold">{selectedCampaign.totalRecipients}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Delivered Success:</span>
                  <span className="font-mono font-semibold text-emerald-500">{selectedCampaign.deliveredCount}</span>
                </div>
              </div>
              <div className="p-3 bg-background border border-border/60 rounded-lg space-y-1">
                <span className="font-semibold block">Delivery Rate:</span>
                <p className="text-muted-foreground text-xs">
                  {Math.round((selectedCampaign.deliveredCount / (selectedCampaign.sentCount || 1)) * 100)}% of transmitted messages delivered to subscriber devices.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSelectedCampaign(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
