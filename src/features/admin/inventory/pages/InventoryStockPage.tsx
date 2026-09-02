'use client';

import { useInventory } from '../hooks/use-inventory';
import { PageSkeleton, EmptyState, CurrencyDisplay, StatusBadge } from '@/components/shared';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function InventoryStockPage() {
  const { stock, isLoading, isError, refetch } = useInventory();
  if (isLoading) return <PageSkeleton rows={8} />;
  if (isError) return <EmptyState title="Failed to load stock" actionLabel="Retry" onAction={() => refetch()} />;

  const statusMap: Record<string, 'active' | 'pending' | 'expired'> = {
    in_stock: 'active',
    low_stock: 'pending',
    out_of_stock: 'expired',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Stock Levels</h1>
        <p className="text-muted-foreground text-sm">On-hand quantity and value by warehouse location.</p>
      </div>
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Total Value</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stock.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <div className="font-medium">{row.itemName}</div>
                  <div className="text-muted-foreground font-mono text-xs">{row.itemCode}</div>
                </TableCell>
                <TableCell>{row.locationName}</TableCell>
                <TableCell className="font-semibold">{row.quantity}</TableCell>
                <TableCell>{row.unitName}</TableCell>
                <TableCell><CurrencyDisplay amount={row.totalValueBdt} /></TableCell>
                <TableCell>
                  <StatusBadge status={statusMap[row.status] ?? 'pending'} label={row.status.replace(/_/g, ' ')} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
