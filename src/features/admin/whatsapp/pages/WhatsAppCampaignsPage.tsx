'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { WhatsAppLoadError } from '../components/WhatsAppLoadError';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { DataTable } from '@/features/shared/data-table';
import { toast } from 'sonner';
import { Plus, Megaphone, Send, CheckCircle2, Clock, Activity, Eye, Rocket } from 'lucide-react';
import { formatDateTime } from '@/lib/format';
import { WhatsAppNavLinks } from './WhatsAppInboxPage';
import { useCreateCampaign, useLaunchCampaign, useWhatsAppCampaigns } from '../hooks/use-whatsapp';
import type { WaCampaign } from '../types';

const statusLabel = (s: string) => (s === 'done' ? 'completed' : s);

export function WhatsAppCampaignsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const campaigns = useWhatsAppCampaigns({ page, pageSize, search });
  const createCampaign = useCreateCampaign();
  const launchCampaign = useLaunchCampaign();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newCamp, setNewCamp] = useState({ name: '', templateId: '' });
  const [selectedCampaign, setSelectedCampaign] = useState<WaCampaign | null>(null);
  const [launchTarget, setLaunchTarget] = useState<WaCampaign | null>(null);

  const templates = campaigns.data?.templates ?? [];
  const optedIn = campaigns.data?.optedInCount ?? 0;

  const handleCreateCampaign = () => {
    if (!newCamp.name.trim()) {
      toast.error('Campaign title is required');
      return;
    }
    if (!newCamp.templateId) {
      toast.error('Choose an approved marketing template');
      return;
    }
    createCampaign.mutate(
      { name: newCamp.name.trim(), templateId: newCamp.templateId },
      {
        onSuccess: () => {
          toast.success(`Campaign "${newCamp.name.trim()}" created as a draft — launch it when ready`);
          setCreateModalOpen(false);
          setNewCamp({ name: '', templateId: '' });
        },
      },
    );
  };

  const columns = useMemo<LegacyColumnDef<WaCampaign, unknown>[]>(
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
            {row.original.templateName || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 130,
        cell: ({ row }) => {
          const status = statusLabel(row.original.status);
          return (
            <Badge
              variant={status === 'completed' ? 'default' : 'secondary'}
              className={`text-[10px] font-mono capitalize gap-1 ${
                status === 'completed' ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : status === 'running' ? 'bg-blue-600 hover:bg-blue-600 text-white' : ''
              }`}
            >
              {status === 'completed' ? <CheckCircle2 className="h-3 w-3" /> : status === 'running' ? <Activity className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              {status}
            </Badge>
          );
        },
      },
      {
        id: 'progress',
        header: 'Dispatch Result',
        size: 200,
        cell: ({ row }) => {
          const c = row.original;
          const attempted = c.sent + c.failed;
          const pct = attempted > 0 ? Math.round((c.sent / attempted) * 100) : 0;
          return attempted === 0 ? (
            <span className="text-[11px] text-muted-foreground">Not launched</span>
          ) : (
            <div className="space-y-1 w-full max-w-[170px]">
              <div className="flex justify-between text-[11px] font-mono">
                <span>
                  {c.sent} sent · {c.failed} failed
                </span>
                <span className="font-semibold text-foreground">{pct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Created At',
        size: 150,
        cell: ({ row }) => <span className="text-xs font-mono text-muted-foreground">{row.original.createdAt ? formatDateTime(row.original.createdAt) : '—'}</span>,
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        size: 160,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            {row.original.status === 'draft' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs gap-1 text-emerald-600 hover:bg-emerald-500/10"
                onClick={() => setLaunchTarget(row.original)}
              >
                <Rocket className="h-3.5 w-3.5" />
                Launch
              </Button>
            )}
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-primary hover:bg-primary/10" onClick={() => setSelectedCampaign(row.original)}>
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Details</span>
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  if (campaigns.isLoading) return <PageSkeleton variant="table" />;
  if (campaigns.isError && !campaigns.data) {
    return (
      <WhatsAppLoadError error={campaigns.error} title="Failed to load campaigns" fallback="Could not fetch WhatsApp campaigns." onRetry={() => campaigns.refetch()} />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="WhatsApp Broadcast Campaigns"
        subtitle="Send approved marketing templates to every opted-in subscriber"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'WhatsApp' },
          { label: 'Campaigns' },
        ]}
        actions={
          <Button className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Create Campaign
          </Button>
        }
      />

      <WhatsAppNavLinks />

      <OpsSummaryStrip
        items={[
          { label: 'Total Campaigns', value: campaigns.data?.meta.total ?? 0 },
          { label: 'Opted-in Audience', value: `${optedIn} Numbers` },
          { label: 'Approved Marketing Templates', value: templates.length },
        ]}
      />

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-primary" />
            Broadcast Campaigns
          </CardTitle>
          <CardDescription>Create a draft, then launch it to send the template to all opted-in numbers</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={campaigns.data?.items ?? []}
            getRowId={(row) => row.id}
            searchKey="name"
            searchPlaceholder="Search campaigns by name..."
            emptyTitle="No campaigns found"
            emptyDescription="Create your first WhatsApp broadcast campaign to reach subscribers."
            server={{
              page,
              pageSize,
              total: campaigns.data?.meta.total ?? 0,
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
              <Button size="sm" onClick={() => setCreateModalOpen(true)} className="gap-1.5">
                <Plus className="h-4 w-4" />
                Create Campaign
              </Button>
            }
          />
        </CardContent>
      </Card>

      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              Create WhatsApp Campaign
            </DialogTitle>
            <DialogDescription>The campaign is saved as a draft; it is sent only when you launch it.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Campaign Name</Label>
              <Input value={newCamp.name} onChange={(e) => setNewCamp({ ...newCamp, name: e.target.value })} placeholder="e.g. Speed upgrade offer" className="text-xs" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Approved Marketing Template</Label>
              <Select value={newCamp.templateId} onValueChange={(v) => { if (v) setNewCamp({ ...newCamp, templateId: v }); }}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder={templates.length ? 'Choose a template...' : 'No approved marketing templates'} />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id} className="text-xs font-mono">
                      {t.name} ({t.language})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 bg-muted/20 border border-border/50 rounded-lg space-y-1.5">
              <div className="flex justify-between text-muted-foreground">
                <span>Audience:</span>
                <span className="font-semibold text-foreground">All opted-in numbers</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Target Count:</span>
                <span className="font-semibold text-foreground font-mono">{optedIn} numbers</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCampaign} disabled={createCampaign.isPending} className="gap-1.5 bg-primary text-primary-foreground">
              <Send className="h-4 w-4" />
              {createCampaign.isPending ? 'Saving…' : 'Save Draft'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedCampaign} onOpenChange={(open) => !open && setSelectedCampaign(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              Campaign Report
            </DialogTitle>
            <DialogDescription>{selectedCampaign?.name}</DialogDescription>
          </DialogHeader>
          {selectedCampaign && (
            <div className="space-y-3 py-2 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-muted/20 rounded-lg border border-border/50">
                <div>
                  <span className="text-muted-foreground block">Template:</span>
                  <span className="font-mono font-semibold">{selectedCampaign.templateName || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Status:</span>
                  <Badge variant="secondary" className="font-mono text-[10px] mt-0.5 capitalize">
                    {statusLabel(selectedCampaign.status)}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground block">Recipients Processed:</span>
                  <span className="font-mono font-semibold">{selectedCampaign.recipients}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Sent / Failed:</span>
                  <span className="font-mono font-semibold">
                    <span className="text-emerald-500">{selectedCampaign.sent}</span> / <span className="text-destructive">{selectedCampaign.failed}</span>
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSelectedCampaign(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!launchTarget}
        onOpenChange={(open) => !open && setLaunchTarget(null)}
        title="Launch campaign"
        description={`Send "${launchTarget?.templateName ?? ''}" to ${optedIn} opted-in number(s) now? Meta bills marketing messages per delivery.`}
        confirmLabel="Launch"
        onConfirm={() => {
          if (!launchTarget) return;
          launchCampaign.mutate(launchTarget.id, {
            onSuccess: (r) => toast.success(`Campaign finished: ${r.sent} sent, ${r.failed} failed`),
            onSettled: () => setLaunchTarget(null),
          });
        }}
      />
    </div>
  );
}
