'use client';

import { usePurchase } from '../hooks/use-purchase';
import { PageSkeleton, EmptyState, CurrencyDisplay, StatusBadge } from '@/components/shared';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function PurchaseBillsPage() {
  const { bills, isLoading, isError, refetch } = usePurchase();

  if (isLoading) return <PageSkeleton rows={8} />;
  if (isError) {
    return <EmptyState title="Failed to load purchase bills" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Purchase Bills</h1>
        <p className="text-muted-foreground text-sm">Vendor invoices, partial payments, and outstanding payables.</p>
      </div>
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bill #</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Bill Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell className="font-mono text-xs">{bill.billNumber}</TableCell>
                <TableCell>{bill.vendorName}</TableCell>
                <TableCell className="font-mono text-xs">{bill.billDate}</TableCell>
                <TableCell className="font-mono text-xs">{bill.dueDate}</TableCell>
                <TableCell><CurrencyDisplay amount={bill.amountBdt} /></TableCell>
                <TableCell><CurrencyDisplay amount={bill.paidAmountBdt} className="text-emerald-600 dark:text-emerald-400" /></TableCell>
                <TableCell><CurrencyDisplay amount={bill.dueAmountBdt} className="text-red-600 dark:text-red-400" /></TableCell>
                <TableCell>
                  <StatusBadge
                    status={bill.status === 'paid' ? 'active' : bill.status === 'partial' ? 'pending' : 'expired'}
                    label={bill.status}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
