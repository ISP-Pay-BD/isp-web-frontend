'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Printer, Send, CheckCircle2, Copy, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Can } from '@/components/shared/Can';
import { Button } from '@/components/ui/button';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { usePaymentReceipt, useSendPaymentSms } from '@/features/admin/customer-payments/hooks/use-customer-payments';
import { PaymentReceiptA4 } from '@/features/admin/customer-payments/components/PaymentReceiptA4';
import { SettlePaymentDialog, type SettleTarget } from '@/features/admin/customer-payments/components/SettlePaymentDialog';
import { receiptSmsText } from '@/features/admin/customer-payments/lib/mappers';

/** One customer invoice (= payments row) rendered from the receipt endpoint. */
export function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: inv, isLoading, isError, error, refetch } = usePaymentReceipt(params?.id);
  const sendSms = useSendPaymentSms();
  const [settle, setSettle] = useState<SettleTarget | null>(null);

  if (isLoading) return <PageSkeleton variant="dashboard" />;
  if (isError || !inv) {
    return (
      <EmptyState
        title="Invoice not available"
        description={isError ? errorMessage(error) : 'This invoice does not exist.'}
        actionLabel={isError ? 'Retry' : 'Back to Invoices'}
        onAction={() => (isError ? refetch() : router.push('/admin/invoices'))}
      />
    );
  }

  const copy = () =>
    navigator.clipboard
      .writeText(inv.invoiceNo)
      .then(() => toast.success('Invoice number copied'))
      .catch(() => toast.error('Clipboard is not available'));

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/invoices" className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-border/70 hover:bg-accent">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground font-mono">{inv.invoiceNo}</h1>
              <button type="button" onClick={copy} className="text-muted-foreground hover:text-primary" title="Copy">
                <Copy className="h-3.5 w-3.5" />
              </button>
              <StatusBadge status={inv.status === 'completed' ? 'paid' : inv.status} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Billing month: <span className="font-semibold text-foreground">{inv.billingMonth || '—'}</span>
              {inv.customer ? (
                <>
                  {' '}· Customer: <span className="font-semibold text-foreground">{inv.customer.name}</span>
                </>
              ) : null}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/admin/customer-payments/${inv.id}/pos`}>
            <Button variant="outline" size="sm" className="text-xs h-8">
              <Receipt className="mr-1.5 h-3.5 w-3.5" /> POS slip
            </Button>
          </Link>
          {inv.customer ? (
            <Can menu="sms_message" action="create">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                disabled={sendSms.isPending}
                onClick={() => sendSms.mutate({ customerId: inv.customer!.id, content: receiptSmsText(inv) })}
              >
                <Send className="mr-1.5 h-3.5 w-3.5" /> Send SMS
              </Button>
            </Can>
          ) : null}
          {inv.status === 'pending' && inv.userType === 'user' ? (
            <Can menu="customer_payment" action="update">
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-8 text-emerald-600"
                onClick={() =>
                  setSettle({
                    id: inv.id,
                    invoiceNo: inv.invoiceNo,
                    amountBdt: inv.amountBdt,
                    billingMonth: inv.billingMonth,
                    customerName: inv.customer?.name ?? '',
                  })
                }
              >
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Record payment
              </Button>
            </Can>
          ) : null}
          <Button size="sm" className="text-xs h-8" onClick={() => window.print()}>
            <Printer className="mr-1.5 h-3.5 w-3.5" /> Print / Save PDF
          </Button>
        </div>
      </div>

      <PaymentReceiptA4 receipt={inv} onScreen />

      <SettlePaymentDialog target={settle} onClose={() => setSettle(null)} />
    </div>
  );
}
