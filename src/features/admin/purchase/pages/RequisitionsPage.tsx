'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { usePurchase } from '../hooks/use-purchase';
import { PageSkeleton, EmptyState, CurrencyDisplay, StatusBadge } from '@/components/shared';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function RequisitionsPage() {
  const { requisitions, isLoading, isError, refetch } = usePurchase();

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;
  if (isError) {
    return <EmptyState title="Failed to load requisitions" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHero>
        <h1 className="text-2xl font-bold tracking-tight">Purchase Requisitions</h1>
        <p className="text-muted-foreground text-sm">Internal procurement requests for ONU, fiber, and NOC equipment.</p>
      </PageHero>
      <PageContent className="space-y-6">
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Req ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requisitions.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="font-mono text-xs">{req.requisitionId}</TableCell>
                <TableCell className="max-w-xs font-medium">{req.title}</TableCell>
                <TableCell>{req.itemCount}</TableCell>
                <TableCell><CurrencyDisplay amount={req.totalAmountBdt} /></TableCell>
                <TableCell className="text-sm">{req.requisitionBy}</TableCell>
                <TableCell className="font-mono text-xs">{req.deadline}</TableCell>
                <TableCell>
                  <StatusBadge
                    status={req.status === 'approved' || req.status === 'completed' ? 'active' : req.status === 'rejected' ? 'expired' : 'pending'}
                    label={req.status}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    
      </PageContent>
    </div>
  );
}
