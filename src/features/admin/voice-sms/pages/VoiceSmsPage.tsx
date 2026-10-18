'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
import { Can } from '@/components/shared/Can';
import { DataTable } from '@/features/shared/data-table';
import { toast } from 'sonner';
import { Phone, Mic, Radio, Plus, Volume2, CheckCircle2, Edit, Trash2 } from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/format';
import { useLocale } from '@/i18n/locale-context';
import { useMessageBatches, useSmsRecipients } from '@/features/admin/sms/hooks/use-sms';
import type { MessageBatch } from '@/features/admin/sms/types';
import {
  useDeleteVoiceTemplate,
  useGatewayVoices,
  useSaveVoiceTemplate,
  useSendVoiceBroadcast,
  useVoiceSettings,
  useVoiceTemplates,
  type VoiceTemplate,
} from '../hooks/use-voice-sms';

const GATEWAY_NAMES: Record<string, string> = { awajdigital: 'Awaj Digital', bulksmsdhaka: 'BulkSMS Dhaka' };

type Translate = ReturnType<typeof useLocale>['t'];

function batchStatusLabel(t: Translate, status: string): string {
  if (status === 'completed') return t('status.completed', 'Completed');
  if (status === 'processing') return t('status.processing', 'Processing');
  if (status === 'queued') return t('status.queued', 'Queued');
  return status;
}

