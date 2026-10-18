'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Can } from '@/components/shared/Can';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Printer, Copy, Send, ArrowLeft, Receipt, Sliders } from 'lucide-react';
import { usePaymentReceipt, useSendPaymentSms } from '@/features/admin/customer-payments/hooks/use-customer-payments';
import { receiptSmsText } from '@/features/admin/customer-payments/lib/mappers';
import type { PaymentReceipt } from '@/features/admin/customer-payments/types';
import { formatDateTime, formatBdtWithSymbol } from '@/lib/format';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useLocale, useTranslations } from '@/i18n/locale-context';
import { ledgerStatusLabel, paymentMethodLabel } from '@/features/admin/customer-payments/lib/labels';

type Translate = ReturnType<typeof useTranslations>;

function statusLine(t: Translate, status: PaymentReceipt['status']): string {
  switch (status) {
    case 'completed':
      return t('admin.ops.posReceipt.statusLine.completed', '[ PAYMENT RECEIVED ]');
    case 'pending':
      return t('admin.ops.posReceipt.statusLine.pending', '[ PAYMENT PENDING ]');
    default:
      return t('admin.ops.posReceipt.statusLine.failed', '[ PAYMENT FAILED ]');
  }
}

function escPosText(t: Translate, r: PaymentReceipt, withSupport: boolean): string {
  const line = '========================================';
  const dash = '----------------------------------------';
  const center = (s: string) => {
    const pad = Math.max(0, Math.floor((40 - s.length) / 2));
    return ' '.repeat(pad) + s;
  };
  const row = (k: string, v: string) => `${k.padEnd(11)}: ${v}`;
  const out = [line];
  if (r.issuer.name) out.push(center(r.issuer.name.toUpperCase()));
  if (withSupport && r.issuer.phone) out.push(center(`${t('admin.customerPayments.receipt.tel', 'Tel')}: ${r.issuer.phone}`));
  if (withSupport && r.issuer.address) out.push(center(r.issuer.address));
  out.push(
    line,
    row(t('admin.ops.posReceipt.receiptNo', 'Receipt No'), r.invoiceNo),
    row(t('admin.customerPayments.receipt.date', 'Date'), formatDateTime(r.paidAt ?? r.createdAt ?? '')),
  );
  if (r.collector) out.push(row(t('admin.ops.posReceipt.collector', 'Collector'), r.collector));
  out.push(dash, row(t('admin.ops.posReceipt.customer', 'Customer'), r.customer?.name || '—'));
  if (r.customer?.packageName) out.push(row(t('admin.customers.list.colPackage', 'Package'), r.customer.packageName));
  if (r.billingMonth) out.push(row(t('admin.ops.posReceipt.month', 'Month'), r.billingMonth));
  out.push(row(t('admin.customerPayments.receipt.method', 'Method'), paymentMethodLabel(t, r)));
  if (r.trxId) out.push(row('TrxID', r.trxId));
  out.push(
    dash,
    row(t('admin.ops.posReceipt.total', 'Total').toUpperCase(), `BDT ${r.amountBdt.toFixed(2)}`),
    row(t('admin.customerPayments.receipt.status', 'Status'), ledgerStatusLabel(t, r.status).toUpperCase()),
    line,
  );
  return out.join('\n');
}

