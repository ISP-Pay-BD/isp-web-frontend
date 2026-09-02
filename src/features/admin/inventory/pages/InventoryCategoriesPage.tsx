'use client';

import { useInventory } from '../hooks/use-inventory';
import { PageSkeleton, EmptyState } from '@/components/shared';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function InventoryCategoriesPage() {
  const { categories, isLoading, isError, refetch } = useInventory();
  if (isLoading) return <PageSkeleton rows={6} />;
  if (isError) return <EmptyState title="Failed to load categories" actionLabel="Retry" onAction={() => refetch()} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inventory Categories</h1>
        <p className="text-muted-foreground text-sm">ONU, fiber, passive accessories, and power equipment groups.</p>
      </div>
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Items</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="font-medium">{cat.name}</TableCell>
                <TableCell className="font-mono text-xs">{cat.code}</TableCell>
                <TableCell>{cat.itemCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
