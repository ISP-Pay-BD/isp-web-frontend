'use client';

import { useParams } from 'next/navigation';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useCustomerInvoicePreview } from '../hooks/use-customer-billing-extras';

export function CustomerInvoicePage() {
  const params = useParams<{ id: string }>();
  const id = params.id ?? 'pay_101';
  const { data, isLoading, isError, refetch } = useCustomerInvoicePreview();

  if (isLoading) return <PageSkeleton variant="dashboard" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load invoice" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const inv = data as {
    id: string;
    invoiceNo: string;
    packageName: string;
    period: string;
    subtotalBdt: number;
    taxBdt: number;
    totalBdt: number;
    status: string;
    paidAt: string;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoice PDF"
        subtitle={`Payment ${id}`}
        breadcrumb={[
          { label: 'Dashboard', url: '/customer/dashboard' },
          { label: 'Payments', url: '/customer/payments' },
          { label: 'Invoice' },
        ]}
        actions={
          <Button size="sm" onClick={() => toast.success('Invoice PDF downloaded (mock)')}>
            Download PDF
          </Button>
        }
      />
      <Card className="max-w-lg border-border/60 shadow-sm ring-1 ring-foreground/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="font-mono text-base">{inv.invoiceNo}</CardTitle>
          <Badge variant="outline" className="capitalize">
            {inv.status}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Package</span>
            <span>{inv.packageName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Period</span>
            <span>{inv.period}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular-nums">{inv.subtotalBdt.toLocaleString()} ৳</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">VAT</span>
            <span className="tabular-nums">{inv.taxBdt.toLocaleString()} ৳</span>
          </div>
          <div className="flex justify-between border-t border-border/60 pt-2 font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{inv.totalBdt.toLocaleString()} ৳</span>
          </div>
          <p className="text-xs text-muted-foreground">Paid {inv.paidAt}</p>
        </CardContent>
      </Card>
    </div>
  );
}
