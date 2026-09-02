'use client';

import { PageHeader } from '@/features/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { WhatsAppNavLinks } from './WhatsAppInboxPage';
import { useWhatsApp } from '../hooks/use-whatsapp';

export function WhatsAppTemplatesPage() {
  const { data, isLoading, isError, refetch } = useWhatsApp();
  if (isLoading) return <PageSkeleton />;
  if (isError || !data) {
    return <EmptyState title="Failed to load templates" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="WhatsApp Templates" subtitle="Meta-approved message templates for utility, auth, and marketing" breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'WhatsApp' }, { label: 'Templates' }]} />
      <WhatsAppNavLinks />
      <Card>
        <CardHeader><CardTitle className="text-base">Template Registry ({data.templates.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Body</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.templates.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs">{t.name}</TableCell>
                  <TableCell><Badge variant="outline">{t.category}</Badge></TableCell>
                  <TableCell className="uppercase text-xs">{t.language}</TableCell>
                  <TableCell>
                    <Badge variant={t.status === 'APPROVED' ? 'default' : t.status === 'REJECTED' ? 'destructive' : 'secondary'}>{t.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-sm line-clamp-2">{t.body}</TableCell>
                  <TableCell className="text-xs">{t.lastUpdated}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
