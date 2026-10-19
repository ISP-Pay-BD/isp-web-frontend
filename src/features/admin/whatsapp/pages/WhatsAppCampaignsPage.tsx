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
import { useTranslations } from '@/i18n/locale-context';
import { waStatusLabel } from '../components/wa-labels';
import { WhatsAppNavLinks } from './WhatsAppInboxPage';
import { useCreateCampaign, useLaunchCampaign, useWhatsAppCampaigns } from '../hooks/use-whatsapp';
import type { WaCampaign } from '../types';

const statusLabel = (s: string) => (s === 'done' ? 'completed' : s);

export function WhatsAppCampaignsPage() {
  const t = useTranslations();
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
      toast.error(t('admin.whatsapp.campaigns.titleRequired', 'Campaign title is required'));
      return;
    }
    if (!newCamp.templateId) {
      toast.error(t('admin.whatsapp.campaigns.templateRequired', 'Choose an approved marketing template'));
      return;
    }
    createCampaign.mutate(
      { name: newCamp.name.trim(), templateId: newCamp.templateId },
      {
        onSuccess: () => {
          toast.success(
            t('admin.whatsapp.campaigns.created', 'Campaign "{name}" created as a draft — launch it when ready', { name: newCamp.name.trim() }),
          );
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
        header: t('admin.whatsapp.campaigns.colName', 'Campaign Name'),
        size: 220,
        enableHiding: false,
        cell: ({ row }) => (
          <div>
            <span className="font-semibold text-xs text-foreground block">{row.original.name}</span>
            <span className="text-xs text-muted-foreground font-mono">{t('admin.whatsapp.campaigns.idLine', 'ID: {id}', { id: row.original.id })}</span>
          </div>
        ),
      },
      {
        accessorKey: 'templateName',
        header: t('admin.whatsapp.campaigns.colTemplate', 'Meta Template'),
        size: 190,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-foreground/90 bg-muted/30 px-2 py-0.5 rounded border border-border/40">
            {row.original.templateName || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: t('common.status', 'Status'),
        size: 130,
        cell: ({ row }) => {
          const status = statusLabel(row.original.status);
          return (
            <Badge
              variant={status === 'completed' ? 'default' : 'secondary'}
              tone={status === 'completed' ? 'success' : status === 'running' ? 'info' : undefined} className="text-xs font-mono capitalize gap-1"
            >
              {status === 'completed' ? <CheckCircle2 className="h-3 w-3" /> : status === 'running' ? <Activity className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              {waStatusLabel(t, status)}
            </Badge>
          );
        },
      },
      {
        id: 'progress',
        header: t('admin.whatsapp.campaigns.colResult', 'Dispatch Result'),
        size: 250,
        cell: ({ row }) => {
          const c = row.original;
          const attempted = c.sent + c.failed;
          const pct = attempted > 0 ? Math.round((c.sent / attempted) * 100) : 0;
          return attempted === 0 ? (
            <span className="text-xs text-muted-foreground">{t('admin.whatsapp.campaigns.notLaunched', 'Not launched')}</span>
          ) : (
            <div className="space-y-1 w-full max-w-[230px]">
              <div className="flex justify-between text-xs font-mono">
                <span>
                  {t('admin.whatsapp.campaigns.sentFailed', '{sent} sent · {failed} failed', { sent: c.sent, failed: c.failed })}
                </span>
                <span className="font-semibold text-foreground">{pct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-emerald-500 transition-[width]" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: t('admin.whatsapp.campaigns.colCreated', 'Created At'),
        size: 150,
        cell: ({ row }) => <span className="text-xs font-mono text-muted-foreground">{row.original.createdAt ? formatDateTime(row.original.createdAt) : '—'}</span>,
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">{t('admin.customers.list.colActions', 'Actions')}</span>,
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
                {t('admin.whatsapp.campaigns.launch', 'Launch')}
              </Button>
            )}
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-primary hover:bg-primary/10" onClick={() => setSelectedCampaign(row.original)}>
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('admin.whatsapp.campaigns.details', 'Details')}</span>
            </Button>
          </div>
        ),
      },
    ],
    [t],
  );

  if (campaigns.isLoading) return <PageSkeleton variant="table" />;
  if (campaigns.isError && !campaigns.data) {
    return (
      <WhatsAppLoadError
        error={campaigns.error}
        title={t('admin.whatsapp.campaigns.loadFailed', 'Failed to load campaigns')}
        fallback={t('admin.whatsapp.campaigns.loadFailedHint', 'Could not fetch WhatsApp campaigns.')}
        onRetry={() => campaigns.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.whatsapp.campaigns.title', 'WhatsApp Broadcast Campaigns')}
        subtitle={t('admin.whatsapp.campaigns.subtitle', 'Send approved marketing templates to every opted-in subscriber')}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), url: '/admin/dashboard' },
          { label: 'WhatsApp' },
          { label: t('nav.wa-campaigns', 'Campaigns') },
        ]}
        actions={
          <Button className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4" />
            {t('admin.whatsapp.campaigns.create', 'Create Campaign')}
          </Button>
        }
      />

      <WhatsAppNavLinks />

      <OpsSummaryStrip
        items={[
          { label: t('admin.whatsapp.campaigns.kpiTotal', 'Total Campaigns'), value: campaigns.data?.meta.total ?? 0 },
          { label: t('admin.whatsapp.campaigns.kpiAudience', 'Opted-in Audience'), value: t('admin.whatsapp.campaigns.numbers', '{n} Numbers', { n: optedIn }) },
          { label: t('admin.whatsapp.campaigns.kpiTemplates', 'Approved Marketing Templates'), value: templates.length },
        ]}
      />

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-primary" />
            {t('admin.whatsapp.campaigns.cardTitle', 'Broadcast Campaigns')}
          </CardTitle>
          <CardDescription>{t('admin.whatsapp.campaigns.cardDesc', 'Create a draft, then launch it to send the template to all opted-in numbers')}</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable urlState
            columns={columns}
            data={campaigns.data?.items ?? []}
            getRowId={(row) => row.id}
            searchKey="name"
            searchPlaceholder={t('admin.whatsapp.campaigns.searchPlaceholder', 'Search campaigns by name...')}
            emptyTitle={t('admin.whatsapp.campaigns.emptyTitle', 'No campaigns found')}
            emptyDescription={t('admin.whatsapp.campaigns.emptyDesc', 'Create your first WhatsApp broadcast campaign to reach subscribers.')}
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
                {t('admin.whatsapp.campaigns.create', 'Create Campaign')}
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
              {t('admin.whatsapp.campaigns.dialogTitle', 'Create WhatsApp Campaign')}
            </DialogTitle>
            <DialogDescription>{t('admin.whatsapp.campaigns.dialogDesc', 'The campaign is saved as a draft; it is sent only when you launch it.')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-2">
              <Label htmlFor="campaign-name" className="text-xs font-semibold">{t('admin.whatsapp.campaigns.colName', 'Campaign Name')}</Label>
              <Input id="campaign-name" value={newCamp.name} onChange={(e) => setNewCamp({ ...newCamp, name: e.target.value })} placeholder={t('admin.whatsapp.campaigns.namePlaceholder', 'e.g. Speed upgrade offer')} className="text-xs" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="approved-marketing-template" className="text-xs font-semibold">{t('admin.whatsapp.campaigns.kpiTemplates', 'Approved Marketing Templates')}</Label>
              <Select
                value={newCamp.templateId}
                onValueChange={(v) => { if (v) setNewCamp({ ...newCamp, templateId: v }); }}
                items={Object.fromEntries(templates.map((tpl) => [tpl.id, `${tpl.name} (${tpl.language})`]))}
              >
                <SelectTrigger id="approved-marketing-template" className="text-xs">
                  <SelectValue
                    placeholder={
                      templates.length
                        ? t('admin.whatsapp.campaigns.chooseTemplate', 'Choose a template...')
                        : t('admin.whatsapp.campaigns.noTemplates', 'No approved marketing templates')
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((tpl) => (
                    <SelectItem key={tpl.id} value={tpl.id} className="text-xs font-mono">
                      {tpl.name} ({tpl.language})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 bg-muted/20 border border-border/50 rounded-lg space-y-1.5">
              <div className="flex justify-between text-muted-foreground">
                <span>{t('admin.whatsapp.campaigns.audience', 'Audience:')}</span>
                <span className="font-semibold text-foreground">{t('admin.whatsapp.campaigns.audienceAll', 'All opted-in numbers')}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{t('admin.whatsapp.campaigns.targetCount', 'Target Count:')}</span>
                <span className="font-semibold text-foreground font-mono">{t('admin.whatsapp.campaigns.targetNumbers', '{n} numbers', { n: optedIn })}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={handleCreateCampaign} disabled={createCampaign.isPending} className="gap-1.5 bg-primary text-primary-foreground">
              <Send className="h-4 w-4" />
              {createCampaign.isPending ? t('admin.whatsapp.campaigns.saving', 'Saving…') : t('admin.whatsapp.campaigns.saveDraft', 'Save Draft')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedCampaign} onOpenChange={(open) => !open && setSelectedCampaign(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              {t('admin.whatsapp.campaigns.reportTitle', 'Campaign Report')}
            </DialogTitle>
            <DialogDescription>{selectedCampaign?.name}</DialogDescription>
          </DialogHeader>
          {selectedCampaign && (
            <div className="space-y-3 py-2 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-muted/20 rounded-lg border border-border/50">
                <div>
                  <span className="text-muted-foreground block">{t('admin.whatsapp.campaigns.fieldTemplate', 'Template:')}</span>
                  <span className="font-mono font-semibold">{selectedCampaign.templateName || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">{t('admin.whatsapp.campaigns.fieldStatus', 'Status:')}</span>
                  <Badge variant="secondary" className="font-mono text-xs mt-0.5 capitalize">
                    {waStatusLabel(t, statusLabel(selectedCampaign.status))}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground block">{t('admin.whatsapp.campaigns.fieldRecipients', 'Recipients Processed:')}</span>
                  <span className="font-mono font-semibold">{selectedCampaign.recipients}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">{t('admin.whatsapp.campaigns.fieldSentFailed', 'Sent / Failed:')}</span>
                  <span className="font-mono font-semibold">
                    <span className="text-emerald-500">{selectedCampaign.sent}</span> / <span className="text-destructive">{selectedCampaign.failed}</span>
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSelectedCampaign(null)}>{t('common.close', 'Close')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!launchTarget}
        onOpenChange={(open) => !open && setLaunchTarget(null)}
        title={t('admin.whatsapp.campaigns.launchTitle', 'Launch campaign')}
        description={t(
          'admin.whatsapp.campaigns.launchDesc',
          'Send "{template}" to {n} opted-in number(s) now? Meta bills marketing messages per delivery.',
          { template: launchTarget?.templateName ?? '', n: optedIn },
        )}
        confirmLabel={t('admin.whatsapp.campaigns.launch', 'Launch')}
        onConfirm={() => {
          if (!launchTarget) return;
          launchCampaign.mutate(launchTarget.id, {
            onSuccess: (r) =>
              toast.success(t('admin.whatsapp.campaigns.finished', 'Campaign finished: {sent} sent, {failed} failed', { sent: r.sent, failed: r.failed })),
            onSettled: () => setLaunchTarget(null),
          });
        }}
      />
    </div>
  );
}
