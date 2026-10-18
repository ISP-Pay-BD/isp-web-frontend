'use client';

import { useParams } from 'next/navigation';
import { Printer } from 'lucide-react';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCustomerInvoice } from '../hooks/use-customer-payments';
import type { InvoiceParty } from '@/lib/api/adapters/customer.adapter';
import { formatBdtWithSymbol, formatDate } from '@/lib/format';

function Party({ title, party }: { title: string; party: InvoiceParty }) {
  return (
    <div className="space-y-0.5 text-sm">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="font-semibold">{party.name || '—'}</div>
      {party.mobile && <div className="text-muted-foreground">{party.mobile}</div>}
      {party.email && <div className="text-muted-foreground">{party.email}</div>}
      {party.address && <div className="text-muted-foreground">{party.address}</div>}
    </div>
  );
}

/** GET /v1/customer/json/invoice-print?invoice_id=<payment id> — printable via the browser. */
export function CustomerInvoicePage() {
  const params = useParams<{ id: string }>();
  const id = params.id ?? '';
  const { data, isLoading, isError, error, refetch } = useCustomerInvoice(id);

  if (isLoading) return <PageSkeleton variant="detail" />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Invoice not available"
        description={error?.message || 'Invoices exist only for settled payments.'}
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const { payment, customer, issuer } = data;

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <PageHeader
          title="Invoice"
          subtitle={payment.invoice ? `Invoice ${payment.invoice}` : `Payment #${payment.id}`}
          breadcrumb={[
            { label: 'Dashboard', url: '/customer/dashboard' },
            { label: 'Payments', url: '/customer/payments' },
            { label: 'Invoice' },
          ]}
          actions={
            <Button size="sm" className="gap-1.5" onClick={() => window.print()}>
              <Printer className="h-3.5 w-3.5" />
              Print / Save PDF
            </Button>
          }
        />
      </div>
      <Card className="max-w-2xl border-border/60 shadow-sm ring-1 ring-border/60 print:shadow-none print:ring-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="font-mono text-base">{payment.invoice || `#${payment.id}`}</CardTitle>
          <Badge variant="outline">Paid</Badge>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            {issuer && <Party title="Issued by" party={issuer} />}
            <Party title="Billed to" party={customer} />
          </div>

          <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
            {payment.month && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Billing month</span>
                <span>{payment.month}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span>{formatDate(payment.paidAt)}</span>
            </div>
            {payment.method && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid via</span>
                <span className="capitalize">{payment.method}</span>
              </div>
            )}
            {payment.trxId && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">TrxID</span>
                <span className="font-mono">{payment.trxId}</span>
              </div>
            )}
            {payment.paidTo && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Received by</span>
                <span>{payment.paidTo}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border/60 pt-2 font-semibold">
              <span>Total paid</span>
              <span className="tabular-nums">{formatBdtWithSymbol(payment.amountBdt)}</span>
            </div>
          </div>

          {payment.comment && <p className="text-xs text-muted-foreground">{payment.comment}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
