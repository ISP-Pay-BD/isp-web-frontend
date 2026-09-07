'use client';

import { useParams } from 'next/navigation';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useIspOps } from '../hooks/use-isp-ops';

export function PosReceiptPage() {
  const params = useParams<{ id: string }>();
  const paymentId = params.id ?? 'pay_101';
  const { data, isLoading, isError, refetch } = useIspOps();

  if (isLoading) return <PageSkeleton variant="dashboard" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load receipt" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const receipt =
    data.posReceipts.find((r) => r.paymentId === paymentId || r.id === paymentId) ?? data.posReceipts[0];

  if (!receipt) {
    return <EmptyState title="Receipt not found" description="No POS slip for this payment id." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="POS thermal receipt"
        subtitle={`Payment ${receipt.paymentId}`}
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Customer payments', url: '/admin/customer-payments' },
          { label: 'POS' },
        ]}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => toast.success('Receipt copied (mock)')}>
              Copy
            </Button>
            <Button size="sm" onClick={() => toast.success('Sent to thermal printer (mock)')}>
              Print
            </Button>
          </div>
        }
      />

      <Card className="mx-auto max-w-xs border-border/60 font-mono text-xs shadow-sm ring-1 ring-foreground/5">
        <CardContent className="space-y-2 py-6 text-center">
          <div className="text-sm font-bold tracking-wide">ISP PAY BD</div>
          <div className="text-muted-foreground">{receipt.branch}</div>
          <div className="my-2 space-y-1 border-y border-dashed border-border/80 py-2 text-left">
            <div className="flex justify-between">
              <span>Receipt</span>
              <span>{receipt.paymentId}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span>Customer</span>
              <span className="truncate text-right">{receipt.customerName}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span>Package</span>
              <span className="truncate text-right">{receipt.packageName}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Paid</span>
              <span className="tabular-nums">{receipt.amountBdt.toLocaleString('en-BD', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span>Method</span>
              <span className="uppercase">{receipt.method}</span>
            </div>
            <div className="flex justify-between">
              <span>When</span>
              <span>{receipt.paidAt}</span>
            </div>
            <div className="flex justify-between">
              <span>Collector</span>
              <span>{receipt.collector}</span>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">Thank you · Keep this slip</p>
        </CardContent>
      </Card>
    </div>
  );
}
