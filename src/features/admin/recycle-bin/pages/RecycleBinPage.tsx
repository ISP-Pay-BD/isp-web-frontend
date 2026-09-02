'use client';

import { useState } from 'react';
import { PageHeader } from '@/features/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Can } from '@/components/shared/Can';
import { toast } from 'sonner';
import { RotateCcw, Trash2 } from 'lucide-react';
import type { RecycleBinItem } from '@/data/admin/recycle-bin.data';
import { useRecycleBin } from '../hooks/use-recycle-bin';

export function RecycleBinPage() {
  const { data, isLoading, isError, refetch } = useRecycleBin();
  const [typeFilter, setTypeFilter] = useState('all');
  const [items, setItems] = useState<RecycleBinItem[]>([]);
  const [confirmAction, setConfirmAction] = useState<{ type: 'restore' | 'delete'; item: RecycleBinItem } | null>(null);

  const list = items.length > 0 ? items : data?.items ?? [];
  const filtered = typeFilter === 'all' ? list : list.filter((i) => i.entityType === typeFilter);

  if (isLoading) return <PageSkeleton />;
  if (isError || !data) {
    return <EmptyState title="Failed to load recycle bin" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const handleRestore = (item: RecycleBinItem) => {
    setItems(list.filter((i) => i.id !== item.id));
    toast.success(`${item.title} restored successfully`);
    setConfirmAction(null);
  };

  const handleDeleteForever = (item: RecycleBinItem) => {
    setItems(list.filter((i) => i.id !== item.id));
    toast.success(`${item.title} permanently deleted`);
    setConfirmAction(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recycle Bin"
        subtitle="Restore or permanently delete soft-deleted records"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Recycle Bin' }]}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Deleted Items ({filtered.length})</CardTitle>
          <Select value={typeFilter} onValueChange={(v) => v && setTypeFilter(v)}>
            <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="customer">Customers</SelectItem>
              <SelectItem value="package">Packages</SelectItem>
              <SelectItem value="invoice">Invoices</SelectItem>
              <SelectItem value="ticket">Tickets</SelectItem>
              <SelectItem value="employee">Employees</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <EmptyState title="Recycle bin is empty" description="No deleted items to restore." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Identifier</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Deleted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell><Badge variant="outline" className="capitalize">{item.entityType}</Badge></TableCell>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell className="font-mono text-xs">{item.identifier}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate">{item.details}</TableCell>
                    <TableCell className="text-xs">{item.deletedAt}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Can menu="recycle_bin" action="restore">
                          <Button variant="ghost" size="sm" onClick={() => setConfirmAction({ type: 'restore', item })}>
                            <RotateCcw className="h-4 w-4 mr-1" />Restore
                          </Button>
                        </Can>
                        <Can menu="recycle_bin" action="delete_forever">
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setConfirmAction({ type: 'delete', item })}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </Can>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={Boolean(confirmAction)}
        onOpenChange={() => setConfirmAction(null)}
        title={confirmAction?.type === 'restore' ? 'Restore item?' : 'Delete permanently?'}
        description={
          confirmAction?.type === 'restore'
            ? `Restore "${confirmAction.item.title}" to the system?`
            : `Permanently delete "${confirmAction?.item.title}"? This cannot be undone.`
        }
        confirmLabel={confirmAction?.type === 'restore' ? 'Restore' : 'Delete Forever'}
        destructive={confirmAction?.type === 'delete'}
        onConfirm={() => {
          if (!confirmAction) return;
          if (confirmAction.type === 'restore') handleRestore(confirmAction.item);
          else handleDeleteForever(confirmAction.item);
        }}
      />
    </div>
  );
}
