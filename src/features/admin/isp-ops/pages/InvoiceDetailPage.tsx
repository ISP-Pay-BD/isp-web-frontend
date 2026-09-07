'use client';

import { useParams } from 'next/navigation';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useIspOps } from '../hooks/use-isp-ops';

export function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useIspOps();

  if (isLoading) return <PageSkeleton variant="dashboard" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load invoice" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const inv = data.invoices.find((i) => i.id === params.id) ?? data.invoices[0];
  if (!inv) return <EmptyState title="Invoice not found" />;

  const total = inv.amountBdt + inv.taxBdt;
  const lines = [
    { label: inv.period + ' package', amount: inv.amountBdt },
    { label: 'VAT / tax', amount: inv.taxBdt },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={inv.number}
        subtitle={`${inv.customerName} · ${inv.period}`}
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Invoices', url: '/admin/invoices' },
          { label: inv.number },
        ]}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => toast.success('Invoice emailed (mock)')}>
              Send
            </Button>
            <Button size="sm" variant="outline" onClick={() => toast.success('Invoice PDF downloaded (mock)')}>
              Download PDF
            </Button>
          </div>
        }
      />

      <Card className="max-w-xl border-border/60 shadow-sm ring-1 ring-foreground/5">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Invoice summary</CardTitle>
          <Badge variant="outline" className="capitalize">
            {inv.status}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {lines.map((line) => (
            <div key={line.label} className="flex justify-between">
              <span className="text-muted-foreground">{line.label}</span>
              <span className="tabular-nums font-medium">{line.amount.toLocaleString()} ৳</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-border/60 pt-3 text-base font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{total.toLocaleString()} ৳</span>
          </div>
          <p className="text-xs text-muted-foreground">Due {inv.dueDate}</p>
        </CardContent>
      </Card>
    </div>
  );
}
