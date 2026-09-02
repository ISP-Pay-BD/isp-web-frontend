'use client';

import { PageHeader } from '@/features/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { WhatsAppNavLinks } from './WhatsAppInboxPage';
import { useWhatsApp } from '../hooks/use-whatsapp';

export function WhatsAppCampaignsPage() {
  const { data, isLoading, isError, refetch } = useWhatsApp();
  if (isLoading) return <PageSkeleton />;
  if (isError || !data) {
    return <EmptyState title="Failed to load campaigns" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="WhatsApp Campaigns" subtitle="Bulk template campaigns with delivery analytics" breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'WhatsApp' }, { label: 'Campaigns' }]} />
      <WhatsAppNavLinks />
      <Card>
        <CardHeader><CardTitle className="text-base">Campaign History</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Delivered</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.campaigns.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="font-mono text-xs">{c.templateName}</TableCell>
                  <TableCell>
                    <Badge variant={c.status === 'completed' ? 'default' : c.status === 'failed' ? 'destructive' : 'secondary'}>{c.status}</Badge>
                  </TableCell>
                  <TableCell className="font-mono">{c.sentCount}/{c.totalRecipients}</TableCell>
                  <TableCell className="font-mono text-emerald-600">{c.deliveredCount}</TableCell>
                  <TableCell className="text-xs">{new Date(c.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
