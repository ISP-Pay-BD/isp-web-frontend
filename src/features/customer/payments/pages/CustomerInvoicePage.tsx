'use client';

import type { ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { Printer } from 'lucide-react';
import { CustomerPageShell } from '@/features/customer/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCustomerInvoice } from '../hooks/use-customer-payments';
import { PaymentStatusBadge } from '../components/PaymentStatusBadge';
import type { InvoiceParty } from '@/lib/api/adapters/customer.adapter';
import { formatBdtWithSymbol, formatDate } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
import { cn } from '@/lib/utils';

function Party({ title, party }: { title: string; party: InvoiceParty }) {
  return (
    <div className="min-w-0 space-y-0.5 text-sm break-words">
      <div className="text-xs font-medium text-muted-foreground print:text-neutral-600">{title}</div>
      <div className="font-semibold">{party.name || '—'}</div>
      {party.mobile && <div className="text-muted-foreground print:text-neutral-700">{party.mobile}</div>}
      {party.email && <div className="text-muted-foreground print:text-neutral-700">{party.email}</div>}
      {party.address && <div className="text-muted-foreground print:text-neutral-700">{party.address}</div>}
    </div>
  );
}

function Row({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-baseline justify-between gap-4', className)}>
      <dt className="shrink-0 text-muted-foreground print:text-neutral-600">{label}</dt>
      <dd className="min-w-0 text-right break-words">{children}</dd>
    </div>
  );
}

/** GET /v1/customer/json/invoice-print?invoice_id=<payment id> — printable via the browser. */
export function CustomerInvoicePage() {
  const t = useTranslations();
  const params = useParams<{ id: string }>();
  const id = params.id ?? '';
  const { data, isLoading, isError, error, refetch } = useCustomerInvoice(id);

  const title = t('customer.invoice.title', 'Invoice');
  const breadcrumbs = [
    { label: t('customer.nav.home', 'Customer'), href: '/customer/dashboard' },
    { label: t('customer.nav.payments', 'Payments'), href: '/customer/payments' },
    { label: title },
  ];

  if (isLoading) return <PageSkeleton variant="detail" />;
  if (isError || !data) {
    return (
      <CustomerPageShell title={title} breadcrumbs={breadcrumbs}>
        <EmptyState
          variant="error"
          title={t('customer.invoice.unavailable', 'Invoice not available')}
          description={error?.message || t('customer.invoice.unavailableHint', 'Invoices exist only for settled payments.')}
          actionLabel={t('common.retry', 'Retry')}
          onAction={() => refetch()}
        />
      </CustomerPageShell>
    );
  }

  const { payment, customer, issuer } = data;
  const number = payment.invoice || `#${payment.id}`;

  return (
    <CustomerPageShell
      title={title}
      subtitle={
        payment.invoice
          ? t('customer.invoice.number', 'Invoice {number}', { number: payment.invoice })
          : t('customer.invoice.paymentNumber', 'Payment #{id}', { id: payment.id })
      }
      breadcrumbs={breadcrumbs}
      actions={
        <Button className="h-11 w-full gap-2 sm:h-9 sm:w-auto" onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          {t('customer.invoice.print', 'Print / Save PDF')}
        </Button>
      }
    >
      <div id="printable-invoice-voucher">
        <Card className="mx-auto max-w-2xl border-border/60 shadow-sm ring-1 ring-border/60 print:max-w-none print:bg-white print:text-black print:shadow-none print:ring-0">
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
            <CardTitle className="min-w-0 font-mono text-base break-all">{number}</CardTitle>
            <PaymentStatusBadge status={payment.status} />
          </CardHeader>
          <CardContent className="space-y-6 text-sm">
            <div className="grid gap-5 sm:grid-cols-2">
              {issuer && <Party title={t('customer.invoice.issuedBy', 'Issued by')} party={issuer} />}
              <Party title={t('customer.invoice.billedTo', 'Billed to')} party={customer} />
            </div>

            <dl className="space-y-3 rounded-lg border bg-muted/30 p-4 print:border-neutral-300 print:bg-transparent">
              {payment.month && <Row label={t('customer.invoice.billingMonth', 'Billing month')}>{payment.month}</Row>}
              <Row label={t('customer.invoice.date', 'Date')}>{formatDate(payment.paidAt)}</Row>
              {payment.method && (
                <Row label={t('customer.invoice.paidVia', 'Paid via')}>
                  <span className="capitalize">{payment.method}</span>
                </Row>
              )}
              {payment.trxId && (
                <Row label={t('customer.invoice.trxId', 'TrxID')}>
                  <span className="font-mono break-all">{payment.trxId}</span>
                </Row>
              )}
              {payment.paidTo && <Row label={t('customer.invoice.receivedBy', 'Received by')}>{payment.paidTo}</Row>}
              <Row label={t('customer.invoice.totalPaid', 'Total paid')} className="border-t border-border/60 pt-3 font-semibold print:border-neutral-300 [&>dt]:text-foreground print:[&>dt]:text-black">
                <span className="text-lg tabular-nums">{formatBdtWithSymbol(payment.amountBdt)}</span>
              </Row>
            </dl>

            {payment.comment && <p className="text-sm text-muted-foreground print:text-neutral-700">{payment.comment}</p>}
          </CardContent>
        </Card>
      </div>
    </CustomerPageShell>
  );
}
