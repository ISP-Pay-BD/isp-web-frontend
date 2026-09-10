'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Can } from '@/components/shared/Can';
import { DataTable } from '@/features/shared/data-table';
import { toast } from 'sonner';
import {
  Phone,
  Mic,
  Radio,
  Play,
  Pause,
  Upload,
  Clock,
  Volume2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
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
    msg.transcript.toLowerCase().includes(q) ||
    msg.providerId.toLowerCase().includes(q)
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
    b.status.toLowerCase().includes(q) ||
    (b.notes?.toLowerCase().includes(q) ?? false)
  );
};

export function VoiceSmsPage() {
  const { data, isLoading, isError, refetch } = useVoiceSms();
  const [selectedGateway, setSelectedGateway] = useState('mimsms_voice');
  const [selectedVoiceId, setSelectedVoiceId] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // New Voice Clip state
  const [newClip, setNewClip] = useState({
    name: '',
    duration: '30',
    transcript: '',
  });

  const messageColumns = useMemo<LegacyColumnDef<VoiceMessage, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Voice Audio Title',
        size: 220,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="icon"
              className={`h-8 w-8 rounded-full shrink-0 transition-all ${
                playingId === row.original.id
                  ? 'bg-primary text-primary-foreground border-primary animate-pulse'
                  : 'text-primary hover:bg-primary/10'
              }`}
              onClick={() => {
                if (playingId === row.original.id) {
                  setPlayingId(null);
                  toast.info('Audio paused');
                } else {
                  setPlayingId(row.original.id);
                  toast.success(`Playing preview: "${row.original.name}"`);
                }
              }}
            >
              {playingId === row.original.id ? (
                <Pause className="h-3.5 w-3.5" />
              ) : (
                <Play className="h-3.5 w-3.5 ml-0.5" />
              )}
            </Button>
            <div>
              <span className="font-semibold text-foreground text-xs block">{row.original.name}</span>
              <span className="text-[11px] font-mono text-muted-foreground">{row.original.providerId}</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'durationSeconds',
        header: 'Duration',
        size: 100,
        cell: ({ row }) => (
          <Badge variant="outline" className="font-mono text-[11px] gap-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            {row.original.durationSeconds}s
          </Badge>
        ),
      },
      {
        accessorKey: 'transcript',
        header: 'Audio Transcript Preview',
        size: 300,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground max-w-sm line-clamp-2 block leading-relaxed italic">
            "{row.original.transcript}"
          </span>
        ),
      },
      {
        accessorKey: 'addedOn',
        header: 'Added Date',
        size: 120,
        cell: ({ row }) => <span className="text-xs font-mono text-muted-foreground">{row.original.addedOn}</span>,
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Quick Send</span>,
        size: 130,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
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
            Select Clip
          </Button>
        ),
      },
    ],
    [playingId],
  );

  const broadcastColumns = useMemo<LegacyColumnDef<VoiceBroadcast, unknown>[]>(
    () => [
      {
        accessorKey: 'voiceMsgName',
        header: 'Audio Message',
        size: 220,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-primary shrink-0" />
            <span className="font-semibold text-foreground text-xs">{row.original.voiceMsgName}</span>
          </div>
        ),
      },
      {
        accessorKey: 'areaName',
        header: 'Target Area',
        size: 140,
        cell: ({ row }) => (
          <span className="text-xs font-medium text-foreground">{row.original.areaName}</span>
        ),
      },
      {
        accessorKey: 'recipientsCount',
        header: 'Subscribers',
        size: 120,
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-mono text-xs">
            {row.original.recipientsCount} calls
          </Badge>
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
              variant={
                s === 'completed'
                  ? 'default'
                  : s === 'failed'
                    ? 'destructive'
                    : 'secondary'
              }
              className={`text-[11px] capitalize ${s === 'completed' ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : ''}`}
            >
              {s}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'initiatedAt',
        header: 'Initiated At',
        size: 160,
        cell: ({ row }) => (
          <span className="text-xs font-mono text-muted-foreground">
            {new Date(row.original.initiatedAt).toLocaleString([], {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        ),
      },
      {
        accessorKey: 'notes',
        header: 'Broadcast Notes',
        size: 200,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground line-clamp-1">
            {row.original.notes ?? '—'}
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
        description="Could not fetch voice message library and gateway details."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const handleBroadcast = () => {
    if (!selectedVoiceId) {
      toast.error('Please select an audio message clip first');
      return;
    }
    const msg = data.messages.find((m) => m.id === selectedVoiceId);
    setIsBroadcasting(true);
    setTimeout(() => {
      setIsBroadcasting(false);
      toast.success(
        `Voice broadcast "${msg?.name}" queued for all active subscribers via ${selectedGateway.toUpperCase()}`
      );
    }, 600);
  };

  const handleUploadNewClip = () => {
    if (!newClip.name.trim() || !newClip.transcript.trim()) {
      toast.error('Please provide a clip title and transcript');
      return;
    }
    toast.success(`Voice audio clip "${newClip.name}" uploaded and registered to gateway`);
    setUploadModalOpen(false);
    setNewClip({ name: '', duration: '30', transcript: '' });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Voice SMS Broadcast"
        subtitle="Broadcast pre-recorded voice audio announcements and IVR alerts to broadband subscribers"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Communications' },
          { label: 'Voice SMS' },
        ]}
        actions={
          <Can menu="voice_sms" action="create">
            <Button onClick={() => setUploadModalOpen(true)} className="gap-1.5 bg-primary text-primary-foreground">
              <Upload className="h-4 w-4" />
              Upload Audio Clip
            </Button>
          </Can>
        }
      />

      <OpsSummaryStrip
        items={[
          { label: 'Active Voice Gateways', value: data.gateways.length },
          { label: 'Voice Clip Library', value: `${data.messages.length} Audio Files` },
          { label: 'Recent Broadcasts', value: data.broadcasts.length },
          { label: 'Broadcast Delivery Rate', value: '98.2%' },
          { label: 'Default Trunk', value: 'MIM Voice Gateway' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Audio Clip Library */}
        <Card className="lg:col-span-2 border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Mic className="h-4 w-4 text-primary" />
                  Voice Audio Message Library
                </CardTitle>
                <CardDescription>
                  Pre-recorded WAV/MP3 announcements synced with gateway IVR
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                8kHz / 16-bit PCM Mono
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={messageColumns}
              data={data.messages}
              getRowId={(row) => row.id}
              searchKey="name"
              searchPlaceholder="Search voice clips..."
              searchFilterFn={messageSearchFilter}
              emptyTitle="No voice messages"
              emptyDescription="Upload voice clips to initialize your IVR broadcast library."
              enableColumnVisibility={false}
            />
          </CardContent>
        </Card>

        {/* Right Col: Launch Voice Broadcast */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Radio className="h-4 w-4 text-primary" />
              Launch Voice Broadcast
            </CardTitle>
            <CardDescription>Initiate an automated voice blast to subscribers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Voice Trunk Gateway</Label>
              <Select value={selectedGateway} onValueChange={(v) => { if (v) setSelectedGateway(v); }}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {data.gateways.map((g) => (
                    <SelectItem key={g} value={g} className="text-xs uppercase font-mono">
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Select Audio Clip</Label>
              <Select value={selectedVoiceId} onValueChange={(v) => { if (v) setSelectedVoiceId(v); }}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Choose a clip from library..." />
                </SelectTrigger>
                <SelectContent>
                  {data.messages.map((m) => (
                    <SelectItem key={m.id} value={m.id} className="text-xs">
                      {m.name} ({m.durationSeconds}s)
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
                  <SelectItem value="all">All Service Areas (320 subscribers)</SelectItem>
                  <SelectItem value="uttara">Sector 3 - Uttara (120)</SelectItem>
                  <SelectItem value="mirpur">Section 10 - Mirpur (95)</SelectItem>
                  <SelectItem value="banani">Banani Block C (105)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-1.5">
              <div className="flex justify-between text-muted-foreground">
                <span>Estimated Calls:</span>
                <span className="font-semibold text-foreground font-mono">
                  {selectedArea === 'all' ? '320' : '100+'} subscribers
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Rate per Minute:</span>
                <span className="font-semibold text-foreground font-mono">৳0.90 / min</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Auto-Retry Unanswered:</span>
                <span className="text-emerald-500 font-medium">Up to 2 Retries</span>
              </div>
            </div>

            <Can menu="voice_sms" action="create">
              <Button
                className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleBroadcast}
                disabled={isBroadcasting}
              >
                <Phone className="h-4 w-4" />
                {isBroadcasting ? 'Scheduling...' : 'Queue Voice Broadcast'}
              </Button>
            </Can>
          </CardContent>
        </Card>
      </div>

      {/* Broadcast History Table */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Voice Broadcast Transmission History</CardTitle>
              <CardDescription>Live telemetry and delivery breakdown of automated voice calls</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={broadcastColumns}
            data={data.broadcasts}
            getRowId={(row) => row.id}
            searchKey="voiceMsgName"
            searchPlaceholder="Search broadcasts by message or area..."
            searchFilterFn={broadcastSearchFilter}
            facetFilters={[{ columnId: 'status', title: 'Status' }]}
            emptyTitle="No broadcasts yet"
            emptyDescription="Initiate your first voice broadcast above."
            enableColumnVisibility={false}
          />
        </CardContent>
      </Card>

      {/* Upload Audio Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Upload Voice Clip
            </DialogTitle>
            <DialogDescription>
              Upload a recorded .mp3 or .wav voice announcement to your gateway IVR
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Clip Name</Label>
              <Input
                value={newClip.name}
                onChange={(e) => setNewClip({ ...newClip, name: e.target.value })}
                placeholder="e.g. Festival Promotional Audio"
                className="text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Audio File (.wav / .mp3)</Label>
              <div className="border-2 border-dashed border-border/80 rounded-lg p-4 text-center space-y-2 hover:bg-muted/20 cursor-pointer transition-colors">
                <Mic className="h-8 w-8 text-primary mx-auto opacity-80" />
                <p className="text-xs text-muted-foreground font-medium">
                  Click to choose file or drag & drop here
                </p>
                <p className="text-[10px] text-muted-foreground">Supported format: WAV/MP3, max 10MB (Mono 8kHz/16kHz)</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Transcript Text</Label>
              <Textarea
                value={newClip.transcript}
                onChange={(e) => setNewClip({ ...newClip, transcript: e.target.value })}
                placeholder="Enter exact spoken script for audit and IVR logging..."
                className="h-20 text-xs font-mono resize-y"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadNewClip} className="gap-1.5 bg-primary text-primary-foreground">
              <CheckCircle2 className="h-4 w-4" />
              Upload & Register
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
