'use client';

import { useState } from 'react';
import { PageHeader } from '@/features/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Can } from '@/components/shared/Can';
import { toast } from 'sonner';
import { Phone, Mic, Radio, Play } from 'lucide-react';
import { useVoiceSms } from '../hooks/use-voice-sms';

export function VoiceSmsPage() {
  const { data, isLoading, isError, refetch } = useVoiceSms();
  const [selectedGateway, setSelectedGateway] = useState('mimsms_voice');
  const [selectedVoiceId, setSelectedVoiceId] = useState('');

  if (isLoading) return <PageSkeleton />;
  if (isError || !data) {
    return (
      <EmptyState title="Failed to load Voice SMS" description="Could not fetch voice messages." actionLabel="Retry" onAction={() => refetch()} />
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
            <CardDescription>Pre-recorded IVR messages registered with your voice gateway</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {data.messages.length === 0 ? (
              <EmptyState title="No voice messages" description="Upload voice clips via your gateway provider." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Transcript</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.messages.map((msg) => (
                    <TableRow key={msg.id}>
                      <TableCell className="font-medium">{msg.name}</TableCell>
                      <TableCell className="font-mono text-xs">{msg.durationSeconds}s</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs line-clamp-2">{msg.transcript}</TableCell>
                      <TableCell className="text-xs">{msg.addedOn}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info('Playing sample audio (mock)')}>
                          <Play className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
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
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {data.gateways.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Voice Message</Label>
              <Select value={selectedVoiceId} onValueChange={(v) => v && setSelectedVoiceId(v)}>
                <SelectTrigger><SelectValue placeholder="Select message..." /></SelectTrigger>
                <SelectContent>
                  {data.messages.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
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
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Message</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Initiated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.broadcasts.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.voiceMsgName}</TableCell>
                  <TableCell>{b.areaName}</TableCell>
                  <TableCell className="font-mono">{b.recipientsCount}</TableCell>
                  <TableCell>
                    <Badge variant={b.status === 'completed' ? 'default' : b.status === 'failed' ? 'destructive' : 'secondary'}>
                      {b.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(b.initiatedAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
