'use client';

import { PageHeader } from '@/features/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { WhatsAppNavLinks } from './WhatsAppInboxPage';
import { useWhatsApp } from '../hooks/use-whatsapp';

export function WhatsAppMessageLogPage() {
  const { data, isLoading, isError, refetch } = useWhatsApp();
  if (isLoading) return <PageSkeleton />;
  if (isError || !data) {
    return <EmptyState title="Failed to load message log" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="WhatsApp Message Log" subtitle="Delivery audit trail for inbound and outbound messages" breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'WhatsApp' }, { label: 'Message Log' }]} />
      <WhatsAppNavLinks />
      <Card>
        <CardHeader><CardTitle className="text-base">Message Log ({data.logs.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phone</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">{log.phone}</TableCell>
                  <TableCell><Badge variant="outline">{log.direction}</Badge></TableCell>
                  <TableCell>{log.category}</TableCell>
                  <TableCell className="font-mono text-xs">{log.templateName ?? '—'}</TableCell>
                  <TableCell className="uppercase text-xs">{log.provider}</TableCell>
                  <TableCell>
                    <Badge variant={log.status === 'failed' ? 'destructive' : log.status === 'read' ? 'default' : 'secondary'}>{log.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">{new Date(log.sentAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
