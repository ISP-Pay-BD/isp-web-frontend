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

export function VoiceSmsPage() {
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
  const gatewayName = gatewayKey ? (GATEWAY_NAMES[gatewayKey] ?? gatewayKey) : 'Not configured';

  const openEditor = (tpl: VoiceTemplate | null) => {
    setEditing(tpl);
    setClip(tpl ? { name: tpl.name, messageId: tpl.messageId } : { name: '', messageId: '' });
    setEditorOpen(true);
  };

  const messageColumns = useMemo<LegacyColumnDef<VoiceTemplate, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Voice Message',
        size: 220,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center bg-primary/10 text-primary">
              <Volume2 className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="font-semibold text-foreground text-xs block">{row.original.name}</span>
              <span className="text-[11px] font-mono text-muted-foreground">Gateway ID: {row.original.messageId}</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Added Date',
        size: 120,
        cell: ({ row }) => (
          <span className="text-xs font-mono text-muted-foreground">{row.original.createdAt ? formatDate(row.original.createdAt) : '—'}</span>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
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
                toast.info(`Selected "${row.original.name}" for broadcasting`);
              }}
            >
              <Radio className="h-3 w-3" />
              Select
            </Button>
            <Can menu="voice_sms" action="create">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditor(row.original)} title="Edit">
                <Edit className="h-3.5 w-3.5" />
              </Button>
            </Can>
            <Can menu="voice_sms" action="delete">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                onClick={() => setDeleteId(row.original.id)}
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </Can>
          </div>
        ),
      },
    ],
    [],
  );

  const broadcastColumns = useMemo<LegacyColumnDef<MessageBatch, unknown>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Audio Message',
        size: 220,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-primary shrink-0" />
            <span className="font-semibold text-foreground text-xs">{row.original.title || `Broadcast #${row.original.id}`}</span>
          </div>
        ),
      },
      {
        accessorKey: 'total',
        header: 'Subscribers',
        size: 160,
        cell: ({ row }) => (
          <div className="space-y-1">
            <Badge variant="secondary" className="font-mono text-xs">
              {row.original.total} calls
            </Badge>
            <div className="text-[10px] text-muted-foreground font-mono">
              {row.original.sent} placed · {row.original.failed} failed · {row.original.pending} pending
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 120,
        cell: ({ row }) => {
          const s = row.original.status;
          return (
            <Badge
              variant={s === 'completed' ? 'default' : 'secondary'}
              className={`text-[11px] capitalize ${s === 'completed' ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : ''}`}
            >
              {s}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Initiated At',
        size: 160,
        cell: ({ row }) => (
          <span className="text-xs font-mono text-muted-foreground">{row.original.createdAt ? formatDateTime(row.original.createdAt) : '—'}</span>
        ),
      },
    ],
    [],
  );

  if (templates.isLoading) return <PageSkeleton variant="table" />;
  if (templates.isError && !templates.data) {
    return (
      <EmptyState
        title="Failed to load Voice SMS"
        description="Could not fetch the voice message library."
        actionLabel="Retry"
        onAction={() => templates.refetch()}
      />
    );
  }

  const handleBroadcast = () => {
    if (!selectedVoiceId) {
      toast.error('Please select a voice message first');
      return;
    }
    if (audience === 0) {
      toast.error('No active subscribers in the selected area');
      return;
    }
    sendBroadcast.mutate(
      { templateId: selectedVoiceId, areaId: selectedArea },
      {
        onSuccess: (res) =>
          toast.success(res.queued ? `${res.count} voice call(s) queued` : `Voice call placed (${res.count} sent, ${res.failed} failed)`),
      },
    );
  };

  const handleSaveClip = () => {
    if (!clip.name.trim() || !clip.messageId.trim()) {
      toast.error('Please provide a name and the gateway voice ID');
      return;
    }
    saveTemplate.mutate(
      { id: editing?.id, name: clip.name.trim(), messageId: clip.messageId.trim() },
      {
        onSuccess: () => {
          toast.success(editing ? 'Voice message updated' : `Voice message "${clip.name.trim()}" added`);
          setEditorOpen(false);
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Voice SMS Broadcast"
        subtitle="Broadcast pre-recorded voice announcements registered on your voice gateway to broadband subscribers"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Communications' },
          { label: 'Voice SMS' },
        ]}
        actions={
          <Can menu="voice_sms" action="create">
            <Button onClick={() => openEditor(null)} className="gap-1.5 bg-primary text-primary-foreground">
              <Plus className="h-4 w-4" />
              Add Voice Message
            </Button>
          </Can>
        }
      />

      <OpsSummaryStrip
        items={[
          { label: 'Voice Gateway', value: gatewayName },
          { label: 'Voice Message Library', value: `${templates.data?.meta.total ?? 0} Messages` },
          { label: 'Broadcasts', value: broadcasts.data?.meta.total ?? 0 },
          { label: 'Target Audience', value: `${audience} Subscribers` },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Mic className="h-4 w-4 text-primary" />
              Voice Message Library
            </CardTitle>
            <CardDescription>Pre-recorded announcements registered on the voice gateway (by gateway voice ID)</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={messageColumns}
              data={templates.data?.items ?? []}
              getRowId={(row) => row.id}
              searchKey="name"
              searchPlaceholder="Search voice messages..."
              emptyTitle="No voice messages"
              emptyDescription="Add a voice message using its gateway voice ID to start broadcasting."
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
              Launch Voice Broadcast
            </CardTitle>
            <CardDescription>Calls every active subscriber in the chosen area</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Voice Gateway</Label>
              <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 font-mono text-xs">{gatewayName}</div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Voice Message</Label>
              <Select value={selectedVoiceId} onValueChange={(v) => { if (v) setSelectedVoiceId(v); }}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Choose a voice message..." />
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
              <Label className="text-xs font-semibold">Target Coverage Area</Label>
              <Select value={selectedArea} onValueChange={(v) => { if (v) setSelectedArea(v); }}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Service Areas ({areas.reduce((s, a) => s + a.activeCustomers, 0)} active)</SelectItem>
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
                <span>Estimated Calls:</span>
                <span className="font-semibold text-foreground font-mono">{audience} subscribers</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery:</span>
                <span className="font-medium text-foreground">Queued, placed in the background</span>
              </div>
            </div>

            <Can menu="voice_sms" action="create">
              <Button
                className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleBroadcast}
                disabled={sendBroadcast.isPending || !gatewayKey}
              >
                <Phone className="h-4 w-4" />
                {sendBroadcast.isPending ? 'Scheduling...' : 'Queue Voice Broadcast'}
              </Button>
            </Can>
            {!gatewayKey && settings.isSuccess && (
              <p className="text-[11px] text-amber-500">Configure a voice gateway in settings before broadcasting.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Voice Broadcast History</CardTitle>
          <CardDescription>Progress of queued voice broadcasts</CardDescription>
        </CardHeader>
        <CardContent>
          {broadcasts.isError ? (
            <EmptyState title="Could not load broadcasts" actionLabel="Retry" onAction={() => broadcasts.refetch()} />
          ) : (
            <DataTable
              columns={broadcastColumns}
              data={broadcasts.data?.items ?? []}
              isLoading={broadcasts.isLoading}
              getRowId={(row) => row.id}
              emptyTitle="No broadcasts yet"
              emptyDescription="Initiate your first voice broadcast above."
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
              {editing ? 'Edit Voice Message' : 'Add Voice Message'}
            </DialogTitle>
            <DialogDescription>Register a voice recording that already exists on your voice gateway account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Name</Label>
              <Input value={clip.name} onChange={(e) => setClip({ ...clip, name: e.target.value })} placeholder="e.g. Bill due announcement" className="text-xs" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Gateway Voice ID</Label>
              {(voices.data ?? []).length > 0 ? (
                <Select value={clip.messageId} onValueChange={(v) => v && setClip({ ...clip, messageId: v })}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Choose a voice from the gateway..." />
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
                  placeholder="Voice / message ID from the gateway panel"
                  className="font-mono text-xs"
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveClip} disabled={saveTemplate.isPending} className="gap-1.5 bg-primary text-primary-foreground">
              <CheckCircle2 className="h-4 w-4" />
              {saveTemplate.isPending ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete voice message"
        description="The recording stays on the gateway; it is only removed from this library."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleteId) return;
          deleteTemplate.mutate(deleteId, {
            onSuccess: () => {
              toast.success('Voice message deleted');
              if (selectedVoiceId === deleteId) setSelectedVoiceId('');
              setDeleteId(null);
            },
          });
        }}
      />
    </div>
  );
}
