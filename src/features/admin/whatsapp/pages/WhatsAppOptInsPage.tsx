'use client';

import { PageHeader } from '@/features/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { toast } from 'sonner';
import { WhatsAppNavLinks } from './WhatsAppInboxPage';
import { useWhatsApp } from '../hooks/use-whatsapp';

export function WhatsAppOptInsPage() {
  const { data, isLoading, isError, refetch } = useWhatsApp();
  if (isLoading) return <PageSkeleton />;
  if (isError || !data) {
    return <EmptyState title="Failed to load opt-ins" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="WhatsApp Opt-ins" subtitle="Marketing consent registry for WhatsApp Business API" breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'WhatsApp' }, { label: 'Opt-ins' }]} />
      <WhatsAppNavLinks />
      <Card>
        <CardHeader><CardTitle className="text-base">Customer Opt-in Registry</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Opt-in Date</TableHead>
                <TableHead>Marketing</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.optIns.map((opt) => (
                <TableRow key={opt.id}>
                  <TableCell className="font-medium">{opt.customerName}</TableCell>
                  <TableCell className="font-mono text-xs">{opt.phone}</TableCell>
                  <TableCell className="text-xs">{opt.optInDate}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={opt.optedIn}
                        onCheckedChange={() => toast.success(`Opt-in updated for ${opt.customerName}`)}
                      />
                      <Badge variant={opt.optedIn ? 'default' : 'secondary'}>{opt.optedIn ? 'Opted in' : 'Opted out'}</Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
