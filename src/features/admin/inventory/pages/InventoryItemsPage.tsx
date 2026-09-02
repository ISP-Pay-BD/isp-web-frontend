'use client';

import { useInventory } from '../hooks/use-inventory';
import { PageSkeleton, EmptyState, CurrencyDisplay, StatusBadge } from '@/components/shared';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function InventoryItemsPage() {
  const { items, isLoading, isError, refetch } = useInventory();
  if (isLoading) return <PageSkeleton rows={8} />;
  if (isError) return <EmptyState title="Failed to load items" actionLabel="Retry" onAction={() => refetch()} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inventory Items</h1>
        <p className="text-muted-foreground text-sm">SKU catalog — ONU, SFP, patch cords, splitters, and batteries.</p>
      </div>
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Min Alert</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-xs">{item.code}</TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-sm">{item.categoryName}</TableCell>
                <TableCell>{item.unitName}</TableCell>
                <TableCell><CurrencyDisplay amount={item.unitPriceBdt} /></TableCell>
                <TableCell>{item.minStockAlert}</TableCell>
                <TableCell><StatusBadge status={item.status === 'active' ? 'active' : 'inactive'} label={item.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
