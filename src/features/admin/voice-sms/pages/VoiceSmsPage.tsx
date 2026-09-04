'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Can } from '@/components/shared/Can';
import { DataTable } from '@/features/shared/data-table';
import { toast } from 'sonner';
import { Phone, Mic, Radio, Play } from 'lucide-react';
import { useVoiceSms } from '../hooks/use-voice-sms';
import type { VoiceBroadcast, VoiceMessage } from '@/data/admin/voice-sms.data';

const messageSearchFilter = (
  row: LegacyRow<VoiceMessage>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const msg = row.original;
  return (
    msg.name.toLowerCase().includes(q) ||
    msg.transcript.toLowerCase().includes(q)
  );
};

const broadcastSearchFilter = (
  row: LegacyRow<VoiceBroadcast>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const b = row.original;
  return (
    b.voiceMsgName.toLowerCase().includes(q) ||
    b.areaName.toLowerCase().includes(q) ||
    b.status.toLowerCase().includes(q)
  );
};

export function VoiceSmsPage() {
  const { data, isLoading, isError, refetch } = useVoiceSms();
  const [selectedGateway, setSelectedGateway] = useState('mimsms_voice');
  const [selectedVoiceId, setSelectedVoiceId] = useState('');

  const messageColumns = useMemo<LegacyColumnDef<VoiceMessage, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        enableHiding: false,
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: 'durationSeconds',
        header: 'Duration',
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.durationSeconds}s</span>
        ),
      },
      {
        accessorKey: 'transcript',
        header: 'Transcript',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground max-w-xs line-clamp-2">
            {row.original.transcript}
          </span>
        ),
      },
      {
        accessorKey: 'addedOn',
        header: 'Added',
        cell: ({ row }) => <span className="text-xs">{row.original.addedOn}</span>,
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Play</span>,
        enableSorting: false,
        enableHiding: false,
        cell: () => (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => toast.info('Playing sample audio (mock)')}
          >
            <Play className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [],
  );

  const broadcastColumns = useMemo<LegacyColumnDef<VoiceBroadcast, unknown>[]>(
    () => [
      {
        accessorKey: 'voiceMsgName',
        header: 'Message',
        enableHiding: false,
        cell: ({ row }) => (
          <span className="font-medium">{row.original.voiceMsgName}</span>
        ),
      },
      {
        accessorKey: 'areaName',
        header: 'Area',
      },
      {
        accessorKey: 'recipientsCount',
        header: 'Recipients',
        cell: ({ row }) => (
          <span className="font-mono">{row.original.recipientsCount}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.status === 'completed'
                ? 'default'
                : row.original.status === 'failed'
                  ? 'destructive'
                  : 'secondary'
            }
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: 'initiatedAt',
        header: 'Initiated',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {new Date(row.original.initiatedAt).toLocaleString()}
          </span>
        ),
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load Voice SMS"
        description="Could not fetch voice messages."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const handleBroadcast = () => {
    if (!selectedVoiceId) {
      toast.error('Select a voice message first');
      return;
    }
    toast.success('Voice broadcast queued for all active subscribers');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Voice SMS"
        subtitle="Broadcast pre-recorded voice alerts to broadband subscribers"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Communications' },
          { label: 'Voice SMS' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Mic className="h-4 w-4 text-primary" />
              Voice Message Library
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={messageColumns}
              data={data.messages}
              getRowId={(row) => row.id}
              searchKey="name"
              searchPlaceholder="Search voice messages..."
              searchFilterFn={messageSearchFilter}
              emptyTitle="No voice messages"
              emptyDescription="Upload voice clips via your gateway provider."
              enableColumnVisibility={false}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Radio className="h-4 w-4 text-primary" />
              New Broadcast
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Voice Gateway</Label>
              <Select value={selectedGateway} onValueChange={(v) => v && setSelectedGateway(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {data.gateways.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Voice Message</Label>
              <Select value={selectedVoiceId} onValueChange={(v) => v && setSelectedVoiceId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select message..." />
                </SelectTrigger>
                <SelectContent>
                  {data.messages.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Can menu="voice_sms" action="create">
              <Button className="w-full gap-2" onClick={handleBroadcast}>
                <Phone className="h-4 w-4" />
                Queue Broadcast
              </Button>
            </Can>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Broadcasts</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={broadcastColumns}
            data={data.broadcasts}
            getRowId={(row) => row.id}
            searchKey="voiceMsgName"
            searchPlaceholder="Search broadcasts..."
            searchFilterFn={broadcastSearchFilter}
            facetFilters={[{ columnId: 'status', title: 'Status' }]}
            emptyTitle="No broadcasts yet"
            enableColumnVisibility={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