export function PosReceiptPage() {
  const t = useTranslations();
  const { locale } = useLocale();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const paymentId = params?.id ?? '';
  const { data: receipt, isLoading, isError, error, refetch } = usePaymentReceipt(paymentId);
  const sendSms = useSendPaymentSms();

  const [paperWidth, setPaperWidth] = useState<'80mm' | '58mm'>('80mm');
  const [paperTheme, setPaperTheme] = useState<'paper' | 'dark'>('paper');
  const [includeSupport, setIncludeSupport] = useState(true);

  if (isLoading) return <PageSkeleton variant="dashboard" />;
  if (isError || !receipt) {
    return (
      <EmptyState
        title={t('admin.ops.posReceipt.unavailable', 'Receipt not available')}
        description={isError ? errorMessage(error) : t('admin.ops.posReceipt.notFound', 'No payment found for this receipt.')}
        actionLabel={isError ? t('admin.customers.list.retry', 'Retry') : t('admin.ops.posReceipt.backToPayments', 'Back to Customer Payments')}
        onAction={() => (isError ? refetch() : router.push('/admin/customer-payments'))}
      />
    );
  }

  const paidOn = formatDateTime(receipt.paidAt ?? receipt.createdAt ?? '');

  const handleCopyRaw = () => {
    navigator.clipboard
      .writeText(escPosText(t, receipt, includeSupport))
      .then(() => toast.success(t('admin.ops.posReceipt.copied', 'Receipt text copied')))
      .catch(() => toast.error(t('admin.ops.posReceipt.clipboardUnavailable', 'Clipboard is not available')));
  };

  return (
    <div className="space-y-6">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #thermal-pos-slip, #thermal-pos-slip * {
            visibility: visible;
          }
          #thermal-pos-slip {
            position: fixed;
            left: 0;
            top: 0;
            width: ${paperWidth === '80mm' ? '80mm' : '58mm'};
            margin: 0;
            padding: 4mm;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      <PageHeader
        title={t('admin.ops.posReceipt.title', 'POS Thermal Receipt')}
        subtitle={t('admin.ops.posReceipt.subtitle', 'Receipt slip for invoice {invoice}', { invoice: receipt.invoiceNo })}
        breadcrumb={[
          { label: t('nav.dashboard', 'Dashboard'), url: '/admin/dashboard' },
          { label: t('nav.customers-payments', 'Customer Payments'), url: '/admin/customer-payments' },
          { label: t('admin.ops.posReceipt.crumb', 'POS Receipt') },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs border-border/70" render={<Link href="/admin/customer-payments" />}>
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> {t('admin.ops.posReceipt.backToLedger', 'Back to Ledger')}
              </Button>
            <Button variant="outline" size="sm" onClick={handleCopyRaw} className="text-xs border-border/70 hover:border-primary/50 text-foreground">
              <Copy className="mr-1.5 h-3.5 w-3.5 text-primary" />
              {t('admin.ops.posReceipt.copyText', 'Copy text')}
            </Button>
            <Button size="sm" onClick={() => window.print()} className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs shadow-md shadow-primary/25 font-semibold">
              <Printer className="mr-1.5 h-3.5 w-3.5" />
              {t('admin.ops.posReceipt.printReceipt', 'Print Receipt')}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-5">
          <Card className="border-border/70 bg-card/60 backdrop-blur-md">
            <CardHeader className="border-b border-border/50 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-primary" />
                  {t('admin.ops.posReceipt.summaryTitle', 'Transaction Summary')}
                </CardTitle>
                <Badge variant="outline" tone="success" className="text-xs font-mono uppercase">
                  {paymentMethodLabel(t, receipt)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-4 text-xs">
              <SummaryRow label={t('admin.ops.posReceipt.customer', 'Customer')} value={receipt.customer?.name || '—'} />
              {receipt.customer?.packageName ? (
                <SummaryRow label={t('admin.customers.list.colPackage', 'Package')} value={receipt.customer.packageName} />
              ) : null}
              {receipt.billingMonth ? (
                <SummaryRow label={t('admin.customerPayments.receipt.billingMonth', 'Billing month')} value={receipt.billingMonth} />
              ) : null}
              {receipt.collector ? (
                <SummaryRow label={t('admin.customerPayments.receipt.collectedBy', 'Collected by')} value={receipt.collector} />
              ) : null}
              <SummaryRow label={t('admin.ops.posReceipt.paymentDate', 'Payment date')} value={paidOn} mono />
              {receipt.trxId ? <SummaryRow label="TrxID" value={receipt.trxId} mono /> : null}
              <div className="flex items-center justify-between pt-1">
                <span className="text-muted-foreground font-semibold">{t('admin.ops.posReceipt.total', 'Total')}:</span>
                <span className="text-base font-bold font-mono text-emerald-500">
                  {formatBdtWithSymbol(receipt.amountBdt)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/60 backdrop-blur-md">
            <CardHeader className="border-b border-border/50 pb-3">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" />
                {t('admin.ops.posReceipt.printerTitle', 'Printer Formatting')}
              </CardTitle>
              <CardDescription className="text-xs">
                {t('admin.ops.posReceipt.printerDesc', 'Paper width, preview style and printed sections')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 text-xs">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-2">{t('admin.ops.posReceipt.paperWidth', 'Paper roll width')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['80mm', '58mm'] as const).map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setPaperWidth(w)}
                      className={`p-2.5 rounded-lg border text-center font-semibold transition ${
                        paperWidth === w
                          ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                          : 'border-border/70 bg-card/40 text-muted-foreground hover:border-border'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-2">{t('admin.ops.posReceipt.preview', 'Preview')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['paper', 'dark'] as const).map((theme) => (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => setPaperTheme(theme)}
                      className={`p-2.5 rounded-lg border text-center font-semibold transition ${
                        paperTheme === theme
                          ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                          : 'border-border/70 bg-card/40 text-muted-foreground hover:border-border'
                      }`}
                    >
                      {theme === 'paper'
                        ? t('admin.ops.posReceipt.themePaper', 'Thermal paper')
                        : t('admin.ops.posReceipt.themeDark', 'Dark preview')}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <span className="text-foreground">{t('admin.ops.posReceipt.companyContact', 'Company phone & address')}</span>
                <Switch aria-label={t('admin.ops.posReceipt.companyContact', 'Company phone & address')} checked={includeSupport} onCheckedChange={setIncludeSupport} />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/50">
                {receipt.customer ? (
                  <Can menu="sms_message" action="create">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={sendSms.isPending}
                      onClick={() => sendSms.mutate({ customerId: receipt.customer!.id, content: receiptSmsText(receipt, locale) })}
                      className="h-8 text-xs border-border/70 text-foreground"
                    >
                      <Send className="mr-1.5 h-3 w-3 text-primary" /> {t('admin.customers.expiredPage.sendSms', 'Send SMS')}
                    </Button>
                  </Can>
                ) : null}
                <Button size="sm" variant="outline" onClick={() => window.print()} className="h-8 text-xs border-border/70 text-foreground">
                  <Printer className="mr-1.5 h-3 w-3 text-primary" /> {t('admin.ops.posReceipt.print', 'Print')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7 flex justify-center py-2">
          <div
            id="thermal-pos-slip"
            className={`transition shadow-2xl relative select-none font-mono ${
              paperWidth === '80mm' ? 'w-full max-w-[380px]' : 'w-full max-w-[290px]'
            } ${
              paperTheme === 'paper'
                ? 'bg-[#fdfcf7] text-[#111111] border-x border-[#e2dfd2]'
                : 'bg-[#0f0919] text-[#e0daf0] border border-border/70'
            }`}
          >
            <div className="p-6 text-center space-y-3.5 text-xs">
              <div className="space-y-1">
                {receipt.issuer.name ? (
                  <div className="font-extrabold text-base tracking-wider uppercase">{receipt.issuer.name}</div>
                ) : null}
                {receipt.issuer.slogan ? <div className="text-xs font-semibold opacity-80">{receipt.issuer.slogan}</div> : null}
                {includeSupport && (receipt.issuer.phone || receipt.issuer.address) ? (
                  <div className="text-xs opacity-75 leading-tight pt-0.5">
                    {receipt.issuer.address ? <div>{receipt.issuer.address}</div> : null}
                    {receipt.issuer.phone ? <div>
                        {t('admin.customerPayments.receipt.tel', 'Tel')}: {receipt.issuer.phone}
                      </div> : null}
                  </div>
                ) : null}
              </div>

              <div className="border-t-2 border-dashed border-current opacity-40 my-2" />

              <div className="space-y-1 text-left text-xs">
                <SlipRow label={t('admin.ops.posReceipt.receiptNo', 'Receipt No')} value={receipt.invoiceNo} bold />
                <SlipRow label={t('admin.customerPayments.receipt.date', 'Date')} value={paidOn} />
                {receipt.collector ? <SlipRow label={t('admin.ops.posReceipt.collector', 'Collector')} value={receipt.collector} /> : null}
              </div>

              <div className="border-t border-dashed border-current opacity-40 my-2" />

              <div className="space-y-1 text-left text-xs">
                <SlipRow label={t('admin.ops.posReceipt.customer', 'Customer')} value={receipt.customer?.name || '—'} bold />
                {receipt.customer?.packageName ? (
                  <SlipRow label={t('admin.customers.list.colPackage', 'Package')} value={receipt.customer.packageName} />
                ) : null}
                {receipt.billingMonth ? <SlipRow label={t('admin.ops.posReceipt.month', 'Month')} value={receipt.billingMonth} /> : null}
                <SlipRow label={t('admin.customerPayments.receipt.method', 'Method')} value={paymentMethodLabel(t, receipt)} bold />
                {receipt.trxId ? <SlipRow label="TrxID" value={receipt.trxId} /> : null}
              </div>

              <div className="border-t-2 border-dashed border-current opacity-40 my-2 pt-2" />
              <div className="flex justify-between items-center text-sm font-extrabold">
                <span>{t('admin.ops.posReceipt.total', 'Total').toUpperCase()}:</span>
                <span className="text-base tracking-tight">
                  {formatBdtWithSymbol(receipt.amountBdt)}
                </span>
              </div>
              <div className="border-b-2 border-dashed border-current opacity-40 my-2" />

              <div className="py-1 text-center font-bold text-xs uppercase tracking-wider">{statusLine(t, receipt.status)}</div>

              <div className="pt-3 text-xs opacity-75 space-y-1 leading-relaxed border-t border-dashed border-current">
                <p className="font-semibold uppercase tracking-wider">{t('admin.ops.posReceipt.thanks', '*** Thank you ***')}</p>
                <p>{t('admin.ops.posReceipt.keepNote', 'Keep this receipt for payment verification.')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-border/40 gap-3">
      <span className="text-muted-foreground">{label}:</span>
      <span className={`font-semibold text-foreground text-right ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

function SlipRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="opacity-75">{label}:</span>
      <span className={bold ? 'font-bold text-right' : 'text-right'}>{value}</span>
    </div>
  );
}
