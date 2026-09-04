'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { useInventory } from '../hooks/use-inventory';
import { PageSkeleton, EmptyState } from '@/components/shared';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function InventoryLocationsPage() {
  const { locations, isLoading, isError, refetch } = useInventory();
  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError) return <EmptyState title="Failed to load locations" actionLabel="Retry" onAction={() => refetch()} />;

  return (
    <div className="space-y-6">
      <PageHero>
        <h1 className="text-2xl font-bold tracking-tight">Store Locations</h1>
        <p className="text-muted-foreground text-sm">Central NOC warehouse and POP sub-stores.</p>
      </PageHero>
      <PageContent className="space-y-6">
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Location</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.map((loc) => (
              <TableRow key={loc.id}>
                <TableCell className="font-medium">{loc.name}</TableCell>
                <TableCell className="font-mono text-xs">{loc.code}</TableCell>
                <TableCell>{loc.managerName}</TableCell>
                <TableCell className="font-mono text-xs">{loc.phone}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{loc.address}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    
      </PageContent>
    </div>
  );
}
