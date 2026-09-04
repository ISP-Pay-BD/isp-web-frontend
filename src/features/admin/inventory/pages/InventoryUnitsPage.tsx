'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { useInventory } from '../hooks/use-inventory';
import { PageSkeleton, EmptyState } from '@/components/shared';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function InventoryUnitsPage() {
  const { units, isLoading, isError, refetch } = useInventory();
  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError) return <EmptyState title="Failed to load units" actionLabel="Retry" onAction={() => refetch()} />;

  return (
    <div className="space-y-6">
      <PageHero>
        <h1 className="text-2xl font-bold tracking-tight">Inventory Units</h1>
        <p className="text-muted-foreground text-sm">Pcs, meters, drums, and packaging units for stock items.</p>
      </PageHero>
      <PageContent className="space-y-6">
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unit</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="font-mono text-xs">{u.shortCode}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{u.description ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    
      </PageContent>
    </div>
  );
}