export function VoiceSmsPage() {
  const { t } = useLocale();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(10);
  const [selectedVoiceId, setSelectedVoiceId] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<VoiceTemplate | null>(null);
  const [clip, setClip] = useState({ name: '', messageId: '' });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const templates = useVoiceTemplates({ page, pageSize, search });
  const allTemplates = useVoiceTemplates({ page: 1, pageSize: 100 });
  const settings = useVoiceSettings();
  const gatewayKey = settings.data?.gateway ?? '';
  const voices = useGatewayVoices(editorOpen && gatewayKey === 'awajdigital');
  const recipients = useSmsRecipients({ page: 1, pageSize: 1, areaId: selectedArea });
  const broadcasts = useMessageBatches('voice', historyPage, historyPageSize);
  const saveTemplate = useSaveVoiceTemplate();
  const deleteTemplate = useDeleteVoiceTemplate();
  const sendBroadcast = useSendVoiceBroadcast();

  const areas = recipients.data?.areas ?? [];
  const audience = recipients.data?.audienceTotal ?? 0;
  const gatewayName = gatewayKey ? (GATEWAY_NAMES[gatewayKey] ?? gatewayKey) : t('admin.voiceSms.page.notConfigured', 'Not configured');

  const openEditor = (tpl: VoiceTemplate | null) => {
    setEditing(tpl);
    setClip(tpl ? { name: tpl.name, messageId: tpl.messageId } : { name: '', messageId: '' });
    setEditorOpen(true);
  };

  const messageColumns = useMemo<LegacyColumnDef<VoiceTemplate, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('admin.voiceSms.page.colMessage', 'Voice Message'),
        size: 220,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center bg-primary/10 text-primary">
              <Volume2 className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="font-semibold text-foreground text-xs block">{row.original.name}</span>
              <span className="text-xs font-mono text-muted-foreground">
                {t('admin.voiceSms.page.gatewayId', 'Gateway ID: {id}', { id: row.original.messageId })}
              </span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: t('admin.voiceSms.page.colAdded', 'Added Date'),
        size: 120,
        cell: ({ row }) => (
          <span className="text-xs font-mono text-muted-foreground">{row.original.createdAt ? formatDate(row.original.createdAt) : '—'}</span>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">{t('common.actions', 'Actions')}</span>,
        size: 170,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 gap-1 text-primary hover:bg-primary/10"
              onClick={() => {
                setSelectedVoiceId(row.original.id);
                toast.info(t('admin.voiceSms.page.selected', 'Selected "{name}" for broadcasting', { name: row.original.name }));
              }}
            >
              <Radio className="h-3 w-3" />
              {t('admin.voiceSms.page.select', 'Select')}
            </Button>
            <Can menu="voice_sms" action="create">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditor(row.original)} title={t('common.edit', 'Edit')} aria-label={t('common.edit', 'Edit')}>
                <Edit className="h-3.5 w-3.5" />
              </Button>
            </Can>
            <Can menu="voice_sms" action="delete">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                onClick={() => setDeleteId(row.original.id)}
                title={t('common.delete', 'Delete')}
                aria-label={t('common.delete', 'Delete')}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </Can>
          </div>
        ),
      },
    ],
    [t],
  );

  const broadcastColumns = useMemo<LegacyColumnDef<MessageBatch, unknown>[]>(
    () => [
      {
        accessorKey: 'title',
        header: t('admin.voiceSms.page.colAudio', 'Audio Message'),
        size: 220,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-primary shrink-0" />
            <span className="font-semibold text-foreground text-xs">{row.original.title || t('admin.voiceSms.page.broadcastN', 'Broadcast #{id}', { id: row.original.id })}</span>
          </div>
        ),
      },
      {
        accessorKey: 'total',
        header: t('admin.voiceSms.page.colSubscribers', 'Subscribers'),
        size: 160,
        cell: ({ row }) => (
          <div className="space-y-1">
            <Badge variant="secondary" className="font-mono text-xs">
              {t('admin.voiceSms.page.calls', '{n} calls', { n: row.original.total })}
            </Badge>
            <div className="text-xs text-muted-foreground font-mono">
              {t('admin.voiceSms.page.progress', '{sent} placed · {failed} failed · {pending} pending', {
                sent: row.original.sent,
                failed: row.original.failed,
                pending: row.original.pending,
              })}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: t('admin.voiceSms.page.colStatus', 'Status'),
        size: 120,
        cell: ({ row }) => {
          const s = row.original.status;
          return (
            <Badge
              variant={s === 'completed' ? 'default' : 'secondary'}
              tone={s === 'completed' ? 'success' : undefined} className="text-xs capitalize"
            >
              {batchStatusLabel(t, s)}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: t('admin.voiceSms.page.colInitiated', 'Initiated At'),
        size: 160,
        cell: ({ row }) => (
          <span className="text-xs font-mono text-muted-foreground">{row.original.createdAt ? formatDateTime(row.original.createdAt) : '—'}</span>
        ),
      },
    ],
    [t],
  );

  if (templates.isLoading) return <PageSkeleton variant="table" />;
  if (templates.isError && !templates.data) {
    return (
      <EmptyState variant="error"
        title={t('admin.voiceSms.page.loadFailed', 'Failed to load Voice SMS')}
        description={t('admin.voiceSms.page.loadFailedDesc', 'Could not fetch the voice message library.')}
        actionLabel={t('common.retry', 'Retry')}
        onAction={() => templates.refetch()}
      />
    );
  }

  const handleBroadcast = () => {
    if (!selectedVoiceId) {
      toast.error(t('admin.voiceSms.page.errSelect', 'Please select a voice message first'));
      return;
    }
    if (audience === 0) {
      toast.error(t('admin.voiceSms.page.errAudience', 'No active subscribers in the selected area'));
      return;
    }
    sendBroadcast.mutate(
      { templateId: selectedVoiceId, areaId: selectedArea },
      {
        onSuccess: (res) =>
          toast.success(
            res.queued
              ? t('admin.voiceSms.page.queued', '{n} voice call(s) queued', { n: res.count })
              : t('admin.voiceSms.page.placed', 'Voice call placed ({count} sent, {failed} failed)', {
                  count: res.count,
                  failed: res.failed,
                }),
          ),
      },
    );
  };

  const handleSaveClip = () => {
    if (!clip.name.trim() || !clip.messageId.trim()) {
      toast.error(t('admin.voiceSms.page.errClip', 'Please provide a name and the gateway voice ID'));
      return;
    }
    saveTemplate.mutate(
      { id: editing?.id, name: clip.name.trim(), messageId: clip.messageId.trim() },
      {
        onSuccess: () => {
          toast.success(
            editing
              ? t('admin.voiceSms.page.updated', 'Voice message updated')
              : t('admin.voiceSms.page.added', 'Voice message "{name}" added', { name: clip.name.trim() }),
          );
          setEditorOpen(false);
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.voiceSms.page.title', 'Voice SMS Broadcast')}
        subtitle={t(
          'admin.voiceSms.page.subtitle',
          'Broadcast pre-recorded voice announcements registered on your voice gateway to broadband subscribers',
        )}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), url: '/admin/dashboard' },
          { label: t('admin.voiceSms.page.crumbComms', 'Communications') },
          { label: t('admin.voiceSms.page.crumb', 'Voice SMS') },
        ]}
        actions={
          <Can menu="voice_sms" action="create">
            <Button onClick={() => openEditor(null)} className="gap-1.5 bg-primary text-primary-foreground">
              <Plus className="h-4 w-4" />
              {t('admin.voiceSms.page.add', 'Add Voice Message')}
            </Button>
          </Can>
        }
      />

      <OpsSummaryStrip
        items={[
          { label: t('admin.voiceSms.page.gateway', 'Voice Gateway'), value: gatewayName },
          {
            label: t('admin.voiceSms.page.library', 'Voice Message Library'),
            value: t('admin.voiceSms.page.messagesCount', '{n} Messages', { n: templates.data?.meta.total ?? 0 }),
          },
          { label: t('admin.voiceSms.page.broadcasts', 'Broadcasts'), value: broadcasts.data?.meta.total ?? 0 },
          {
            label: t('admin.voiceSms.page.audience', 'Target Audience'),
            value: t('admin.voiceSms.page.subscribersCount', '{n} Subscribers', { n: audience }),
          },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Mic className="h-4 w-4 text-primary" />
              {t('admin.voiceSms.page.library', 'Voice Message Library')}
            </CardTitle>
            <CardDescription>
              {t(
                'admin.voiceSms.page.libraryDesc',
                'Pre-recorded announcements registered on the voice gateway (by gateway voice ID)',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={messageColumns}
              data={templates.data?.items ?? []}
              getRowId={(row) => row.id}
              searchKey="name"
              searchPlaceholder={t('admin.voiceSms.page.search', 'Search voice messages...')}
              emptyTitle={t('admin.voiceSms.page.emptyTitle', 'No voice messages')}
              emptyDescription={t(
                'admin.voiceSms.page.emptyDesc',
                'Add a voice message using its gateway voice ID to start broadcasting.',
              )}
              enableColumnVisibility={false}
              server={{
                page,
                pageSize,
                total: templates.data?.meta.total ?? 0,
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
            />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Radio className="h-4 w-4 text-primary" />
              {t('admin.voiceSms.page.launch', 'Launch Voice Broadcast')}
            </CardTitle>
            <CardDescription>{t('admin.voiceSms.page.launchDesc', 'Calls every active subscriber in the chosen area')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">{t('admin.voiceSms.page.gateway', 'Voice Gateway')}</Label>
              <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 font-mono text-xs">{gatewayName}</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="voice-message" className="text-xs font-semibold">
                {t('admin.voiceSms.page.colMessage', 'Voice Message')}
              </Label>
              <Select value={selectedVoiceId} onValueChange={(v) => { if (v) setSelectedVoiceId(v); }}>
                <SelectTrigger id="voice-message" className="text-xs">
                  <SelectValue placeholder={t('admin.voiceSms.page.choose', 'Choose a voice message...')} />
                </SelectTrigger>
                <SelectContent>
                  {(allTemplates.data?.items ?? []).map((m) => (
                    <SelectItem key={m.id} value={m.id} className="text-xs">
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-coverage-area" className="text-xs font-semibold">
                {t('admin.voiceSms.page.area', 'Target Coverage Area')}
              </Label>
              <Select value={selectedArea} onValueChange={(v) => { if (v) setSelectedArea(v); }}>
                <SelectTrigger id="target-coverage-area" className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('admin.voiceSms.page.allAreas', 'All Service Areas ({n} active)', {
                      n: areas.reduce((s, a) => s + a.activeCustomers, 0),
                    })}
                  </SelectItem>
                  {areas.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name} ({a.activeCustomers})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-1.5">
              <div className="flex justify-between text-muted-foreground">
                <span>{t('admin.voiceSms.page.estimated', 'Estimated Calls:')}</span>
                <span className="font-semibold text-foreground font-mono">
                  {t('admin.voiceSms.page.subscribersLower', '{n} subscribers', { n: audience })}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{t('admin.voiceSms.page.delivery', 'Delivery:')}</span>
                <span className="font-medium text-foreground">
                  {t('admin.voiceSms.page.deliveryValue', 'Queued, placed in the background')}
                </span>
              </div>
            </div>

            <Can menu="voice_sms" action="create">
              <Button
                className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleBroadcast}
                disabled={sendBroadcast.isPending || !gatewayKey}
              >
                <Phone className="h-4 w-4" />
                {sendBroadcast.isPending
                  ? t('admin.voiceSms.page.scheduling', 'Scheduling...')
                  : t('admin.voiceSms.page.queue', 'Queue Voice Broadcast')}
              </Button>
            </Can>
            {!gatewayKey && settings.isSuccess && (
              <p className="text-xs text-amber-500">
                {t('admin.voiceSms.page.configure', 'Configure a voice gateway in settings before broadcasting.')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('admin.voiceSms.page.history', 'Voice Broadcast History')}</CardTitle>
          <CardDescription>{t('admin.voiceSms.page.historyDesc', 'Progress of queued voice broadcasts')}</CardDescription>
        </CardHeader>
        <CardContent>
          {broadcasts.isError ? (
            <EmptyState
              variant="error"
              title={t('admin.voiceSms.page.broadcastsFailed', 'Could not load broadcasts')}
              actionLabel={t('common.retry', 'Retry')}
              onAction={() => broadcasts.refetch()}
            />
          ) : (
            <DataTable
              columns={broadcastColumns}
              data={broadcasts.data?.items ?? []}
              isLoading={broadcasts.isLoading}
              getRowId={(row) => row.id}
              emptyTitle={t('admin.voiceSms.page.noBroadcasts', 'No broadcasts yet')}
              emptyDescription={t('admin.voiceSms.page.noBroadcastsDesc', 'Initiate your first voice broadcast above.')}
              enableColumnVisibility={false}
              server={{
                page: historyPage,
                pageSize: historyPageSize,
                total: broadcasts.data?.meta.total ?? 0,
                onPageChange: setHistoryPage,
                onPageSizeChange: (size) => {
                  setHistoryPageSize(size);
                  setHistoryPage(1);
                },
              }}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-primary" />
              {editing ? t('admin.voiceSms.page.editTitle', 'Edit Voice Message') : t('admin.voiceSms.page.add', 'Add Voice Message')}
            </DialogTitle>
            <DialogDescription>
              {t('admin.voiceSms.page.dialogDesc', 'Register a voice recording that already exists on your voice gateway account.')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-semibold">{t('admin.voiceSms.page.fieldName', 'Name')}</Label>
              <Input
                id="name"
                value={clip.name}
                onChange={(e) => setClip({ ...clip, name: e.target.value })}
                placeholder={t('admin.voiceSms.page.namePlaceholder', 'e.g. Bill due announcement')}
                className="text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">{t('admin.voiceSms.page.voiceId', 'Gateway Voice ID')}</Label>
              {(voices.data ?? []).length > 0 ? (
                <Select value={clip.messageId} onValueChange={(v) => v && setClip({ ...clip, messageId: v })}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder={t('admin.voiceSms.page.chooseGateway', 'Choose a voice from the gateway...')} />
                  </SelectTrigger>
                  <SelectContent>
                    {(voices.data ?? []).map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={clip.messageId}
                  onChange={(e) => setClip({ ...clip, messageId: e.target.value })}
                  placeholder={t('admin.voiceSms.page.idPlaceholder', 'Voice / message ID from the gateway panel')}
                  className="font-mono text-xs"
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditorOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={handleSaveClip} disabled={saveTemplate.isPending} className="gap-1.5 bg-primary text-primary-foreground">
              <CheckCircle2 className="h-4 w-4" />
              {saveTemplate.isPending ? t('admin.voiceSms.page.saving', 'Saving…') : t('common.save', 'Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t('admin.voiceSms.page.deleteTitle', 'Delete voice message')}
        description={t('admin.voiceSms.page.deleteDesc', 'The recording stays on the gateway; it is only removed from this library.')}
        confirmLabel={t('common.delete', 'Delete')}
        destructive
        onConfirm={() => {
          if (!deleteId) return;
          deleteTemplate.mutate(deleteId, {
            onSuccess: () => {
              toast.success(t('admin.voiceSms.page.deleted', 'Voice message deleted'));
              if (selectedVoiceId === deleteId) setSelectedVoiceId('');
              setDeleteId(null);
            },
          });
        }}
      />
    </div>
  );
}
